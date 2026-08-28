import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/db';
import {
  StatusBadge, VoteControl, Badge, Button, Input,
  Textarea, Card, Avatar, EmptyState, LoadingState
} from '../components/ui';
import {
  MapPin, MessageSquare, Clock, User, Award, ShieldCheck, CheckCheck,
  Send, Sparkles, AlertCircle, FileSpreadsheet, Plus, HelpCircle,
  FileCheck, Pencil, Reply, Trash2
} from 'lucide-react';
import { CATEGORIES, RESOURCE_TYPES, SDG_GOALS } from '../constants';
import { timeAgo, formatDate, cn } from '../utils';
import toast from 'react-hot-toast';

export default function ProblemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isAdmin } = useAuth();

  const [problem, setProblem] = useState(null);
  const [comments, setComments] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User vote state
  const [userVote, setUserVote] = useState(0);
  const [commentVotes, setCommentVotes] = useState({});

  // Forms
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSolutionProposal, setIsSolutionProposal] = useState(false);
  const [skillsOffered, setSkillsOffered] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState('');
  const [implNotes, setImplNotes] = useState('');
  const [resourcesOffered, setResourcesOffered] = useState([]);

  // Evidence upload form
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');

  // Verification modal state
  const [verifyingEvidenceId, setVerifyingEvidenceId] = useState(null);

  // Related problems
  const [relatedProblems, setRelatedProblems] = useState([]);
  const [verificationNotes, setVerificationNotes] = useState('');

  const fetchAllData = useCallback(async () => {
    try {
      const probData = await dbService.getProblemById(id);
      if (!probData) {
        setError('Problem statement not found');
        return;
      }
      setProblem(probData);

      const comms = await dbService.getComments(id);
      setComments(comms);

      const evs = await dbService.getEvidence(id);
      setEvidence(evs);

      const acts = await dbService.getActivities(id);
      setActivities(acts);

      // Fetch related problems
      try {
        const related = await dbService.getRelatedProblems(id, probData.category, probData.district);
        setRelatedProblems(related);
      } catch { /* non-critical */ }

      // Load user votes
      if (user) {
        const vote = await dbService.getVote(user.id, id, null);
        setUserVote(vote ? vote.vote_type : 0);

        if (comms.length) {
          const cVotes = await dbService.getCommentVotes(user.id, comms.map((c) => c.id));
          const voteMap = {};
          cVotes.forEach((v) => { voteMap[v.comment_id] = v.vote_type; });
          setCommentVotes(voteMap);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote');
      return;
    }
    try {
      await dbService.castVote({
        userId: user.id,
        problemId: id,
        voteType
      });
      setUserVote(voteType);
      
      // Update problem state locally to avoid refetching
      setProblem(prev => {
        let diffUp = 0;
        let diffDown = 0;
        if (voteType === 1) {
          if (userVote === -1) diffDown = -1;
          diffUp = 1;
        } else if (voteType === -1) {
          if (userVote === 1) diffUp = -1;
          diffDown = 1;
        } else {
          if (userVote === 1) diffUp = -1;
          if (userVote === -1) diffDown = -1;
        }
        return {
          ...prev,
          upvote_count: prev.upvote_count + diffUp,
          downvote_count: prev.downvote_count + diffDown
        };
      });
      toast.success(voteType === 1 ? 'Upvoted problem' : voteType === -1 ? 'Downvoted problem' : 'Removed vote');
    } catch (err) {
      toast.error('Failed to vote');
    }
  };

  const handleCommentVote = async (commentId, voteType, currentUserVote) => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote');
      return;
    }
    try {
      await dbService.castVote({
        userId: user.id,
        commentId,
        voteType,
      });

      setCommentVotes((prev) => {
        const next = { ...prev };
        if (voteType === 0) delete next[commentId];
        else next[commentId] = voteType;
        return next;
      });

      setComments((prev) => prev.map((c) => {
        if (c.id !== commentId) return c;
        let diffUp = 0;
        let diffDown = 0;
        if (voteType === 1) {
          if (currentUserVote === -1) diffDown = -1;
          diffUp = 1;
        } else if (voteType === -1) {
          if (currentUserVote === 1) diffUp = -1;
          diffDown = 1;
        } else {
          if (currentUserVote === 1) diffUp = -1;
          if (currentUserVote === -1) diffDown = -1;
        }
        return {
          ...c,
          upvote_count: Math.max(0, (c.upvote_count || 0) + diffUp),
          downvote_count: Math.max(0, (c.downvote_count || 0) + diffDown),
        };
      }));
    } catch (err) {
      toast.error('Failed to vote on comment');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      const payload = {
        problem_id: id,
        author_id: user.id,
        parent_id: null,
        content: commentContent.trim(),
        is_solution: isSolutionProposal,
        resources_offered: isSolutionProposal ? resourcesOffered : [],
        skills_offered: isSolutionProposal && skillsOffered ? skillsOffered.split(',').map(s => s.trim()) : [],
        estimated_effort: isSolutionProposal ? estimatedEffort : null,
        implementation_notes: isSolutionProposal ? implNotes : null,
      };

      await dbService.createComment(payload);
      toast.success(isSolutionProposal ? 'Solution proposal posted!' : 'Comment posted');

      setCommentContent('');
      setIsSolutionProposal(false);
      setSkillsOffered('');
      setEstimatedEffort('');
      setImplNotes('');
      setResourcesOffered([]);

      fetchAllData();
    } catch (err) {
      toast.error('Failed to add response');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo) return;

    try {
      await dbService.createComment({
        problem_id: id,
        author_id: user.id,
        parent_id: replyingTo,
        content: replyContent.trim(),
        is_solution: false,
        resources_offered: [],
        skills_offered: [],
        estimated_effort: null,
        implementation_notes: null,
      });
      toast.success('Reply posted!');
      setReplyContent('');
      setReplyingTo(null);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to post reply');
    }
  };

  const handleAcceptSolution = async (commentId) => {
    try {
      await dbService.acceptSolution(id, commentId, user.id);
      toast.success('Solution marked as accepted! Status updated to Solution Proposed.');
      fetchAllData();
    } catch (err) {
      toast.error('Failed to accept solution');
    }
  };

  const toggleResourceOffered = (val) => {
    setResourcesOffered(prev => 
      prev.includes(val) ? prev.filter(r => r !== val) : [...prev, val]
    );
  };

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!evidenceDesc.trim()) return;

    try {
      let fileUrl = evidenceUrl;
      let fileType = 'image';
      
      // Handle file upload
      if (evidenceFile) {
        // In mock mode: create a local object URL for preview
        // In real mode: this would upload to Supabase Storage
        fileUrl = URL.createObjectURL(evidenceFile);
        fileType = evidenceFile.type.startsWith('image/') ? 'image' : 'document';
      }
      
      // Fallback to placeholder if no file or URL provided
      if (!fileUrl) {
        fileUrl = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600';
      }
      
      await dbService.submitEvidence({
        problem_id: id,
        solution_id: problem.accepted_solution_id,
        submitted_by: user.id,
        file_url: fileUrl,
        file_type: fileType,
        description: evidenceDesc.trim()
      });

      toast.success('Evidence submitted successfully! Undergoing community verification.');
      setEvidenceDesc('');
      setEvidenceUrl('');
      setEvidenceFile(null);
      setShowEvidenceModal(false);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to submit evidence');
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!verifyingEvidenceId) return;

    try {
      await dbService.verifyEvidence({
        problem_id: id,
        evidence_id: verifyingEvidenceId,
        verified_by: user.id,
        status: 'confirmed',
        notes: verificationNotes.trim()
      });

      toast.success('Verification recorded! Thank you.');
      setVerificationNotes('');
      setVerifyingEvidenceId(null);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to verify evidence');
    }
  };

  const handleDeleteProblem = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this problem and all its comments, votes, and evidence? This action cannot be undone.')) {
      return;
    }

    try {
      await dbService.deleteProblem(id, { id: user.id, role: profile?.role });
      toast.success('Problem deleted successfully');
      navigate('/feed');
    } catch (err) {
      toast.error(err.message || 'Failed to delete problem');
    }
  };

  const handleDeleteSolution = async (solutionId) => {
    const isAccepted = problem.accepted_solution_id === solutionId;
    const hasEvidence = evidence.some(e => e.solution_id === solutionId);

    let confirmMsg = 'Are you sure you want to delete this solution proposal?';
    if (hasEvidence) {
      confirmMsg = 'Warning: This solution has associated evidence of work submitted. Deleting this solution will permanently delete all associated evidence and community verifications, and revert the problem status. Are you sure you want to proceed?';
    } else if (isAccepted) {
      confirmMsg = 'This is the accepted solution for this problem. Deleting it will reset the problem status back to "In Discussion". Are you sure you want to proceed?';
    }

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      await dbService.deleteComment(solutionId, { id: user.id, role: profile?.role });
      toast.success('Solution proposal deleted');
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete solution proposal');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await dbService.deleteComment(commentId, { id: user.id, role: profile?.role });
      toast.success('Comment deleted');
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete comment');
    }
  };

  if (loading) return <LoadingState message="Loading details..." />;
  if (error) return <div className="page-container py-12"><Card className="bg-red-50"><AlertCircle className="h-6 w-6 text-danger mb-2" /><p className="text-body font-semibold text-text">{error}</p></Card></div>;

  const category = CATEGORIES.find(c => c.value === problem.category);
  const matchedSdg = SDG_GOALS.filter(g => problem.sdg_tags?.includes(g.id));

  // Partition comments
  const solutionProposals = comments.filter(c => c.is_solution);
  const topLevelDiscussions = comments.filter(c => !c.is_solution && !c.parent_id);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parent_id && !c.is_solution) {
      if (!acc[c.parent_id]) acc[c.parent_id] = [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {});

  const canEdit = isAuthenticated && (user?.id === problem.author_id || isAdmin);

  return (
    <div className="page-container py-8">
      {/* Back button */}
      <Link to="/feed" className="inline-flex items-center gap-1.5 text-body-sm text-text-muted hover:text-text mb-6">
        &larr; Back to Feed
      </Link>

      {/* Title & Status */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        
        {/* Main Info */}
        <div className="flex-1 min-w-0 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={problem.status} size="md" />
              {category && <Badge size="md" color="primary">{category.icon} {category.label}</Badge>}
              {problem.is_featured && <Badge size="md" color="secondary">✨ Featured</Badge>}
              {problem.is_escalated && <Badge size="md" color="danger">⚠️ Escalated</Badge>}
            </div>
            <h1 className="text-display font-display text-text leading-tight">{problem.title}</h1>

            {canEdit && (
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/problems/${id}/edit`}>
                  <Button variant="outline" size="sm" icon={Pencil}>Edit Problem</Button>
                </Link>
                <Button variant="danger" size="sm" icon={Trash2} onClick={handleDeleteProblem}>
                  Delete Problem
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-text-muted border-b border-border pb-4">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {problem.district}{problem.block ? `, ${problem.block}` : ''}{problem.location_name ? ` (${problem.location_name})` : ''}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Reported {timeAgo(problem.created_at)}</span>
              {problem.author && <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-text-light" /> Reported by {problem.author.name} ({problem.author.role})</span>}
            </div>
          </div>

          {/* Description */}
          <div className="card space-y-4">
            <h2 className="text-heading-sm font-semibold text-text">Problem Statement Description</h2>
            <p className="text-body text-text whitespace-pre-wrap leading-relaxed">{problem.description}</p>
            {problem.image_url && (
              <img
                src={problem.image_url}
                alt="Problem attachment"
                className="rounded-xl max-h-96 w-full object-cover mt-4"
              />
            )}
          </div>

          {/* SDGs */}
          {matchedSdg.length > 0 && (
            <Card>
              <h2 className="text-heading-sm font-semibold text-text mb-3">SDG Alignment</h2>
              <div className="flex flex-wrap gap-2">
                {matchedSdg.map(sdg => (
                  <span
                    key={sdg.id}
                    style={{ borderColor: sdg.color, color: sdg.color }}
                    className="inline-flex items-center gap-2 border px-3 py-1 rounded-xl text-caption font-semibold"
                  >
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: sdg.color }} />
                    {sdg.id}. {sdg.title}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Resources Needed */}
          {problem.resources_needed && problem.resources_needed.length > 0 && (
            <Card>
              <h2 className="text-heading-sm font-semibold text-text mb-3">Resources/Support Required</h2>
              <div className="flex flex-wrap gap-2">
                {problem.resources_needed.map(resVal => {
                  const res = RESOURCE_TYPES.find(r => r.value === resVal);
                  return res ? (
                    <Badge key={resVal} color="secondary" size="md">
                      {res.icon} {res.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            </Card>
          )}

          {/* EVIDENCE SUBMITTED SECTION */}
          {evidence.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-heading font-semibold text-text flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-accent" />
                  Submitted Evidence ({evidence.length})
                </h2>
              </div>
              <div className="grid gap-4">
                {evidence.map(evItem => (
                  <EvidenceCard
                    key={evItem.id}
                    evidence={evItem}
                    problem={problem}
                    currentUser={user}
                    onVerifyClick={(id) => setVerifyingEvidenceId(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SOLUTIONS SECTION */}
          <div className="space-y-4">
            <h2 className="text-heading font-semibold text-text flex items-center gap-2">
              <Award className="h-5 w-5 text-secondary" />
              Proposed Solutions ({solutionProposals.length})
            </h2>
            {solutionProposals.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No solution proposals yet"
                description="Are you a student or industry professional? Propose a collaborative solution to start working on this project."
              />
            ) : (
              <div className="grid gap-4">
                {solutionProposals.map(sol => (
                  <SolutionCard
                    key={sol.id}
                    solution={sol}
                    isAuthor={user?.id === problem.author_id}
                    problemStatus={problem.status}
                    onAccept={() => handleAcceptSolution(sol.id)}
                    acceptedSolutionId={problem.accepted_solution_id}
                    userVote={commentVotes[sol.id] || 0}
                    onVote={(voteType) => handleCommentVote(sol.id, voteType, commentVotes[sol.id] || 0)}
                    isAuthenticated={isAuthenticated}
                    currentUser={user}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteSolution}
                    onRefresh={fetchAllData}
                  />
                ))}
              </div>
            )}
          </div>

          {/* DISCUSSION SECTION */}
          <div className="space-y-4">
            <h2 className="text-heading font-semibold text-text flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-text-muted" />
              Comments & Discussion ({comments.filter(c => !c.is_solution).length})
            </h2>
            {topLevelDiscussions.length === 0 ? (
              <p className="text-body-sm text-text-muted italic px-2">No comments yet. Start the conversation below.</p>
            ) : (
              <div className="grid gap-3">
                {topLevelDiscussions.map(c => (
                  <CommentCard
                    key={c.id}
                    comment={c}
                    replies={repliesByParent[c.id] || []}
                    userVote={commentVotes[c.id] || 0}
                    commentVotes={commentVotes}
                    onVote={handleCommentVote}
                    isAuthenticated={isAuthenticated}
                    replyingTo={replyingTo}
                    replyContent={replyContent}
                    onReplyClick={(commentId) => {
                      setReplyingTo(replyingTo === commentId ? null : commentId);
                      setReplyContent('');
                    }}
                    onReplyChange={setReplyContent}
                    onReplySubmit={handleReplySubmit}
                    onCancelReply={() => { setReplyingTo(null); setReplyContent(''); }}
                    currentUser={user}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteComment}
                    onRefresh={fetchAllData}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ADD RESPONSE FORM */}
          {isAuthenticated ? (
            <Card>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-heading-sm font-semibold text-text">Post a Response</h3>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSolutionProposal}
                      onChange={(e) => setIsSolutionProposal(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-body-sm font-medium text-text-muted">Propose as Formal Solution</span>
                  </label>
                </div>

                {isSolutionProposal && (
                  <div className="p-4 rounded-xl border border-secondary/30 bg-secondary-50/30 space-y-4 animate-fade-in-down">
                    <div className="space-y-2">
                      <label className="block text-body-sm font-medium text-text">Select Resources Offered</label>
                      <div className="flex flex-wrap gap-2">
                        {RESOURCE_TYPES.map(res => (
                          <button
                            key={res.value}
                            type="button"
                            onClick={() => toggleResourceOffered(res.value)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg border text-caption font-medium transition-colors',
                              resourcesOffered.includes(res.value)
                                ? 'bg-secondary text-white border-secondary'
                                : 'bg-surface border-border text-text-muted'
                            )}
                          >
                            {res.icon} {res.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Skills Required / Offered"
                        placeholder="e.g. Water Testing, Plumbing, Web Dev"
                        value={skillsOffered}
                        onChange={(e) => setSkillsOffered(e.target.value)}
                      />
                      <Input
                        label="Estimated Implementation Effort"
                        placeholder="e.g. 2 weeks, 1 month"
                        value={estimatedEffort}
                        onChange={(e) => setEstimatedEffort(e.target.value)}
                      />
                    </div>
                    <Textarea
                      label="Implementation Notes"
                      placeholder="Step-by-step approach on how you plan to implement this solution..."
                      value={implNotes}
                      onChange={(e) => setImplNotes(e.target.value)}
                    />
                  </div>
                )}

                <Textarea
                  placeholder={isSolutionProposal ? 'Describe your solution proposal in detail...' : 'Ask a question or add your feedback...'}
                  required
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                />

                <div className="flex justify-end">
                  <Button type="submit" variant={isSolutionProposal ? 'secondary' : 'primary'} icon={Send}>
                    Submit Response
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="text-center p-6 bg-surface-alt/50 border-dashed">
              <p className="text-body-sm text-text-muted mb-3">Please log in to join the discussion or propose a solution.</p>
              <Link to="/login"><Button variant="primary" size="sm">Log In</Button></Link>
            </Card>
          )}

        </div>

        {/* SIDEBAR: Votes & Ledger */}
        <div className="w-full lg:w-88 flex-shrink-0 space-y-6">
          {/* Vote box */}
          <Card className="text-center p-6">
            <h3 className="text-heading-sm font-semibold text-text mb-4">Urgency & Impact Voting</h3>
            <div className="flex justify-center mb-4">
              <VoteControl
                upvotes={problem.upvote_count || 0}
                downvotes={problem.downvote_count || 0}
                userVote={userVote}
                onVote={handleVote}
                vertical={false}
              />
            </div>
            <p className="text-caption text-text-muted">
              Upvote to increase visibility. Higher votes signal urgency to local bodies and administrative teams.
            </p>
          </Card>

          {/* Submit evidence button */}
          {isAuthenticated && problem.accepted_solution_id && problem.status === 'solution_proposed' && (
            <Button
              variant="accent"
              size="lg"
              fullWidth
              icon={Plus}
              onClick={() => setShowEvidenceModal(true)}
            >
              Submit Evidence of Work
            </Button>
          )}

          {/* Transparency activity ledger */}
          <Card className="space-y-4">
            <h3 className="text-heading-sm font-semibold text-text border-b border-border pb-2">Transparency Ledger</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide pr-1">
              {activities.length === 0 ? (
                <p className="text-caption text-text-muted italic">No activities recorded yet.</p>
              ) : (
                activities.map(act => (
                  <ActivityItem key={act.id} activity={act} />
                ))
              )}
            </div>
          </Card>

          {/* Related Problems */}
          {relatedProblems.length > 0 && (
            <Card className="space-y-3">
              <h3 className="text-heading-sm font-semibold text-text border-b border-border pb-2">Related Problems</h3>
              <div className="space-y-2.5">
                {relatedProblems.map(rp => (
                  <Link
                    key={rp.id}
                    to={`/problems/${rp.id}`}
                    className="block p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary-50/5 transition-all group"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <StatusBadge status={rp.status} size="sm" />
                    </div>
                    <h4 className="text-caption font-semibold text-text line-clamp-2 group-hover:text-primary transition-colors">
                      {rp.title}
                    </h4>
                    <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {rp.district}
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

      </div>

      {/* EVIDENCE SUBMISSION MODAL */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEvidenceModal(false)} />
          <Card className="relative bg-surface w-full max-w-lg animate-scale-in z-10 space-y-4">
            <h2 className="text-heading font-semibold text-text">Submit Implementation Evidence</h2>
            <p className="text-body-sm text-text-muted">
              Prove the solution has been implemented successfully by submitting a photo URL or report explanation.
            </p>
            <form onSubmit={handleEvidenceSubmit} className="space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-body-sm font-medium text-text">Upload Evidence File</label>
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-accent transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error('File too large. Maximum 10MB.');
                          return;
                        }
                        setEvidenceFile(file);
                        setEvidenceUrl('');
                      }
                    }}
                    className="hidden"
                    id="evidence-file-input"
                  />
                  <label htmlFor="evidence-file-input" className="cursor-pointer">
                    {evidenceFile ? (
                      <div className="space-y-2">
                        {evidenceFile.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(evidenceFile)}
                            alt="Preview"
                            className="max-h-40 mx-auto rounded-lg object-cover"
                          />
                        ) : (
                          <div className="p-3 bg-surface-alt rounded-lg inline-block">
                            <FileSpreadsheet className="h-8 w-8 text-accent mx-auto" />
                          </div>
                        )}
                        <p className="text-body-sm text-text font-medium">{evidenceFile.name}</p>
                        <p className="text-caption text-text-muted">{(evidenceFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div className="space-y-2 py-2">
                        <Plus className="h-8 w-8 text-text-muted mx-auto" />
                        <p className="text-body-sm text-text-muted">Click to upload photo or PDF</p>
                        <p className="text-caption text-text-light">JPEG, PNG, WebP, or PDF up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* URL alternative */}
              {!evidenceFile && (
                <Input
                  label="Or paste a URL"
                  placeholder="e.g. https://... hosted image or Google Drive PDF"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  hint="Provide a valid hosted image or report URL."
                />
              )}
              <Textarea
                label="Verification Report"
                required
                placeholder="Describe how the solution was built, what materials were used, and the current status..."
                value={evidenceDesc}
                onChange={(e) => setEvidenceDesc(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowEvidenceModal(false)}>Cancel</Button>
                <Button type="submit" variant="accent">Submit Evidence</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* VERIFICATION MODAL */}
      {verifyingEvidenceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setVerifyingEvidenceId(null)} />
          <Card className="relative bg-surface w-full max-w-md animate-scale-in z-10 space-y-4">
            <h2 className="text-heading font-semibold text-text flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-accent" />
              Verify Evidence of Resolution
            </h2>
            <p className="text-body-sm text-text-muted">
              Confirm if this evidence accurately represents a solved status for this local problem.
            </p>
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <Textarea
                label="Verification Notes"
                required
                placeholder="Write notes about your visit, check, or confirmation details..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setVerifyingEvidenceId(null)}>Cancel</Button>
                <Button type="submit" variant="accent">Confirm Solved Status</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

// Sub-components
function SolutionCard({
  solution, isAuthor, problemStatus, onAccept, acceptedSolutionId,
  userVote = 0, onVote, isAuthenticated, currentUser, isAdmin, onDelete, onRefresh,
}) {
  const isAccepted = acceptedSolutionId === solution.id;
  const canModify = isAuthenticated && (currentUser?.id === solution.author_id || isAdmin);

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(solution.content || '');
  const [skillsOffered, setSkillsOffered] = useState(solution.skills_offered?.join(', ') || '');
  const [estimatedEffort, setEstimatedEffort] = useState(solution.estimated_effort || '');
  const [implNotes, setImplNotes] = useState(solution.implementation_notes || '');
  const [resourcesOffered, setResourcesOffered] = useState(solution.resources_offered || []);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      await dbService.updateComment(solution.id, {
        content: content.trim(),
        skills_offered: skillsOffered ? skillsOffered.split(',').map(s => s.trim()).filter(Boolean) : [],
        estimated_effort: estimatedEffort.trim() || null,
        implementation_notes: implNotes.trim() || null,
        resources_offered: resourcesOffered,
      }, currentUser);

      toast.success('Solution proposal updated');
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update solution');
    } finally {
      setSaving(false);
    }
  };

  const toggleResourceOffered = (val) => {
    setResourcesOffered(prev =>
      prev.includes(val) ? prev.filter(r => r !== val) : [...prev, val]
    );
  };

  return (
    <div className={cn(
      'p-5 border rounded-2xl transition-all duration-200 bg-surface',
      isAccepted ? 'border-success bg-emerald-50/10' : 'border-border'
    )}>
      <div className="flex gap-4">
        {!isEditing && (
          <div className="hidden sm:block pt-1 flex-shrink-0">
            <VoteControl
              upvotes={solution.upvote_count || 0}
              downvotes={solution.downvote_count || 0}
              userVote={userVote}
              onVote={isAuthenticated ? onVote : undefined}
              disabled={!isAuthenticated}
              size="sm"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
            <div className="flex items-center gap-3">
              <Avatar name={solution.author?.name} src={solution.author?.avatar_url} role={solution.author?.role} size="sm" />
              <div>
                <h4 className="text-body-sm font-semibold text-text">{solution.author?.name}</h4>
                <p className="text-caption text-text-muted capitalize">{solution.author?.role} • {timeAgo(solution.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAccepted ? (
                <span className="inline-flex items-center gap-1 text-success text-body-sm font-semibold px-2 py-0.5 bg-success-light rounded-full">
                  <CheckCheck className="h-4 w-4" /> Accepted Solution
                </span>
              ) : (
                isAuthor && ['open', 'in_discussion', 'solution_proposed'].includes(problemStatus) && !acceptedSolutionId && !isEditing && (
                  <Button variant="outline" size="sm" onClick={onAccept}>
                    Accept Solution
                  </Button>
                )
              )}

              {canModify && !isEditing && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setContent(solution.content || '');
                      setSkillsOffered(solution.skills_offered?.join(', ') || '');
                      setEstimatedEffort(solution.estimated_effort || '');
                      setImplNotes(solution.implementation_notes || '');
                      setResourcesOffered(solution.resources_offered || []);
                      setIsEditing(true);
                    }}
                    className="p-1.5 text-text-muted hover:text-primary hover:bg-surface-alt rounded-lg transition-colors"
                    title="Edit Solution"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(solution.id)}
                    className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-50 rounded-lg transition-colors"
                    title="Delete Solution"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <Textarea
                placeholder="Describe your solution proposal in detail..."
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              <div className="p-4 rounded-xl border border-secondary/30 bg-secondary-50/30 space-y-4">
                <div className="space-y-2">
                  <label className="block text-body-sm font-medium text-text">Select Resources Offered</label>
                  <div className="flex flex-wrap gap-2">
                    {RESOURCE_TYPES.map(res => (
                      <button
                        key={res.value}
                        type="button"
                        onClick={() => toggleResourceOffered(res.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg border text-caption font-medium transition-colors',
                          resourcesOffered.includes(res.value)
                            ? 'bg-secondary text-white border-secondary'
                            : 'bg-surface border-border text-text-muted'
                        )}
                      >
                        {res.icon} {res.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Skills Required / Offered"
                    placeholder="e.g. Water Testing, Plumbing, Web Dev"
                    value={skillsOffered}
                    onChange={(e) => setSkillsOffered(e.target.value)}
                  />
                  <Input
                    label="Estimated Implementation Effort"
                    placeholder="e.g. 2 weeks, 1 month"
                    value={estimatedEffort}
                    onChange={(e) => setEstimatedEffort(e.target.value)}
                  />
                </div>
                <Textarea
                  label="Implementation Notes"
                  placeholder="Step-by-step approach on how you plan to implement this solution..."
                  value={implNotes}
                  onChange={(e) => setImplNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" variant="secondary" size="sm" loading={saving}>Save Changes</Button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-body-sm text-text leading-relaxed mb-4">{solution.content}</p>

              {solution.resources_offered && solution.resources_offered.length > 0 && (
                <div className="space-y-1.5">
                  <h5 className="text-caption font-semibold text-text-muted">Resources Pledged:</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {solution.resources_offered.map(r => {
                      const res = RESOURCE_TYPES.find(rt => rt.value === r);
                      return res ? (
                        <span key={r} className="text-caption px-2 py-0.5 bg-secondary-50 text-secondary-dark rounded-md border border-secondary-200">
                          {res.icon} {res.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {solution.skills_offered && solution.skills_offered.length > 0 && (
                <div className="space-y-1.5 mt-2.5">
                  <h5 className="text-caption font-semibold text-text-muted">Skills/Domain Offered:</h5>
                  <div className="flex flex-wrap gap-1">
                    {solution.skills_offered.map(s => (
                      <span key={s} className="text-caption px-2 py-0.5 bg-primary-50 text-primary rounded-md border border-primary-200">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {solution.estimated_effort && (
                <div className="text-caption text-text-muted mt-3">
                  Estimated completion time: <span className="font-semibold text-text">{solution.estimated_effort}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplyItem({
  reply, commentVotes, onVote, isAuthenticated,
  currentUser, isAdmin, onDelete, onRefresh,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(reply.content || '');
  const [saving, setSaving] = useState(false);

  const canModify = isAuthenticated && (currentUser?.id === reply.author_id || isAdmin);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      await dbService.updateComment(reply.id, { content: content.trim() }, currentUser);
      toast.success('Reply updated');
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update reply');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3 border border-border/60 rounded-xl bg-surface-alt/30">
      <div className="flex gap-2">
        {!isEditing && (
          <div className="hidden sm:block flex-shrink-0">
            <VoteControl
              upvotes={reply.upvote_count || 0}
              downvotes={reply.downvote_count || 0}
              userVote={commentVotes[reply.id] || 0}
              onVote={isAuthenticated ? (vt) => onVote(reply.id, vt, commentVotes[reply.id] || 0) : undefined}
              disabled={!isAuthenticated}
              size="sm"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Avatar name={reply.author?.name} src={reply.author?.avatar_url} role={reply.author?.role} size="xs" />
              <span className="text-body-sm font-semibold text-text">{reply.author?.name}</span>
              <span className="text-caption text-text-muted">{timeAgo(reply.created_at)}</span>
            </div>

            {canModify && !isEditing && (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => {
                    setContent(reply.content || '');
                    setIsEditing(true);
                  }}
                  className="p-1 text-text-muted hover:text-primary hover:bg-surface-alt rounded transition-colors"
                  title="Edit Reply"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(reply.id)}
                  className="p-1 text-text-muted hover:text-danger hover:bg-danger-50 rounded transition-colors"
                  title="Delete Reply"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-2 mt-2">
              <Textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-end gap-1.5">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" loading={saving}>Save</Button>
              </div>
            </form>
          ) : (
            <p className="text-body-sm text-text whitespace-pre-wrap">{reply.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentCard({
  comment, replies = [], userVote = 0, commentVotes = {},
  onVote, isAuthenticated, replyingTo, replyContent,
  onReplyClick, onReplyChange, onReplySubmit, onCancelReply,
  currentUser, isAdmin, onDelete, onRefresh,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content || '');
  const [saving, setSaving] = useState(false);

  const canModify = isAuthenticated && (currentUser?.id === comment.author_id || isAdmin);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      await dbService.updateComment(comment.id, { content: content.trim() }, currentUser);
      toast.success('Comment updated');
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update comment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="p-4 border border-border rounded-xl bg-surface">
        <div className="flex gap-3">
          {!isEditing && (
            <div className="hidden sm:block pt-0.5 flex-shrink-0">
              <VoteControl
                upvotes={comment.upvote_count || 0}
                downvotes={comment.downvote_count || 0}
                userVote={userVote}
                onVote={isAuthenticated ? (vt) => onVote(comment.id, vt, userVote) : undefined}
                disabled={!isAuthenticated}
                size="sm"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <Avatar name={comment.author?.name} src={comment.author?.avatar_url} role={comment.author?.role} size="sm" />
                <div>
                  <h4 className="text-body-sm font-semibold text-text">{comment.author?.name}</h4>
                  <p className="text-caption text-text-muted capitalize">{comment.author?.role} • {timeAgo(comment.created_at)}</p>
                </div>
              </div>

              {canModify && !isEditing && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setContent(comment.content || '');
                      setIsEditing(true);
                    }}
                    className="p-1.5 text-text-muted hover:text-primary hover:bg-surface-alt rounded-lg transition-colors"
                    title="Edit Comment"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-50 rounded-lg transition-colors"
                    title="Delete Comment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-2 mt-2">
                <Textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm" loading={saving}>Save Changes</Button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-body-sm text-text whitespace-pre-wrap">{comment.content}</p>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => onReplyClick(comment.id)}
                    className="mt-2 inline-flex items-center gap-1 text-caption text-primary font-medium hover:underline"
                  >
                    <Reply className="h-3.5 w-3.5" />
                    Reply
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {replyingTo === comment.id && (
          <form onSubmit={onReplySubmit} className="mt-3 pt-3 border-t border-border/50 space-y-2">
            <Textarea
              placeholder="Write your reply..."
              required
              value={replyContent}
              onChange={(e) => onReplyChange(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onCancelReply}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" icon={Send}>Post Reply</Button>
            </div>
          </form>
        )}
      </div>

      {replies.length > 0 && (
        <div className="ml-4 sm:ml-8 space-y-2 border-l-2 border-border/60 pl-4">
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              commentVotes={commentVotes}
              onVote={onVote}
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EvidenceCard({ evidence, problem, currentUser, onVerifyClick }) {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerifications = async () => {
      const vs = await dbService.getVerifications(evidence.id);
      setVerifications(vs);
      setLoading(false);
    };
    fetchVerifications();
  }, [evidence.id]);

  const hasVerified = verifications.some(v => v.verified_by === currentUser?.id);
  const totalVerifiedCount = verifications.filter(v => v.status === 'confirmed').length;

  return (
    <div className="p-5 border border-accent/20 rounded-2xl bg-accent-50/5 space-y-4">
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <Avatar name={evidence.author?.name} src={evidence.author?.avatar_url} role={evidence.author?.role} size="sm" />
          <div>
            <h4 className="text-body-sm font-semibold text-text">{evidence.author?.name}</h4>
            <p className="text-caption text-text-muted capitalize">Solver • Submitted {timeAgo(evidence.created_at)}</p>
          </div>
        </div>

        {/* Verification Status */}
        <div className="text-right">
          <span className="text-body-sm font-semibold text-accent">
            Verifications: {totalVerifiedCount}/3
          </span>
        </div>
      </div>

      <p className="text-body-sm text-text">{evidence.description}</p>

      {evidence.file_url && (
        <img
          src={evidence.file_url}
          alt="Resolution Evidence"
          className="rounded-xl max-h-60 object-cover w-full border border-border"
        />
      )}

      {/* Verification lists */}
      {verifications.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/50">
          <h5 className="text-caption font-semibold text-text-muted">Community Confirmations:</h5>
          <div className="space-y-1.5">
            {verifications.map(v => (
              <div key={v.id} className="flex gap-2 items-start p-2 rounded-lg bg-surface border border-border/40">
                <Avatar name={v.verifier?.name} size="xs" role={v.verifier?.role} />
                <div>
                  <p className="text-caption font-semibold text-text">{v.verifier?.name} ({v.verifier?.role})</p>
                  <p className="text-caption text-text-muted italic">"{v.notes}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verify action */}
      {currentUser && !hasVerified && problem.status !== 'verified_solved' && (
        <div className="flex justify-end pt-2">
          <Button
            variant="accent"
            size="sm"
            icon={ShieldCheck}
            onClick={() => onVerifyClick(evidence.id)}
          >
            Confirm Solved
          </Button>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity }) {
  const getActionDetails = () => {
    switch (activity.action) {
      case 'problem_created':
        return { label: 'reported this problem statement', icon: AlertCircle, color: 'text-blue-500' };
      case 'comment_added':
        return { label: 'added a comment', icon: MessageSquare, color: 'text-text-muted' };
      case 'solution_proposed':
        return { label: 'proposed a collaborative solution', icon: Sparkles, color: 'text-secondary' };
      case 'solution_accepted':
        return { label: 'accepted a solution proposal', icon: Award, color: 'text-success' };
      case 'evidence_submitted':
        return { label: 'submitted implementation evidence of resolution', icon: FileSpreadsheet, color: 'text-accent' };
      case 'verification_confirmed':
        return { label: 'verified the implementation evidence', icon: ShieldCheck, color: 'text-emerald-500' };
      case 'status_changed':
        return {
          label: `marked status as "${activity.metadata?.newStatus?.replace('_', ' ').toUpperCase()}"`,
          icon: CheckCheck,
          color: 'text-primary'
        };
      default:
        return { label: 'performed an action', icon: HelpCircle, color: 'text-text-muted' };
    }
  };

  const details = getActionDetails();
  const Icon = details.icon;

  return (
    <div className="flex gap-2 text-caption">
      <div className={cn('p-1 rounded-full bg-surface-alt flex-shrink-0 h-6 w-6 flex items-center justify-center', details.color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-text font-medium">
          {activity.actor?.name || 'System'}{' '}
          <span className="font-normal text-text-muted">{details.label}</span>
        </p>
        <p className="text-[10px] text-text-light">{timeAgo(activity.created_at)}</p>
      </div>
    </div>
  );
}
