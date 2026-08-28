export const CATEGORIES = [
  { value: 'water', label: 'Water & Sanitation', icon: '💧' },
  { value: 'roads', label: 'Roads & Infrastructure', icon: '🛣️' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'environment', label: 'Environment', icon: '🌿' },
  { value: 'waste', label: 'Waste Management', icon: '♻️' },
  { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { value: 'digital', label: 'Digital Access', icon: '📱' },
  { value: 'energy', label: 'Energy & Power', icon: '⚡' },
  { value: 'public_infra', label: 'Public Infrastructure', icon: '🏗️' },
  { value: 'safety', label: 'Safety & Security', icon: '🛡️' },
  { value: 'mining', label: 'Mining Safety', icon: '⛏️' },
  { value: 'livelihood', label: 'Livelihood & Employment', icon: '💼' },
  { value: 'other', label: 'Other', icon: '📋' },
];

export const DISTRICTS = [
  'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka',
  'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla',
  'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar',
  'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi',
  'Sahibganj', 'Saraikela Kharsawan', 'Simdega', 'West Singhbhum',
];

export const STATUS_CONFIG = {
  open: {
    label: 'Open',
    color: 'status-open',
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
    description: 'Problem has been reported and is awaiting community response',
  },
  in_discussion: {
    label: 'In Discussion',
    color: 'status-discussion',
    bgClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotColor: 'bg-purple-500',
    description: 'Community is actively discussing this problem',
  },
  solution_proposed: {
    label: 'Solution Proposed',
    color: 'status-proposed',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
    description: 'A solution has been proposed and accepted',
  },
  evidence_submitted: {
    label: 'Evidence Submitted',
    color: 'status-evidence',
    bgClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dotColor: 'bg-cyan-500',
    description: 'Evidence of implementation has been submitted',
  },
  verification: {
    label: 'Under Verification',
    color: 'status-verification',
    bgClass: 'bg-orange-50 text-orange-700 border-orange-200',
    dotColor: 'bg-orange-500',
    description: 'Evidence is being verified by the community',
  },
  verified_solved: {
    label: 'Verified Solved',
    color: 'status-solved',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
    description: 'The problem has been verified as resolved',
  },
  needs_attention: {
    label: 'Needs Attention',
    color: 'status-attention',
    bgClass: 'bg-red-50 text-red-700 border-red-200',
    dotColor: 'bg-red-500',
    description: 'This problem requires urgent attention',
  },
};

export const STATUS_FLOW = [
  'open',
  'in_discussion',
  'solution_proposed',
  'evidence_submitted',
  'verification',
  'verified_solved',
];

export const RESOURCE_TYPES = [
  { value: 'funding', label: 'Funding', icon: '💰' },
  { value: 'volunteers', label: 'Volunteers', icon: '🤝' },
  { value: 'technical', label: 'Technical Expertise', icon: '💻' },
  { value: 'government', label: 'Government Approval', icon: '🏛️' },
  { value: 'materials', label: 'Raw Materials', icon: '🧱' },
  { value: 'equipment', label: 'Equipment', icon: '🔧' },
  { value: 'research', label: 'Research', icon: '🔬' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const ROLES = [
  { value: 'citizen', label: 'Citizen', description: 'Report problems, vote, and verify solutions' },
  { value: 'student', label: 'Student / University', description: 'Propose solutions, collaborate on projects' },
  { value: 'industry', label: 'Industry Professional', description: 'Provide expertise, resources, and mentorship' },
];

export const SDG_GOALS = [
  { id: 1, title: 'No Poverty', color: '#E5243B' },
  { id: 2, title: 'Zero Hunger', color: '#DDA63A' },
  { id: 3, title: 'Good Health and Well-being', color: '#4C9F38' },
  { id: 4, title: 'Quality Education', color: '#C5192D' },
  { id: 5, title: 'Gender Equality', color: '#FF3A21' },
  { id: 6, title: 'Clean Water and Sanitation', color: '#26BDE2' },
  { id: 7, title: 'Affordable and Clean Energy', color: '#FCC30B' },
  { id: 8, title: 'Decent Work and Economic Growth', color: '#A21942' },
  { id: 9, title: 'Industry, Innovation and Infrastructure', color: '#FD6925' },
  { id: 10, title: 'Reduced Inequalities', color: '#DD1367' },
  { id: 11, title: 'Sustainable Cities and Communities', color: '#FD9D24' },
  { id: 12, title: 'Responsible Consumption and Production', color: '#BF8B2E' },
  { id: 13, title: 'Climate Action', color: '#3F7E44' },
  { id: 14, title: 'Life Below Water', color: '#0A97D9' },
  { id: 15, title: 'Life on Land', color: '#56C02B' },
  { id: 16, title: 'Peace, Justice and Strong Institutions', color: '#00689D' },
  { id: 17, title: 'Partnerships for the Goals', color: '#19486A' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'most_upvoted', label: 'Most Upvoted' },
  { value: 'most_discussed', label: 'Most Discussed' },
  { value: 'recently_updated', label: 'Recently Updated' },
];

export const VERIFICATION_QUORUM = 3;

export const IMPACT_WEIGHTS = {
  verified_solution: 50,
  accepted_solution: 30,
  solution_proposal: 10,
  evidence_submitted: 15,
  verification_performed: 10,
  problem_posted: 5,
  helpful_comment: 3,
  upvote_received: 1,
  downvote_received: -1,
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for images
export const MAX_EVIDENCE_FILE_SIZE = 10 * 1024 * 1024; // 10MB for evidence
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_EVIDENCE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const CATEGORY_IMAGES = {
  water: 'https://images.unsplash.com/photo-1612731486606-2a14279741b8?w=800&auto=format&fit=crop', // Handpump / water supply
  roads: 'https://images.unsplash.com/photo-1594913785162-e67853b23efb?w=800&auto=format&fit=crop', // Muddy road / infrastructure
  education: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop', // Rural classroom
  healthcare: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800&auto=format&fit=crop', // Doctor & patient / rural clinic
  environment: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop', // Sunlit forest
  waste: 'https://images.unsplash.com/photo-1605600611280-146c68e0b983?w=800&auto=format&fit=crop', // Trash / garbage
  agriculture: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop', // Paddy field / India farming
  digital: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&auto=format&fit=crop', // Digital classroom / computer literacy
  energy: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop', // Solar panels / power supply
  public_infra: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=800&auto=format&fit=crop', // Public bridge / community structure
  safety: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop', // Rescue / emergency support
  mining: 'https://images.unsplash.com/photo-1578345218746-50a229b3d0f8?w=800&auto=format&fit=crop', // Coal mining site
  livelihood: 'https://images.unsplash.com/photo-1617634795446-b5ef1e7c5357?w=800&auto=format&fit=crop', // Weaving / rural work
  other: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop', // Community gathering
};

export const DEFAULT_PROBLEM_IMAGE = 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&auto=format&fit=crop'; // Community collaboration
export const DEFAULT_EVIDENCE_IMAGE = 'https://images.unsplash.com/photo-1586075010923-2dd45e9b2d4f?w=800&auto=format&fit=crop'; // Checklist / reporting

