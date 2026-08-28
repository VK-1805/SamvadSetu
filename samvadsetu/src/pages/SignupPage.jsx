import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Select } from '../components/ui';
import { Mail, Lock, User, Building2, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ROLES } from '../constants';
import { cn } from '../utils';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    institution: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.role) errs.role = 'Please select a role';
    if ((form.role === 'student' || form.role === 'industry') && !form.institution.trim()) {
      errs.institution = `Please enter your ${form.role === 'student' ? 'university/institution' : 'organization'} name`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signUp({
        email: form.email,
        password: form.password,
        name: form.name.trim(),
        role: form.role,
        institution: form.institution.trim() || null,
      });
      toast.success('Account created! Welcome to SamvadSetu.');
      navigate('/feed');
    } catch (err) {
      const message = err.message?.includes('already registered')
        ? 'This email is already registered. Please sign in.'
        : err.message || 'Signup failed. Please try again.';
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
          </Link>
          <h1 className="text-heading-xl font-display text-text mb-2">Join SamvadSetu</h1>
          <p className="text-body-sm text-text-muted">
            Create your account and start making an impact in your community
          </p>
        </div>

        {/* Form */}
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-body-sm font-medium text-text">
                I am a... <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: role.value })}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all duration-200',
                      form.role === role.value
                        ? 'border-primary bg-primary-50 ring-1 ring-primary/20'
                        : 'border-border hover:border-border-strong hover:bg-surface-alt'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-body-sm font-semibold text-text">{role.label}</span>
                      {form.role === role.value && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-caption text-text-muted">{role.description}</p>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="text-caption text-danger">{errors.role}</p>
              )}
            </div>

            <Input
              label="Full Name"
              icon={User}
              placeholder="Your full name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              autoComplete="name"
            />

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

            {(form.role === 'student' || form.role === 'industry') && (
              <Input
                label={form.role === 'student' ? 'University / Institution' : 'Organization'}
                icon={Building2}
                placeholder={form.role === 'student' ? 'e.g. IIT Dhanbad' : 'e.g. Tata Steel'}
                required
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                error={errors.institution}
              />
            )}

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              hint="At least 6 characters"
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              autoComplete="new-password"
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
              Create Account
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-body-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
