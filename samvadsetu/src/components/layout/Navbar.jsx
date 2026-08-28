import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, Button } from '../ui';
import {
  Menu, X, MapPin, Plus, LayoutDashboard, LogOut, User,
  ChevronDown, Search, Globe, Sparkles, Trophy
} from 'lucide-react';
import { cn } from '../../utils';

export default function Navbar() {
  const { profile, isAuthenticated, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/feed', label: 'Discover', icon: Search },
    { to: '/map', label: 'Map', icon: MapPin },
    { to: '/leaderboard', label: 'Impact', icon: Trophy },
    ...(isAuthenticated ? [{ to: '/match', label: 'Match', icon: Sparkles }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-border">
      <nav className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-heading-sm text-text font-display tracking-tight">
                Samvad<span className="text-accent">Setu</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-body-sm font-medium transition-colors',
                  isActive(link.to)
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-muted hover:text-text hover:bg-surface-alt'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-body-sm font-medium transition-colors',
                  isActive('/admin')
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-muted hover:text-text hover:bg-surface-alt'
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/problems/new" className="hidden sm:block">
                  <Button variant="accent" size="sm" icon={Plus}>
                    Report Problem
                  </Button>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-alt transition-colors"
                    aria-label="User menu"
                  >
                    <Avatar
                      name={profile?.name}
                      src={profile?.avatar_url}
                      role={profile?.role}
                      size="sm"
                    />
                    <ChevronDown className={cn(
                      'h-3.5 w-3.5 text-text-muted transition-transform hidden sm:block',
                      profileDropdownOpen && 'rotate-180'
                    )} />
                  </button>

                  {profileDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl border border-border shadow-elevated z-20 py-1 animate-fade-in-down">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-body-sm font-medium text-text truncate">{profile?.name}</p>
                          <p className="text-caption text-text-muted capitalize">{profile?.role}</p>
                        </div>
                        <Link
                          to={`/profile/${profile?.id}`}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-body-sm text-text-muted hover:bg-surface-alt hover:text-text transition-colors"
                        >
                          <User className="h-4 w-4" />
                          View Profile
                        </Link>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleSignOut();
                          }}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-body-sm text-danger hover:bg-danger-light w-full transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/signup" className="hidden sm:block">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-muted hover:bg-surface-alt transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border animate-fade-in-down">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-body-sm font-medium transition-colors',
                    isActive(link.to)
                      ? 'bg-primary-50 text-primary'
                      : 'text-text-muted hover:text-text hover:bg-surface-alt'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-body-sm font-medium transition-colors',
                    isActive('/admin')
                      ? 'bg-primary-50 text-primary'
                      : 'text-text-muted hover:text-text hover:bg-surface-alt'
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/problems/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-body-sm font-medium text-accent hover:bg-accent-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Report Problem
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
