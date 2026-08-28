import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/db';
import { Button, Input, Textarea, Card, Avatar, Badge, StatusBadge, EmptyState, LoadingState } from '../components/ui';
import { Award, Mail, Building2, MapPin, Sparkles, Star, Trophy, Grid } from 'lucide-react';
import { RESOURCE_TYPES } from '../constants';
import { formatDate } from '../utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile: currentProfile, updateProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Editing state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [district, setDistrict] = useState('');
  const [institution, setInstitution] = useState('');
  const [resources, setResources] = useState([]);

  const isOwnProfile = user?.id === id;

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dbService.getProfile(id);
      if (!data) {
        toast.error('Profile not found');
        navigate('/feed');
        return;
      }
      setProfile(data);

      // Set forms
      setName(data.name || '');
      setBio(data.bio || '');
      setDistrict(data.district || '');
      setInstitution(data.institution || '');
      setResources(data.resources_offered || []);

      // Get user reported problems
      const { data: allProblems } = await dbService.getProblems();
      if (allProblems) {
        const userProbs = allProblems.filter((p) => p.author_id === id);
        setProblems(userProbs);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updates = {
        name: name.trim(),
        bio: bio.trim(),
        district: district.trim(),
        institution: institution.trim(),
        resources_offered: resources,
      };

      await updateProfile(updates);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfileData();
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const toggleResource = (val) => {
    setResources(prev => 
      prev.includes(val) ? prev.filter(r => r !== val) : [...prev, val]
    );
  };

  if (loading) return <LoadingState message="Loading profile details..." />;

  const getRankBadge = (score) => {
    if (score >= 250) return { label: 'Jharkhand Civic Leader', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' };
    if (score >= 150) return { label: 'Expert Contributor', color: 'bg-primary-50 text-primary border-primary-300' };
    if (score >= 80) return { label: 'Active Solver', color: 'bg-secondary-50 text-secondary-dark border-secondary-300' };
    return { label: 'Community Companion', color: 'bg-surface-alt text-text-muted border-border' };
  };

  const badgeConfig = getRankBadge(profile.impact_score || 0);

  return (
    <div className="page-container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center p-6 space-y-4">
            <div className="flex justify-center">
              <Avatar name={profile.name} src={profile.avatar_url} size="xl" role={profile.role} />
            </div>
            <div>
              <h2 className="text-heading font-semibold text-text">{profile.name}</h2>
              <p className="text-caption text-text-muted capitalize mb-2">{profile.role}</p>
              
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-caption font-bold ${badgeConfig.color}`}>
                <Trophy className="h-3.5 w-3.5" />
                {badgeConfig.label}
              </span>
            </div>

            <div className="border-t border-b border-border py-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-text-light uppercase tracking-wider">Impact Score</p>
                <p className="text-heading font-bold text-secondary flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-secondary" />
                  {profile.impact_score || 0}
                </p>
              </div>
              <div>
                <p className="text-caption text-text-light uppercase tracking-wider">Problems Posted</p>
                <p className="text-heading font-bold text-primary">{problems.length}</p>
              </div>
            </div>

            <div className="space-y-2 text-left text-body-sm text-text-muted">
              {profile.institution && (
                <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-text-light" /> {profile.institution}</p>
              )}
              {profile.district && (
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-text-light" /> {profile.district}</p>
              )}
              {profile.bio && <p className="italic mt-3">"{profile.bio}"</p>}
            </div>

            {isOwnProfile && !isEditing && (
              <Button variant="outline" size="sm" className="w-full" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </Card>

          {/* Resources Offered Display */}
          <Card className="space-y-4">
            <h3 className="text-heading-sm font-semibold text-text flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-secondary" />
              Contributions Offered
            </h3>
            {profile.resources_offered && profile.resources_offered.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.resources_offered.map(r => {
                  const res = RESOURCE_TYPES.find(rt => rt.value === r);
                  return res ? (
                    <Badge key={r} color="secondary" size="md">
                      {res.icon} {res.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-body-sm text-text-muted italic">No contributions specified yet.</p>
            )}
          </Card>
        </div>

        {/* Editing or Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <Card>
              <h3 className="text-heading-sm font-semibold text-text mb-4 border-b border-border pb-2">Edit profile details</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  label="Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="District / Location"
                    placeholder="e.g. Ranchi"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                  <Input
                    label="Institution / Organization"
                    placeholder="e.g. IIT ISM Dhanbad"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                </div>
                <Textarea
                  label="Bio / Motto"
                  placeholder="Tell the community about yourself or your mission..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />

                <div className="space-y-2">
                  <label className="block text-body-sm font-medium text-text">What can you offer/contribute?</label>
                  <div className="flex flex-wrap gap-2">
                    {RESOURCE_TYPES.map(res => {
                      const selected = resources.includes(res.value);
                      return (
                        <button
                          key={res.value}
                          type="button"
                          onClick={() => toggleResource(res.value)}
                          className={`px-3 py-1.5 rounded-lg border text-caption font-medium transition-colors ${
                            selected
                              ? 'bg-secondary text-white border-secondary'
                              : 'bg-surface border-border text-text-muted'
                          }`}
                        >
                          {res.icon} {res.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" variant="primary">Save Changes</Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="text-heading font-semibold text-text flex items-center gap-2">
                <Grid className="h-5 w-5 text-primary" />
                Reported problems ({problems.length})
              </h3>
              
              {problems.length === 0 ? (
                <EmptyState
                  title="No reported problems"
                  description={isOwnProfile ? "You haven't reported any problems on this platform yet." : "This user hasn't reported any problems yet."}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {problems.map(problem => (
                    <Link key={problem.id} to={`/problems/${problem.id}`}>
                      <Card className="hover:shadow-card-hover transition-shadow h-full flex flex-col justify-between p-5">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <StatusBadge status={problem.status} size="sm" />
                            <span className="text-caption text-text-muted flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {problem.district}
                            </span>
                          </div>
                          <h4 className="text-body-sm font-semibold text-text line-clamp-2">{problem.title}</h4>
                        </div>
                        <p className="text-caption text-text-muted mt-4 border-t border-border/40 pt-2 flex items-center justify-between">
                          <span>Reported {formatDate(problem.created_at)}</span>
                          <span className="font-semibold text-primary">{problem.upvote_count - problem.downvote_count} votes</span>
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
