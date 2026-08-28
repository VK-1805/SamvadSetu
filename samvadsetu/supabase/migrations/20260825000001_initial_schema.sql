-- SamvadSetu — Initial Database Schema
-- Run via Supabase CLI: supabase db push
-- Or paste into Supabase SQL Editor

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'student', 'industry', 'admin')),
  institution TEXT,
  bio TEXT,
  district TEXT,
  impact_score INTEGER DEFAULT 0,
  resources_offered TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- PROBLEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 10 AND 200),
  description TEXT NOT NULL CHECK (char_length(description) >= 30),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN (
      'open', 'in_discussion', 'solution_proposed', 'evidence_submitted',
      'verification', 'verified_solved', 'needs_attention'
    )),
  district TEXT NOT NULL,
  block TEXT,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  image_url TEXT,
  sdg_tags INTEGER[] DEFAULT '{}',
  resources_needed TEXT[] DEFAULT '{}',
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  accepted_solution_id UUID,
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_escalated BOOLEAN DEFAULT false,
  escalated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- COMMENTS (threaded)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 2),
  is_solution BOOLEAN DEFAULT false,
  is_accepted BOOLEAN DEFAULT false,
  resources_offered TEXT[] DEFAULT '{}',
  skills_offered TEXT[] DEFAULT '{}',
  estimated_effort TEXT,
  implementation_notes TEXT,
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.problems
  DROP CONSTRAINT IF EXISTS fk_accepted_solution;
ALTER TABLE public.problems
  ADD CONSTRAINT fk_accepted_solution
  FOREIGN KEY (accepted_solution_id) REFERENCES public.comments(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────
-- VOTES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT vote_one_target CHECK (
    (problem_id IS NOT NULL AND comment_id IS NULL) OR
    (problem_id IS NULL AND comment_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_problem_vote
  ON public.votes (user_id, problem_id) WHERE problem_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unique_comment_vote
  ON public.votes (user_id, comment_id) WHERE comment_id IS NOT NULL;

-- ─────────────────────────────────────────────
-- EVIDENCE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES public.profiles(id),
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'document', 'report')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- VERIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
  verified_by UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_verification UNIQUE (evidence_id, verified_by)
);

-- ─────────────────────────────────────────────
-- ACTIVITY LOG (transparency ledger)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- PROBLEM LINKS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.problem_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_a UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  problem_b UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  linked_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_link UNIQUE (problem_a, problem_b),
  CONSTRAINT no_self_link CHECK (problem_a <> problem_b)
);

-- ─────────────────────────────────────────────
-- REPORTS (moderation)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_problems_status ON public.problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_category ON public.problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_district ON public.problems(district);
CREATE INDEX IF NOT EXISTS idx_problems_author ON public.problems(author_id);
CREATE INDEX IF NOT EXISTS idx_problems_created ON public.problems(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_problem ON public.comments(problem_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_votes_problem ON public.votes(problem_id);
CREATE INDEX IF NOT EXISTS idx_votes_comment ON public.votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_problem ON public.evidence(problem_id);
CREATE INDEX IF NOT EXISTS idx_activity_problem ON public.activity_log(problem_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_log(created_at DESC);
