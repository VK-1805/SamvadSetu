import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/db';
import { Button, StatusBadge } from '../components/ui';
import {
  ArrowRight, MapPin, CheckCircle2, TrendingUp,
  Lightbulb, ShieldCheck, Globe,
  MessageSquare, ChevronRight
} from 'lucide-react';
import { CATEGORIES } from '../constants';

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Report a Problem',
    description: 'Citizens and local bodies identify real-world challenges affecting their community. Add location, category, and photos.',
    icon: MapPin,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    step: 2,
    title: 'Community Discusses',
    description: 'Students, professionals, and fellow citizens discuss the problem, propose solutions, and vote on the best approaches.',
    icon: MessageSquare,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    step: 3,
    title: 'Solutions Emerge',
    description: 'The best solution gets accepted. Contributors tag the resources needed — funding, volunteers, expertise, equipment.',
    icon: Lightbulb,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    step: 4,
    title: 'Verified Impact',
    description: 'Solutions are implemented and evidence is submitted. Community verification ensures real accountability and progress.',
    icon: ShieldCheck,
    color: 'bg-emerald-50 text-emerald-600',
  },
];

const CONTRIBUTOR_TYPES = [
  {
    role: 'Citizens & Local Bodies',
    description: 'Report problems, verify solutions, and track progress in your community.',
    emoji: '🏘️',
    actions: ['Report problems', 'Vote on solutions', 'Verify outcomes'],
  },
  {
    role: 'Students & Universities',
    description: 'Turn real societal challenges into meaningful research and project work.',
    emoji: '🎓',
    actions: ['Propose solutions', 'Collaborate on projects', 'Build your portfolio'],
  },
  {
    role: 'Industry Professionals',
    description: 'Bring expertise, resources, and mentorship to grassroots problem-solving.',
    emoji: '🏭',
    actions: ['Offer expertise', 'Provide resources', 'Mentor teams'],
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState([]);
  const [featuredProblems, setFeaturedProblems] = useState([]);

  useEffect(() => {
    async function loadLandingData() {
      try {
        const summary = await dbService.getAnalyticsSummary();
        setStats([
          { label: 'Problems Reported', value: String(summary.total), icon: Lightbulb, color: 'text-status-open' },
          { label: 'Active Discussions', value: String(summary.open + summary.inDiscussion), icon: MessageSquare, color: 'text-status-discussion' },
          { label: 'Solutions Proposed', value: String(summary.proposed), icon: TrendingUp, color: 'text-status-proposed' },
          { label: 'Verified Solved', value: String(summary.solved), icon: CheckCircle2, color: 'text-status-solved' },
        ]);

        const { data } = await dbService.getProblems({}, 'most_upvoted');
        const featured = (data || []).filter((p) => p.is_featured);
        setFeaturedProblems((featured.length >= 3 ? featured : data || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load landing data:', err);
      }
    }
    loadLandingData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ════════════ HERO ════════════ */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary">
          <div className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative page-container py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-caption font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              SIH26043 • Government of Jharkhand
            </div>

            <h1 className="text-display-lg sm:text-display-xl text-white font-display leading-tight mb-6 animate-fade-in-up">
              Turn Local Problems Into{' '}
              <span className="text-accent-light">Collective Action</span>
            </h1>

            <p className="text-body-lg text-white/70 max-w-xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              SamvadSetu bridges the gap between citizens who face challenges and communities 
              that can solve them — students, universities, industry, and local administration 
              working together.
            </p>

            <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {isAuthenticated ? (
                <>
                  <Link to="/feed">
                    <Button variant="accent" size="lg" iconRight={ArrowRight}>
                      Discover Problems
                    </Button>
                  </Link>
                  <Link to="/problems/new">
                    <Button
                      size="lg"
                      className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    >
                      Report a Problem
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup">
                    <Button variant="accent" size="lg" iconRight={ArrowRight}>
                      Join the Movement
                    </Button>
                  </Link>
                  <Link to="/feed">
                    <Button
                      size="lg"
                      className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    >
                      Explore Problems
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ LIVE STATS ════════════ */}
      <section className="relative -mt-8 z-10">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(stats.length > 0 ? stats : [
              { label: 'Problems Reported', value: '—', icon: Lightbulb, color: 'text-status-open' },
              { label: 'Active Discussions', value: '—', icon: MessageSquare, color: 'text-status-discussion' },
              { label: 'Solutions Proposed', value: '—', icon: TrendingUp, color: 'text-status-proposed' },
              { label: 'Verified Solved', value: '—', icon: CheckCircle2, color: 'text-status-solved' },
            ]).map((stat) => (
              <div
                key={stat.label}
                className="card p-5 flex items-center gap-4 animate-fade-in-up"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-alt flex items-center justify-center flex-shrink-0">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-heading-lg font-display text-text">{stat.value}</p>
                  <p className="text-caption text-text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ RECENT PROBLEMS ════════════ */}
      <section className="section">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-display font-display text-text mb-3">
              Real Problems, Real Communities
            </h2>
            <p className="text-body-lg text-text-muted max-w-2xl mx-auto">
              These are actual challenges reported by citizens across Jharkhand. 
              Each one is moving toward resolution.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {featuredProblems.map((problem) => {
              const category = CATEGORIES.find((c) => c.value === problem.category);
              return (
              <Link
                key={problem.id}
                to={`/problems/${problem.id}`}
                className="card-interactive p-5 sm:p-6 group block"
              >
                <div className="flex items-center gap-2 mb-3">
                  <StatusBadge status={problem.status} size="sm" />
                  <span className="text-caption text-text-muted flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {problem.district}
                  </span>
                </div>
                <h3 className="text-heading-sm text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {problem.title}
                </h3>
                <p className="text-body-sm text-text-muted mb-4">{category?.label || problem.category}</p>
                <div className="flex items-center gap-4 text-caption text-text-muted">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {(problem.upvote_count || 0) - (problem.downvote_count || 0)} votes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {problem.comment_count || 0} comments
                  </span>
                </div>
              </Link>
            );})}
          </div>

          <div className="text-center">
            <Link to="/feed">
              <Button variant="outline" size="md" iconRight={ChevronRight}>
                View All Problems
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section className="section bg-surface">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="text-display font-display text-text mb-3">
              How SamvadSetu Works
            </h2>
            <p className="text-body-lg text-text-muted max-w-2xl mx-auto">
              A clear pathway from problem identification to verified resolution. 
              Every step is transparent and community-driven.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-5 transition-transform group-hover:scale-110`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-surface border-2 border-border flex items-center justify-center text-caption font-bold text-text-muted -mt-2 -ml-12">
                  {item.step}
                </div>
                <h3 className="text-heading-sm text-text mb-2">{item.title}</h3>
                <p className="text-body-sm text-text-muted leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CONTRIBUTOR TYPES ════════════ */}
      <section className="section">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="text-display font-display text-text mb-3">
              Everyone Can Contribute
            </h2>
            <p className="text-body-lg text-text-muted max-w-2xl mx-auto">
              Whether you're a citizen facing a challenge, a student seeking real-world projects, 
              or an industry professional with expertise — there's a place for you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {CONTRIBUTOR_TYPES.map((type) => (
              <div key={type.role} className="card p-6 sm:p-8 text-center group hover:shadow-card-hover transition-shadow">
                <div className="text-4xl mb-4">{type.emoji}</div>
                <h3 className="text-heading text-text mb-2">{type.role}</h3>
                <p className="text-body-sm text-text-muted mb-6">{type.description}</p>
                <ul className="space-y-2 text-left">
                  {type.actions.map((action) => (
                    <li key={action} className="flex items-center gap-2 text-body-sm text-text-muted">
                      <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ STATUS LIFECYCLE ════════════ */}
      <section className="section bg-surface">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="text-display font-display text-text mb-3">
              Every Problem Has a Journey
            </h2>
            <p className="text-body-lg text-text-muted max-w-2xl mx-auto">
              Problems don't disappear into a feed. They move through a visible lifecycle 
              toward verified resolution.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {['open', 'in_discussion', 'solution_proposed', 'evidence_submitted', 'verification', 'verified_solved'].map((status, i) => (
              <div key={status} className="flex items-center gap-2">
                <StatusBadge status={status} size="md" />
                {i < 5 && <ArrowRight className="h-4 w-4 text-text-muted hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="page-container text-center">
          <h2 className="text-display-lg font-display text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-body-lg text-white/70 max-w-xl mx-auto mb-8">
            Join thousands of citizens, students, and professionals working together 
            to solve Jharkhand's most pressing challenges.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/signup">
              <Button variant="accent" size="lg" iconRight={ArrowRight}>
                Get Started Free
              </Button>
            </Link>
            <Link to="/feed">
              <Button
                size="lg"
                className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
              >
                Explore First
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
