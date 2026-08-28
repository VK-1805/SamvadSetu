import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { dbService } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge, VoteControl, Badge, EmptyState, Card, Pagination } from '../components/ui';
import { SkeletonList } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import {
  Search, SlidersHorizontal, MapPin, MessageSquare,
  Clock, TrendingUp, Plus, X, ChevronDown
} from 'lucide-react';
import { CATEGORIES, DISTRICTS, STATUS_CONFIG, SORT_OPTIONS } from '../constants';
import { timeAgo, formatCount, truncate, cn, debounce } from '../utils';

const ITEMS_PER_PAGE = 12;

export default function FeedPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filters from URL params
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const filterCategory = searchParams.get('category') || '';
  const filterStatus = searchParams.get('status') || '';
  const filterDistrict = searchParams.get('district') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const activeFilterCount = [filterCategory, filterStatus, filterDistrict].filter(Boolean).length;

  const updateParams = useCallback((updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset to page 1 when changing filters
    if (!updates.page) newParams.delete('page');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, count } = await dbService.getProblems(
        {
          q: searchQuery || undefined,
          category: filterCategory || undefined,
          status: filterStatus || undefined,
          district: filterDistrict || undefined,
        },
        sortBy,
        { page, pageSize: ITEMS_PER_PAGE }
      );

      setProblems(data);
      setTotalCount(count);
    } catch (err) {
      console.error('Fetch problems error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, filterCategory, filterStatus, filterDistrict, page]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const debouncedSearch = useCallback(
    debounce((value) => updateParams({ q: value }), 400),
    [updateParams]
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-heading-xl font-display text-text">Discover Problems</h1>
          <p className="text-body-sm text-text-muted mt-1">
            {totalCount} problem{totalCount !== 1 ? 's' : ''} reported across Jharkhand
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/problems/new">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              Report Problem
            </button>
          </Link>
        )}
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search problems..."
            defaultValue={searchQuery}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-body placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-border bg-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-body-sm font-medium transition-colors',
              showFilters || activeFilterCount > 0
                ? 'border-primary bg-primary-50 text-primary'
                : 'border-border bg-surface text-text-muted hover:bg-surface-alt'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-caption flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 mb-4 animate-fade-in-down">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-caption font-medium text-text-muted mb-1.5">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => updateParams({ category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-caption font-medium text-text-muted mb-1.5">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => updateParams({ status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-caption font-medium text-text-muted mb-1.5">District</label>
              <select
                value={filterDistrict}
                onChange={(e) => updateParams({ district: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Districts</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-3 text-body-sm text-primary hover:underline flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <SkeletonList count={6} />
      ) : error ? (
        <ErrorState
          title="Failed to load problems"
          message={error}
          onRetry={fetchProblems}
        />
      ) : problems.length === 0 ? (
        <EmptyState
          title="No problems found"
          description={
            searchQuery || activeFilterCount > 0
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Be the first to report a problem in your community.'
          }
          action={activeFilterCount > 0 ? clearFilters : undefined}
          actionLabel="Clear Filters"
        />
      ) : (
        <>
          <div className="grid gap-4">
            {problems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => updateParams({ page: String(p) })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProblemCard({ problem }) {
  const category = CATEGORIES.find((c) => c.value === problem.category);

  return (
    <Link to={`/problems/${problem.id}`}>
      <div className="card-interactive p-5 sm:p-6 group">
        <div className="flex gap-4">
          {/* Vote section (desktop) */}
          <div className="hidden sm:flex flex-col items-center pt-1">
            <VoteControl
              upvotes={problem.upvote_count || 0}
              downvotes={problem.downvote_count || 0}
              disabled
              size="sm"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={problem.status} size="sm" />
              {category && (
                <Badge size="sm">
                  {category.icon} {category.label}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="text-heading-sm text-text mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
              {problem.title}
            </h3>

            {/* Description preview */}
            <p className="text-body-sm text-text-muted line-clamp-2 mb-3">
              {truncate(problem.description, 180)}
            </p>

            {/* Footer meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-text-muted">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {problem.district}{problem.block ? `, ${problem.block}` : ''}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {formatCount(problem.comment_count || 0)} comments
              </span>
              <span className="flex items-center gap-1 sm:hidden">
                <TrendingUp className="h-3.5 w-3.5" />
                {(problem.upvote_count || 0) - (problem.downvote_count || 0)} votes
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {timeAgo(problem.created_at)}
              </span>
              {problem.author && (
                <span className="text-text-light">
                  by {problem.author.name}
                </span>
              )}
            </div>
          </div>

          {/* Image thumbnail */}
          {problem.image_url && (
            <div className="hidden md:block flex-shrink-0">
              <img
                src={problem.image_url}
                alt=""
                className="w-24 h-24 rounded-xl object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
