import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/db';
import { Button, Input, Textarea, Select, Card } from '../components/ui';
import { MapPin, Globe, AlertTriangle, ArrowRight, Image as ImageIcon, Sparkles } from 'lucide-react';
import { CATEGORIES, DISTRICTS, SDG_GOALS, RESOURCE_TYPES, CATEGORY_IMAGES, DEFAULT_PROBLEM_IMAGE } from '../constants';
import toast from 'react-hot-toast';

export default function CreateProblemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    district: '',
    block: '',
    location_name: '',
    latitude: '',
    longitude: '',
    image_url: '',
    sdg_tags: [],
    resources_needed: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length < 10) errs.title = 'Title must be at least 10 characters';
    else if (form.title.trim().length > 200) errs.title = 'Title cannot exceed 200 characters';

    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.trim().length < 30) errs.description = 'Description must be at least 30 characters';

    if (!form.category) errs.category = 'Please select a category';
    if (!form.district) errs.district = 'Please select a district';

    if (form.latitude && isNaN(parseFloat(form.latitude))) errs.latitude = 'Must be a valid coordinate number';
    if (form.longitude && isNaN(parseFloat(form.longitude))) errs.longitude = 'Must be a valid coordinate number';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      setTempImage(file);
      // Generate a temporary local URL for preview
      const previewUrl = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, image_url: previewUrl }));
    }
  };

  const toggleSdg = (id) => {
    setForm((prev) => {
      const exists = prev.sdg_tags.includes(id);
      return {
        ...prev,
        sdg_tags: exists
          ? prev.sdg_tags.filter((t) => t !== id)
          : [...prev.sdg_tags, id],
      };
    });
  };

  const toggleResource = (value) => {
    setForm((prev) => {
      const exists = prev.resources_needed.includes(value);
      return {
        ...prev,
        resources_needed: exists
          ? prev.resources_needed.filter((r) => r !== value)
          : [...prev.resources_needed, value],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = form.image_url;
      // If a real image was uploaded, we'd upload it to Supabase Storage.
      // For local development or mock mode, we fallback to a high-quality category representation from Unsplash.
      if (tempImage) {
        imageUrl = CATEGORY_IMAGES[form.category] || DEFAULT_PROBLEM_IMAGE;
      }

      const problemPayload = {
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
        author_id: user.id,
      };

      const result = await dbService.createProblem(problemPayload);
      toast.success('Problem reported successfully! Moving to moderation/discussion.');
      navigate(`/problems/${result.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to submit problem statement.');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = CATEGORIES.map((c) => ({ value: c.value, label: c.label, icon: c.icon }));
  const districtOptions = DISTRICTS.map((d) => ({ value: d, label: d }));

  return (
    <div className="page-container-narrow py-12">
      <div className="mb-8">
        <h1 className="text-display font-display text-text">Report a Civic Problem</h1>
        <p className="text-body-sm text-text-muted mt-1">
          Add comprehensive details about the issue to help students, developers, and local government understand and resolve it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-5">
          <Input
            label="Problem Title"
            required
            placeholder="e.g. Broken water pipeline flooding road near High School"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={errors.title}
            maxLength={200}
            hint="Describe the core issue clearly in one sentence."
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
            <Input
              label="Block / Town"
              placeholder="e.g. Kanke"
              value={form.block}
              onChange={(e) => setForm({ ...form, block: e.target.value })}
            />

            <Input
              label="Specific Landmark / Address"
              placeholder="e.g. Near Panchayat Bhawan"
              value={form.location_name}
              onChange={(e) => setForm({ ...form, location_name: e.target.value })}
            />
          </div>

          <Textarea
            label="Detailed Description"
            required
            placeholder="Provide a comprehensive explanation of the problem, its impact on the local community, and how long it has been occurring..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={errors.description}
            hint="Min 30 characters. Explain details clearly."
          />
        </Card>

        {/* Location Coordinates */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-accent" />
            <h2 className="text-heading-sm font-semibold text-text">Geographical Coordinates (Optional)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Latitude"
              placeholder="e.g. 23.3441"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              error={errors.latitude}
            />
            <Input
              label="Longitude"
              placeholder="e.g. 85.3096"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              error={errors.longitude}
            />
          </div>
          <p className="text-caption text-text-muted mt-3">
            Adding coordinates renders this problem on our interactive map immediately for resource matching.
          </p>
        </Card>

        {/* Resources Needed */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-secondary" />
            <h2 className="text-heading-sm font-semibold text-text">Resources/Support Required</h2>
          </div>
          <p className="text-body-sm text-text-muted mb-4">
            Select the categories of help required to solve this problem.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {RESOURCE_TYPES.map((res) => {
              const selected = form.resources_needed.includes(res.value);
              return (
                <button
                  key={res.value}
                  type="button"
                  onClick={() => toggleResource(res.value)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-body-sm font-medium border transition-all duration-200 ${
                    selected
                      ? 'border-secondary bg-secondary-50 text-secondary-dark font-semibold'
                      : 'border-border bg-surface text-text-muted hover:bg-surface-alt'
                  }`}
                >
                  <span>{res.icon}</span>
                  {res.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* SDG Tagging */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-heading-sm font-semibold text-text">Sustainable Development Goals (SDG) Alignment</h2>
          </div>
          <p className="text-body-sm text-text-muted mb-4">
            Select the primary SDGs that resolving this problem will directly contribute to.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SDG_GOALS.map((goal) => {
              const selected = form.sdg_tags.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleSdg(goal.id)}
                  style={{ borderColor: selected ? goal.color : '' }}
                  className={`text-left p-2.5 rounded-xl border text-caption font-medium transition-all duration-200 ${
                    selected ? 'bg-surface font-semibold shadow-sm' : 'border-border bg-surface-alt/50 text-text-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: goal.color }}
                    />
                    <span className="truncate">{goal.id}. {goal.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Image Upload */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="h-5 w-5 text-text-muted" />
            <h2 className="text-heading-sm font-semibold text-text">Problem Image / Photo</h2>
          </div>
          <div className="flex items-center justify-center border-2 border-dashed border-border hover:border-border-strong rounded-2xl p-6 transition-colors">
            {form.image_url ? (
              <div className="text-center">
                <img
                  src={form.image_url}
                  alt="Problem preview"
                  className="max-h-60 rounded-xl object-cover mb-4"
                />
                <button
                  type="button"
                  onClick={() => {
                    setTempImage(null);
                    setForm((prev) => ({ ...prev, image_url: '' }));
                  }}
                  className="text-body-sm text-danger font-medium hover:underline"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <label className="cursor-pointer text-center flex flex-col items-center">
                <ImageIcon className="h-10 w-10 text-text-light mb-2" />
                <span className="text-body-sm font-medium text-primary">Upload problem photo</span>
                <span className="text-caption text-text-light mt-1">JPEG, PNG, or WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/feed')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            loading={loading}
            iconRight={ArrowRight}
          >
            Publish Problem
          </Button>
        </div>
      </form>
    </div>
  );
}
