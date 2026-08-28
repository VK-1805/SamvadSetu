-- SamvadSetu — RLS, Triggers, Functions, Storage

-- ─────────────────────────────────────────────
-- HELPER: admin check
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_problem_author(p_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.problems
    WHERE id = p_id AND author_id = auth.uid()
  );
$$;

-- ─────────────────────────────────────────────
-- PROFILE AUTO-CREATE ON SIGNUP
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, institution)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen'),
    NEW.raw_user_meta_data->>'institution'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- ACTIVITY LOG (append-only via triggers)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_activity(
  p_problem_id UUID,
  p_actor_id UUID,
  p_action TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_log (problem_id, actor_id, action, metadata)
  VALUES (p_problem_id, p_actor_id, p_action, p_metadata);
END;
$$;

-- ─────────────────────────────────────────────
-- VOTE COUNT SYNC
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_problem UUID;
  target_comment UUID;
  up_count INTEGER;
  down_count INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_problem := OLD.problem_id;
    target_comment := OLD.comment_id;
  ELSE
    target_problem := NEW.problem_id;
    target_comment := NEW.comment_id;
  END IF;

  IF target_problem IS NOT NULL THEN
    SELECT
      COUNT(*) FILTER (WHERE vote_type = 1),
      COUNT(*) FILTER (WHERE vote_type = -1)
    INTO up_count, down_count
    FROM public.votes WHERE problem_id = target_problem;

    UPDATE public.problems
    SET upvote_count = up_count, downvote_count = down_count
    WHERE id = target_problem;
  END IF;

  IF target_comment IS NOT NULL THEN
    SELECT
      COUNT(*) FILTER (WHERE vote_type = 1),
      COUNT(*) FILTER (WHERE vote_type = -1)
    INTO up_count, down_count
    FROM public.votes WHERE comment_id = target_comment;

    UPDATE public.comments
    SET upvote_count = up_count, downvote_count = down_count
    WHERE id = target_comment;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS votes_count_sync ON public.votes;
CREATE TRIGGER votes_count_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_vote_counts();

-- ─────────────────────────────────────────────
-- COMMENT COUNT SYNC
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pid UUID;
  cnt INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    pid := OLD.problem_id;
  ELSE
    pid := NEW.problem_id;
  END IF;

  SELECT COUNT(*) INTO cnt FROM public.comments WHERE problem_id = pid;
  UPDATE public.problems SET comment_count = cnt, updated_at = now() WHERE id = pid;

  -- Auto-transition open → in_discussion on first comment
  IF TG_OP = 'INSERT' THEN
    UPDATE public.problems
    SET status = 'in_discussion', updated_at = now()
    WHERE id = pid AND status = 'open';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS comments_count_sync ON public.comments;
CREATE TRIGGER comments_count_sync
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_comment_count();

-- ─────────────────────────────────────────────
-- ACCEPT SOLUTION RPC
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.accept_solution(p_id UUID, c_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  comment_row public.comments%ROWTYPE;
BEGIN
  IF NOT (public.is_problem_author(p_id) OR public.is_admin()) THEN
    RAISE EXCEPTION 'Not authorized to accept solutions';
  END IF;

  SELECT * INTO comment_row FROM public.comments
  WHERE id = c_id AND problem_id = p_id AND is_solution = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solution comment not found';
  END IF;

  UPDATE public.comments SET is_accepted = false WHERE problem_id = p_id;
  UPDATE public.comments SET is_accepted = true WHERE id = c_id;

  UPDATE public.problems
  SET accepted_solution_id = c_id,
      status = 'solution_proposed',
      updated_at = now()
  WHERE id = p_id;

  PERFORM public.log_activity(p_id, auth.uid(), 'solution_accepted', jsonb_build_object('comment_id', c_id));
END;
$$;

-- ─────────────────────────────────────────────
-- STATUS TRANSITION GUARD
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.guard_problem_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Only admin can set needs_attention or verified_solved directly
  IF NEW.status = 'verified_solved' AND NOT public.is_admin() THEN
    -- Allow via verification quorum trigger instead
    IF OLD.status NOT IN ('verification', 'evidence_submitted') THEN
      RAISE EXCEPTION 'Cannot jump to verified_solved';
    END IF;
  END IF;

  IF NEW.status = 'needs_attention' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admin can escalate to needs_attention';
  END IF;

  PERFORM public.log_activity(
    NEW.id, auth.uid(), 'status_changed',
    jsonb_build_object('oldStatus', OLD.status, 'newStatus', NEW.status)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS problem_status_guard ON public.problems;
CREATE TRIGGER problem_status_guard
  BEFORE UPDATE OF status ON public.problems
  FOR EACH ROW EXECUTE FUNCTION public.guard_problem_status();

-- ─────────────────────────────────────────────
-- VERIFICATION QUORUM (3 confirmations)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_verification_quorum()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  confirmed_count INTEGER;
  ev_record public.evidence%ROWTYPE;
BEGIN
  IF NEW.status <> 'confirmed' THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO confirmed_count
  FROM public.verifications
  WHERE evidence_id = NEW.evidence_id AND status = 'confirmed';

  SELECT * INTO ev_record FROM public.evidence WHERE id = NEW.evidence_id;

  IF confirmed_count >= 1 AND confirmed_count < 3 THEN
    UPDATE public.problems
    SET status = 'verification', updated_at = now()
    WHERE id = ev_record.problem_id
      AND status IN ('solution_proposed', 'evidence_submitted');
  END IF;

  IF confirmed_count >= 3 THEN
    UPDATE public.problems
    SET status = 'verified_solved', updated_at = now()
    WHERE id = ev_record.problem_id;
  END IF;

  PERFORM public.log_activity(
    ev_record.problem_id, NEW.verified_by, 'verification_confirmed',
    jsonb_build_object('verification_id', NEW.id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS verification_quorum ON public.verifications;
CREATE TRIGGER verification_quorum
  AFTER INSERT ON public.verifications
  FOR EACH ROW EXECUTE FUNCTION public.check_verification_quorum();

-- Evidence submitted → status update
CREATE OR REPLACE FUNCTION public.on_evidence_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.problems
  SET status = 'evidence_submitted', updated_at = now()
  WHERE id = NEW.problem_id AND status = 'solution_proposed';

  PERFORM public.log_activity(
    NEW.problem_id, NEW.submitted_by, 'evidence_submitted',
    jsonb_build_object('evidence_id', NEW.id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS evidence_submitted ON public.evidence;
CREATE TRIGGER evidence_submitted
  AFTER INSERT ON public.evidence
  FOR EACH ROW EXECUTE FUNCTION public.on_evidence_submitted();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Problems
CREATE POLICY "problems_select_all" ON public.problems FOR SELECT USING (true);
CREATE POLICY "problems_insert_auth" ON public.problems FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "problems_update_own_or_admin" ON public.problems FOR UPDATE
  USING (auth.uid() = author_id OR public.is_admin());
CREATE POLICY "problems_delete_own_or_admin" ON public.problems FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

-- Comments
CREATE POLICY "comments_select_all" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "comments_delete_own_or_admin" ON public.comments FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

-- Votes (users see only their own votes)
CREATE POLICY "votes_select_own" ON public.votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "votes_insert_own" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_update_own" ON public.votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "votes_delete_own" ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- Evidence
CREATE POLICY "evidence_select_all" ON public.evidence FOR SELECT USING (true);
CREATE POLICY "evidence_insert_auth" ON public.evidence FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Verifications
CREATE POLICY "verifications_select_all" ON public.verifications FOR SELECT USING (true);
CREATE POLICY "verifications_insert_auth" ON public.verifications FOR INSERT
  WITH CHECK (
    auth.uid() = verified_by
    AND auth.uid() <> (SELECT submitted_by FROM public.evidence WHERE id = evidence_id)
  );

-- Activity log (read-only from client)
CREATE POLICY "activity_select_all" ON public.activity_log FOR SELECT USING (true);

-- Problem links
CREATE POLICY "links_select_all" ON public.problem_links FOR SELECT USING (true);
CREATE POLICY "links_insert_auth" ON public.problem_links FOR INSERT WITH CHECK (auth.uid() = linked_by);

-- Reports
CREATE POLICY "reports_select_own_or_admin" ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id OR public.is_admin());
CREATE POLICY "reports_insert_auth" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_update_admin" ON public.reports FOR UPDATE USING (public.is_admin());

-- ─────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('problem-images', 'problem-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('evidence-files', 'evidence-files', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "problem_images_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'problem-images');
CREATE POLICY "problem_images_auth_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'problem-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "problem_images_own_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'problem-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "problem_images_own_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'problem-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "evidence_files_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'evidence-files');
CREATE POLICY "evidence_files_auth_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'evidence-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "evidence_files_own_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'evidence-files' AND auth.uid()::text = (storage.foldername(name))[1]);
