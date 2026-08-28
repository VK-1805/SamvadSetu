import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { dbService } from '../services/db';
import { Card, StatusBadge, Badge, LoadingState } from '../components/ui';
import { MapPin, Globe, Compass, Grid, AlertTriangle } from 'lucide-react';
import { STATUS_CONFIG, CATEGORIES } from '../constants';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet icon fix for Webpack/Vite bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Status Markers using Leaflet's divIcon for rich aesthetics
const createCustomMarker = (status) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  
  // Choose marker color
  let color = '#3B82F6'; // blue
  if (status === 'in_discussion') color = '#8B5CF6'; // purple
  if (status === 'solution_proposed') color = '#D97706'; // amber
  if (status === 'evidence_submitted') color = '#0891B2'; // cyan
  if (status === 'verification') color = '#EA580C'; // orange
  if (status === 'verified_solved') color = '#059669'; // green
  if (status === 'needs_attention') color = '#DC2626'; // red

  return new L.DivIcon({
    html: `<div style="
      background-color: ${color};
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 8px rgba(0,0,0,0.4);
      animation: pulse 2s infinite;
    "></div>`,
    className: 'custom-leaflet-marker',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

export default function MapPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Jharkhand Center
  const defaultCenter = [23.3441, 85.3096];
  const defaultZoom = 8;

  useEffect(() => {
    const loadProblems = async () => {
      const { data } = await dbService.getProblems();
      if (data) {
        const withCoords = data.filter((p) => p.latitude && p.longitude);
        setProblems(withCoords);
      }
      setLoading(false);
    };
    loadProblems();
  }, []);

  const filteredProblems = problems.filter(p => {
    const matchDistrict = selectedDistrict === 'All' || p.district === selectedDistrict;
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchDistrict && matchCategory;
  });

  // Calculate stats by district for side panel
  const getDistrictDistribution = () => {
    const distribution = {};
    problems.forEach(p => {
      distribution[p.district] = distribution[p.district] || { total: 0, solved: 0 };
      distribution[p.district].total += 1;
      if (p.status === 'verified_solved') {
        distribution[p.district].solved += 1;
      }
    });
    return Object.entries(distribution).sort((a, b) => b[1].total - a[1].total);
  };

  const distStats = getDistrictDistribution();

  if (loading) return <LoadingState message="Mapping local problems..." />;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      
      {/* SIDEBAR: Filters & District Heatmap */}
      <div className="w-full lg:w-96 bg-surface border-r border-border flex flex-col overflow-y-auto p-5 space-y-6">
        <div>
          <h1 className="text-heading font-display text-text flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Jharkhand Civic Map
          </h1>
          <p className="text-caption text-text-muted mt-1">
            Displaying {filteredProblems.length} geo-tagged problems in Jharkhand.
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-3 border-b border-border pb-4">
          <div>
            <label className="block text-caption font-semibold text-text-muted mb-1">Filter District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 text-body-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Districts</option>
              {Array.from(new Set(problems.map(p => p.district))).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-caption font-semibold text-text-muted mb-1">Filter Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-body-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* District Distribution Stats */}
        <div className="flex-1 space-y-3">
          <h3 className="text-caption font-bold text-text-light uppercase tracking-wider">District Density Analysis</h3>
          {distStats.length === 0 ? (
            <p className="text-body-sm text-text-muted italic">No geo-tagged data available yet.</p>
          ) : (
            <div className="space-y-2">
              {distStats.map(([district, stat]) => (
                <button
                  key={district}
                  onClick={() => setSelectedDistrict(district)}
                  className={`w-full text-left p-3 border rounded-xl flex items-center justify-between transition-colors ${
                    selectedDistrict === district ? 'border-primary bg-primary-50' : 'border-border bg-surface-alt/20 hover:bg-surface-alt/50'
                  }`}
                >
                  <div>
                    <h4 className="text-body-sm font-semibold text-text">{district}</h4>
                    <p className="text-caption text-text-muted">Solved: {stat.solved}/{stat.total}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-primary text-white text-caption font-bold">
                    {stat.total}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAP VIEWPORT */}
      <div className="flex-1 relative h-[50vh] lg:h-full z-10">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredProblems.map(prob => {
            const cat = CATEGORIES.find(c => c.value === prob.category);
            return (
              <Marker
                key={prob.id}
                position={[prob.latitude, prob.longitude]}
                icon={createCustomMarker(prob.status)}
              >
                <Popup>
                  <div className="p-1 space-y-2 max-w-xs font-sans">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <StatusBadge status={prob.status} size="sm" showIcon={false} />
                      {cat && <Badge size="sm">{cat.icon} {cat.label}</Badge>}
                    </div>
                    
                    <h3 className="text-body-sm font-bold text-text line-clamp-2 leading-snug">
                      {prob.title}
                    </h3>
                    
                    <p className="text-caption text-text-muted flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {prob.district}{prob.block ? `, ${prob.block}` : ''}
                    </p>

                    <Link
                      to={`/problems/${prob.id}`}
                      className="inline-flex items-center justify-center w-full px-3 py-1.5 mt-2 bg-primary text-white rounded-lg text-caption font-semibold hover:bg-primary-light transition-colors text-center"
                    >
                      View Full Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

    </div>
  );
}
