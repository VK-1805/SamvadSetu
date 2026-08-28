import { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Card, Badge, StatusBadge, Button, LoadingState } from '../components/ui';
import {
  Shield, BarChart3, Users, CheckCircle2, AlertTriangle, MessageSquare,
  Sparkles, Pin, Flame, RotateCw, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [analytics, setAnalytics] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const summary = await dbService.getAnalyticsSummary();
      setAnalytics(summary);

      const { data } = await dbService.getProblems();
      setProblems(data || []);
    } catch (err) {
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdminData();
    setRefreshing(false);
    toast.success('Analytics refreshed');
  };

  const toggleFeatured = async (problemId, currentFeatured) => {
    try {
      await dbService.updateProblem(problemId, { is_featured: !currentFeatured });
      toast.success(currentFeatured ? 'Problem unfeatured' : 'Problem featured!');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to update features');
    }
  };

  const toggleEscalated = async (problemId, currentEscalated) => {
    try {
      const updates = {
        is_escalated: !currentEscalated,
        escalated_at: !currentEscalated ? new Date().toISOString() : null,
      };
      if (!currentEscalated) {
        updates.status = 'needs_attention';
      }
      await dbService.updateProblem(problemId, updates);
      toast.success(currentEscalated ? 'Escalation resolved' : 'Problem escalated to administrative dashboard!');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to update escalation');
    }
  };

  if (loading) return <LoadingState message="Loading administrative portal..." />;

  const metricCards = [
    { label: 'Total Problems', value: analytics.total, icon: AlertTriangle, color: 'text-primary bg-primary-50' },
    { label: 'Open Issues', value: analytics.open, icon: Flame, color: 'text-blue-600 bg-blue-50' },
    { label: 'Solutions Accepted', value: analytics.proposed, icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
    { label: 'Verified Solved', value: analytics.solved, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="page-container py-10 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-display font-display text-text flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Administration Center
          </h1>
          <p className="text-body-sm text-text-muted mt-1">
            Monitor resolution rates, moderate submissions, and escalate inactive local problems.
          </p>
        </div>
        
        <Button variant="outline" size="sm" icon={RotateCw} onClick={handleRefresh} loading={refreshing}>
          Refresh Metrics
        </Button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m, idx) => (
          <Card key={idx} className="p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${m.color}`}>
              <m.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-heading font-bold text-text">{m.value}</p>
              <p className="text-caption text-text-muted">{m.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District distribution */}
        <Card className="lg:col-span-1 space-y-4">
          <h3 className="text-heading-sm font-semibold text-text border-b border-border pb-2 flex items-center gap-1.5">
            <BarChart3 className="h-4.5 w-4.5 text-primary" />
            District Heatmap Stats
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.byDistrict || {}).map(([district, count]) => (
              <div key={district} className="flex justify-between items-center text-body-sm">
                <span className="font-medium text-text">{district}</span>
                <Badge>{count} reported</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Category distribution */}
        <Card className="lg:col-span-1 space-y-4">
          <h3 className="text-heading-sm font-semibold text-text border-b border-border pb-2 flex items-center gap-1.5">
            <BarChart3 className="h-4.5 w-4.5 text-accent" />
            Resolution Rate by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.byCategory || {}).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center text-body-sm">
                <span className="font-medium text-text capitalize">{category}</span>
                <span className="text-text-muted">{count} items</span>
              </div>
            ))}
            <div className="pt-2 border-t border-border mt-4 flex items-center justify-between text-body-sm font-semibold">
              <span>Overall Resolution Rate</span>
              <span className="text-emerald-600">{analytics.resolutionRate}%</span>
            </div>
          </div>
        </Card>

        {/* Quick action highlights */}
        <Card className="lg:col-span-1 space-y-4">
          <h3 className="text-heading-sm font-semibold text-text border-b border-border pb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-4.5 w-4.5 text-danger" />
            Escalation Summary
          </h3>
          <p className="text-body-sm text-text-muted leading-relaxed">
            Problems flagged with "Needs Attention" bypass community lists and get routed directly to administrative priority queues.
          </p>
          <div className="text-center py-4 border-2 border-dashed border-border rounded-xl">
            <p className="text-heading-lg font-bold text-danger">
              {problems.filter(p => p.is_escalated).length}
            </p>
            <p className="text-caption text-text-muted mt-1">Escalated problems awaiting administrative response</p>
          </div>
        </Card>
      </div>

      {/* MODERATION TABLE */}
      <Card className="space-y-4">
        <h3 className="text-heading-sm font-semibold text-text pb-2 border-b border-border">Content Moderation & Action Panel</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-border text-text-muted bg-surface-alt/25">
                <th className="py-3 px-4 font-semibold">Problem Title</th>
                <th className="py-3 px-4 font-semibold">District</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {problems.map(prob => (
                <tr key={prob.id} className="hover:bg-surface-alt/10">
                  <td className="py-3.5 px-4 font-medium text-text max-w-sm truncate">
                    <Link to={`/problems/${prob.id}`} className="hover:underline">{prob.title}</Link>
                  </td>
                  <td className="py-3.5 px-4 text-text-muted">{prob.district}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={prob.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right flex justify-end gap-2">
                    <Button
                      variant={prob.is_featured ? 'primary' : 'outline'}
                      size="sm"
                      icon={Pin}
                      onClick={() => toggleFeatured(prob.id, prob.is_featured)}
                      title={prob.is_featured ? 'Remove Feature' : 'Mark as Featured'}
                    >
                      {prob.is_featured ? 'Featured' : 'Feature'}
                    </Button>
                    <Button
                      variant={prob.is_escalated ? 'danger' : 'outline'}
                      size="sm"
                      icon={Flame}
                      onClick={() => toggleEscalated(prob.id, prob.is_escalated)}
                      title={prob.is_escalated ? 'Resolve Escalation' : 'Escalate to Admin'}
                    >
                      {prob.is_escalated ? 'Escalated' : 'Escalate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
