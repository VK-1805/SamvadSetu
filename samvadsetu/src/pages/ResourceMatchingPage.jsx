import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/db';
import { Card, Badge, StatusBadge, EmptyState, LoadingState, Button } from '../components/ui';
import { Sparkles, MapPin, MessageSquare, ArrowRight, Star } from 'lucide-react';
import { RESOURCE_TYPES, CATEGORIES } from '../constants';

export default function ResourceMatchingPage() {
  const { profile } = useAuth();
  
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState('');

  // Auto-set filter based on user profile preferences
  useEffect(() => {
    if (profile?.resources_offered && profile.resources_offered.length > 0) {
      setSelectedResource(profile.resources_offered[0]);
    } else {
      setSelectedResource('volunteers'); // Default fallback
    }
  }, [profile]);

  const loadProblems = useCallback(async () => {
    setLoading(true);
    if (!selectedResource) return;
    
    const { data } = await dbService.getProblems({ resourceOffered: selectedResource });
    setProblems(data || []);
    setLoading(false);
  }, [selectedResource]);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  return (
    <div className="page-container py-12 space-y-8 animate-fade-in">
      <div className="max-w-3xl">
        <h1 className="text-display font-display text-text">Resource & Skill Matching Bridge</h1>
        <p className="text-body-sm text-text-muted mt-1">
          Select what resource or skill you can provide. We will scan all reported civic challenges in Jharkhand and match you with projects that need your contribution.
        </p>
      </div>

      {/* Resource selector */}
      <div className="flex flex-wrap gap-2.5">
        {RESOURCE_TYPES.map(res => (
          <button
            key={res.value}
            onClick={() => setSelectedResource(res.value)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-body-sm font-semibold transition-all duration-200 ${
              selectedResource === res.value
                ? 'border-secondary bg-secondary-50 text-secondary-dark ring-2 ring-secondary/15'
                : 'border-border bg-surface text-text-muted hover:bg-surface-alt'
            }`}
          >
            <span>{res.icon}</span>
            {res.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <LoadingState message="Scanning platform database..." />
      ) : problems.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={`No problems need ${selectedResource} right now`}
          description="Try selecting a different resource or help trigger local alerts."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {problems.map(p => (
            <MatchedProblemCard key={p.id} problem={p} matchResource={selectedResource} />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchedProblemCard({ problem, matchResource }) {
  const category = CATEGORIES.find(c => c.value === problem.category);
  const matchedRes = RESOURCE_TYPES.find(r => r.value === matchResource);

  return (
    <Card className="flex flex-col justify-between hover:shadow-card-hover transition-all duration-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={problem.status} size="sm" />
          <span className="text-caption text-text-muted flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {problem.district}
          </span>
        </div>

        <div>
          {category && <span className="text-caption text-accent font-semibold">{category.icon} {category.label}</span>}
          <h3 className="text-heading-sm font-semibold text-text mt-1">{problem.title}</h3>
          <p className="text-body-sm text-text-muted line-clamp-3 mt-2">{problem.description}</p>
        </div>

        {/* Resources list highlighting matches */}
        <div className="space-y-1.5 pt-2">
          <h4 className="text-caption font-semibold text-text-muted">Resources Needed:</h4>
          <div className="flex flex-wrap gap-1.5">
            {problem.resources_needed?.map(r => {
              const res = RESOURCE_TYPES.find(rt => rt.value === r);
              const isMatch = r === matchResource;
              return res ? (
                <span
                  key={r}
                  className={`text-caption px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                    isMatch
                      ? 'bg-secondary text-white border-secondary font-bold'
                      : 'bg-surface-alt border-border text-text-muted'
                  }`}
                >
                  {res.icon} {res.label}
                  {isMatch && <Star className="h-3 w-3 fill-white stroke-none" />}
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-caption text-text-muted flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          {problem.comment_count || 0} discussion replies
        </span>

        <Link to={`/problems/${problem.id}`}>
          <Button variant="primary" size="sm" iconRight={ArrowRight}>
            Pledge Help
          </Button>
        </Link>
      </div>
    </Card>
  );
}
