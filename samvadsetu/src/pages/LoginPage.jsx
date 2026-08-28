import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IS_MOCK } from '../lib/config';
import { Button, Input } from '../components/ui';
import { Mail, Lock, Globe, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/feed';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signIn({ email: form.email, password: form.password });
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.message?.includes('Invalid login')
        ? 'Invalid email or password'
        : err.message || 'Login failed. Please try again.';
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
          </Link>
          <h1 className="text-heading-xl font-display text-text mb-2">Welcome Back</h1>
          <p className="text-body-sm text-text-muted">
            Sign in to continue making an impact
          </p>
        </div>

        {/* Form */}
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              autoComplete="current-password"
            />

            {errors.general && (
              <div className="p-3 rounded-xl bg-danger-light text-danger text-body-sm border border-red-200">
                {errors.general}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              iconRight={ArrowRight}
            >
              Sign In
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-body-sm text-text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>

        {IS_MOCK && (
          <div className="mt-4 p-4 rounded-xl bg-surface-alt border border-border text-caption text-text-muted">
            <p className="font-semibold text-text mb-2">Demo accounts (password: demo123)</p>
            <ul className="space-y-1">
              <li>admin@samvadsetu.in — Admin</li>
              <li>citizen@samvadsetu.in — Citizen</li>
              <li>student@samvadsetu.in — Student</li>
              <li>industry@samvadsetu.in — Industry</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
