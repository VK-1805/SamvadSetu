import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/db';
import { Button, Input, Textarea, Select, Card, LoadingState } from '../components/ui';
import { MapPin, Globe, ArrowRight, Image as ImageIcon, Sparkles, Pencil } from 'lucide-react';
import { CATEGORIES, DISTRICTS, SDG_GOALS, RESOURCE_TYPES, CATEGORY_IMAGES, DEFAULT_PROBLEM_IMAGE } from '../constants';
import toast from 'react-hot-toast';

export default function EditProblemPage() {
  const { id } = useParams();
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tempImage, setTempImage] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const problem = await dbService.getProblemById(id);
        if (!problem) {
          toast.error('Problem not found');
          navigate('/feed');
          return;
        }
        if (user?.id !== problem.author_id && !isAdmin) {
          toast.error('You do not have permission to edit this problem');
          navigate(`/problems/${id}`);
          return;
        }
        setForm({
          title: problem.title,
          description: problem.description,
          category: problem.category,
          district: problem.district,
          block: problem.block || '',
          location_name: problem.location_name || '',
          latitude: problem.latitude?.toString() || '',
          longitude: problem.longitude?.toString() || '',
          image_url: problem.image_url || '',
          sdg_tags: problem.sdg_tags || [],
          resources_needed: problem.resources_needed || [],
        });
      } catch (err) {
        toast.error('Failed to load problem');
        navigate('/feed');
      } finally {
        setPageLoading(false);
      }
    }
    if (user) load();
  }, [id, user, isAdmin, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length < 10) errs.title = 'Title must be at least 10 characters';
    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.trim().length < 30) errs.description = 'Description must be at least 30 characters';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.district) errs.district = 'Please select a district';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const toggleSdg = (goalId) => {
    setForm((prev) => ({
      ...prev,
      sdg_tags: prev.sdg_tags.includes(goalId)
        ? prev.sdg_tags.filter((t) => t !== goalId)
        : [...prev.sdg_tags, goalId],
    }));
  };

  const toggleResource = (value) => {
    setForm((prev) => ({
      ...prev,
      resources_needed: prev.resources_needed.includes(value)
        ? prev.resources_needed.filter((r) => r !== value)
        : [...prev.resources_needed, value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let imageUrl = form.image_url;
      if (tempImage) {
        imageUrl = CATEGORY_IMAGES[form.category] || form.image_url || DEFAULT_PROBLEM_IMAGE;
      }

      await dbService.updateProblem(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        district: form.district,
        block: form.block.trim() || null,
        location_name: form.location_name.trim() || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        image_url: imageUrl || null,
        sdg_tags: form.sdg_tags,
        resources_needed: form.resources_needed,
      });

      toast.success('Problem updated successfully');
      navigate(`/problems/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update problem');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading || !form) return <LoadingState message="Loading problem for editing..." />;

  const categoryOptions = CATEGORIES.map((c) => ({ value: c.value, label: c.label, icon: c.icon }));
  const districtOptions = DISTRICTS.map((d) => ({ value: d, label: d }));

  return (
    <div className="page-container-narrow py-12">
      <div className="mb-8">
        <Link to={`/problems/${id}`} className="text-body-sm text-primary hover:underline mb-4 inline-block">
          ← Back to problem
        </Link>
        <h1 className="text-display font-display text-text flex items-center gap-2">
          <Pencil className="h-6 w-6 text-primary" />
          Edit Problem
        </h1>
        <p className="text-body-sm text-text-muted mt-1">
          Update the details of your reported civic problem.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-5">
          <Input
            label="Problem Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={errors.title}
            maxLength={200}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              required
              placeholder="Select Category"
              options={categoryOptions}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              error={errors.category}
            />
            <Select
              label="District"
              required
              placeholder="Select District"
              options={districtOptions}
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              error={errors.district}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Block / Town" value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} />
            <Input label="Landmark" value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} />
          </div>
          <Textarea
            label="Detailed Description"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={errors.description}
          />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-accent" />
            <h2 className="text-heading-sm font-semibold text-text">Coordinates</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <Input label="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-secondary" />
            <h2 className="text-heading-sm font-semibold text-text">Resources Needed</h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {RESOURCE_TYPES.map((res) => {
              const selected = form.resources_needed.includes(res.value);
              return (
                <button
                  key={res.value}
                  type="button"
                  onClick={() => toggleResource(res.value)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-body-sm font-medium border transition-all ${
                    selected ? 'border-secondary bg-secondary-50 text-secondary-dark' : 'border-border bg-surface text-text-muted'
                  }`}
                >
                  {res.icon} {res.label}
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-heading-sm font-semibold text-text">SDG Alignment</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SDG_GOALS.map((goal) => {
              const selected = form.sdg_tags.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleSdg(goal.id)}
                  style={{ borderColor: selected ? goal.color : '' }}
                  className={`text-left p-2.5 rounded-xl border text-caption font-medium ${
                    selected ? 'bg-surface font-semibold' : 'border-border bg-surface-alt/50 text-text-muted'
                  }`}
                >
                  {goal.id}. {goal.title}
                </button>
              );
            })}
          </div>
        </Card>

        {form.image_url && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-text-muted" />
              <h2 className="text-heading-sm font-semibold text-text">Current Image</h2>
            </div>
            <img src={form.image_url} alt="" className="max-h-60 rounded-xl object-cover" />
          </Card>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate(`/problems/${id}`)} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" loading={loading} iconRight={ArrowRight}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
