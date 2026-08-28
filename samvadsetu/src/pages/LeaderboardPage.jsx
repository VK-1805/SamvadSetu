import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/db';
import { Card, Avatar, Badge, LoadingState, EmptyState } from '../components/ui';
import { Trophy, Star, Medal, TrendingUp, Users, Crown, Sparkles, MapPin, Building2 } from 'lucide-react';
import { RESOURCE_TYPES } from '../constants';
import { cn } from '../utils';

const RANK_CONFIG = [
  { min: 250, label: 'Civic Leader', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-300', icon: Crown },
  { min: 150, label: 'Expert Contributor', color: 'from-primary to-primary-light', badge: 'bg-primary-50 text-primary border-primary-300', icon: Medal },
  { min: 80, label: 'Active Solver', color: 'from-secondary to-secondary-light', badge: 'bg-secondary-50 text-secondary-dark border-secondary-300', icon: Star },
  { min: 0, label: 'Community Companion', color: 'from-gray-400 to-gray-500', badge: 'bg-surface-alt text-text-muted border-border', icon: Users },
];

function getRank(score) {
  return RANK_CONFIG.find(r => score >= r.min) || RANK_CONFIG[RANK_CONFIG.length - 1];
}

export default function LeaderboardPage() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await dbService.getTopContributors();
        setContributors(data || []);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  if (loading) return <LoadingState message="Computing impact scores..." />;

  return (
    <div className="page-container py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-50 text-secondary-dark text-caption font-semibold mb-4">
          <Trophy className="h-4 w-4" />
          Impact Leaderboard
        </div>
        <h1 className="text-display font-display text-text mb-3">
          Top Contributors of Jharkhand
        </h1>
        <p className="text-body text-text-muted">
          Recognizing the citizens, students, and professionals driving real impact 
          through problem-solving, verification, and community engagement.
        </p>
      </div>

      {/* Impact scoring legend */}
      <Card className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-secondary" />
          <h3 className="text-heading-sm font-semibold text-text">How Impact Score Works</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-surface-alt">
            <p className="text-heading-sm font-bold text-emerald-600">+50</p>
            <p className="text-caption text-text-muted">Verified Solution</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-alt">
            <p className="text-heading-sm font-bold text-primary">+30</p>
            <p className="text-caption text-text-muted">Accepted Solution</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-alt">
            <p className="text-heading-sm font-bold text-accent">+15</p>
            <p className="text-caption text-text-muted">Evidence Submitted</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-alt">
            <p className="text-heading-sm font-bold text-secondary">+10</p>
            <p className="text-caption text-text-muted">Solution / Verification</p>
          </div>
        </div>
      </Card>

      {/* Podium for top 3 */}
      {contributors.length >= 3 && (
        <div className="flex items-end justify-center gap-4 sm:gap-6 max-w-2xl mx-auto pb-4">
          {/* 2nd place */}
          <PodiumCard contributor={contributors[1]} rank={2} />
          {/* 1st place */}
          <PodiumCard contributor={contributors[0]} rank={1} />
          {/* 3rd place */}
          <PodiumCard contributor={contributors[2]} rank={3} />
        </div>
      )}

      {/* Full table */}
      {contributors.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No contributors yet"
          description="Start contributing by reporting problems, proposing solutions, and verifying evidence."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-border bg-surface-alt/30">
                  <th className="py-3.5 px-4 text-caption font-bold text-text-muted uppercase tracking-wider w-16">Rank</th>
                  <th className="py-3.5 px-4 text-caption font-bold text-text-muted uppercase tracking-wider">Contributor</th>
                  <th className="py-3.5 px-4 text-caption font-bold text-text-muted uppercase tracking-wider hidden sm:table-cell">Role</th>
                  <th className="py-3.5 px-4 text-caption font-bold text-text-muted uppercase tracking-wider hidden md:table-cell">District</th>
                  <th className="py-3.5 px-4 text-caption font-bold text-text-muted uppercase tracking-wider hidden lg:table-cell">Resources</th>
                  <th className="py-3.5 px-4 text-caption font-bold text-text-muted uppercase tracking-wider text-right">Impact</th>
                  <th className="py-3.5 px-4 text-caption font-bold text-text-muted uppercase tracking-wider hidden sm:table-cell">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {contributors.map((user, index) => {
                  const rank = getRank(user.impact_score || 0);
                  const RankIcon = rank.icon;
                  return (
                    <tr key={user.id} className={cn(
                      'hover:bg-surface-alt/20 transition-colors',
                      index < 3 && 'bg-secondary-50/10'
                    )}>
                      <td className="py-4 px-4">
                        <span className={cn(
                          'inline-flex items-center justify-center w-8 h-8 rounded-full text-body-sm font-bold',
                          index === 0 && 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-sm',
                          index === 1 && 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm',
                          index === 2 && 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-sm',
                          index > 2 && 'bg-surface-alt text-text-muted'
                        )}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link to={`/profile/${user.id}`} className="flex items-center gap-3 group">
                          <Avatar name={user.name} src={user.avatar_url} role={user.role} size="sm" />
                          <div>
                            <p className="text-body-sm font-semibold text-text group-hover:text-primary transition-colors">
                              {user.name}
                            </p>
                            {user.institution && (
                              <p className="text-caption text-text-muted flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {user.institution}
                              </p>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <span className="text-body-sm text-text-muted capitalize">{user.role}</span>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        {user.district ? (
                          <span className="text-body-sm text-text-muted flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {user.district}
                          </span>
                        ) : (
                          <span className="text-caption text-text-light">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {user.resources_offered?.slice(0, 3).map(r => {
                            const res = RESOURCE_TYPES.find(rt => rt.value === r);
                            return res ? (
                              <span key={r} className="text-[10px] px-1.5 py-0.5 bg-surface-alt border border-border rounded text-text-muted">
                                {res.icon}
                              </span>
                            ) : null;
                          })}
                          {(user.resources_offered?.length || 0) > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-surface-alt border border-border rounded text-text-muted">
                              +{user.resources_offered.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-heading-sm font-bold text-secondary flex items-center justify-end gap-1">
                          <Star className="h-4 w-4 fill-secondary" />
                          {user.impact_score || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-caption font-semibold',
                          rank.badge
                        )}>
                          <RankIcon className="h-3 w-3" />
                          {rank.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function PodiumCard({ contributor, rank }) {
  const rankData = getRank(contributor.impact_score || 0);
  
  const heights = { 1: 'h-32', 2: 'h-24', 3: 'h-20' };
  const sizes = { 1: 'w-20 h-20', 2: 'w-16 h-16', 3: 'w-16 h-16' };
  const medalColors = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-gray-300 to-gray-400',
    3: 'from-amber-600 to-amber-700',
  };
  const medalLabels = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div className={cn(
      'flex flex-col items-center',
      rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'
    )}>
      <Link to={`/profile/${contributor.id}`} className="flex flex-col items-center group mb-3">
        <div className="relative mb-2">
          <Avatar name={contributor.name} src={contributor.avatar_url} role={contributor.role} size={rank === 1 ? 'lg' : 'md'} />
          <span className="absolute -top-1 -right-1 text-lg">{medalLabels[rank]}</span>
        </div>
        <h3 className="text-body-sm font-bold text-text text-center group-hover:text-primary transition-colors line-clamp-1 max-w-[120px]">
          {contributor.name}
        </h3>
        <p className="text-caption text-text-muted capitalize">{contributor.role}</p>
        <span className="text-heading-sm font-bold text-secondary flex items-center gap-0.5 mt-1">
          <Star className="h-3.5 w-3.5 fill-secondary" />
          {contributor.impact_score || 0}
        </span>
      </Link>
      <div className={cn(
        'w-24 sm:w-28 rounded-t-xl bg-gradient-to-t',
        medalColors[rank],
        heights[rank],
        'flex items-end justify-center pb-2'
      )}>
        <span className="text-heading-xl font-display text-white/90">{rank}</span>
      </div>
    </div>
  );
}
