import { supabase } from '../lib/supabase';
import { IS_MOCK } from '../lib/config';
import { CATEGORIES, DISTRICTS, IMPACT_WEIGHTS } from '../constants';

// Realistic Seed Data
const SEED_PROFILES = [
  { id: 'u1', name: 'Ravi Kisku', role: 'citizen', district: 'West Singhbhum', institution: null, avatar_url: null, impact_score: 45, resources_offered: [] },
  { id: 'u2', name: 'Dr. Ananya Sen', role: 'industry', district: 'Ranchi', institution: 'Jharkhand Health Society', avatar_url: null, impact_score: 120, resources_offered: ['technical', 'research'] },
  { id: 'u3', name: 'Siddharth Mahto', role: 'student', district: 'Dhanbad', institution: 'IIT (ISM) Dhanbad', avatar_url: null, impact_score: 95, resources_offered: ['volunteers', 'technical'] },
  { id: 'u4', name: 'Amit Kumar', role: 'admin', district: 'Ranchi', institution: 'Urban Development Dept', avatar_url: null, impact_score: 300, resources_offered: [] },
  { id: 'u5', name: 'Priya Soren', role: 'citizen', district: 'Dumka', institution: null, avatar_url: null, impact_score: 15, resources_offered: [] },
  { id: 'u6', name: 'Vikram Aditya', role: 'industry', district: 'Bokaro', institution: 'Steel Authority of India', avatar_url: null, impact_score: 160, resources_offered: ['funding', 'materials', 'equipment'] },
];

const SEED_PROBLEMS = [
  {
    id: 'p1',
    title: 'Severe arsenic contamination in groundwater of Sahebganj blocks',
    description: 'Groundwater in blocks like Udhwa and Rajmahal has shown high arsenic levels exceeding safe limits. Local communities are facing health issues like skin lesions. Urgent low-cost community filtration systems are needed.',
    category: 'water',
    status: 'open',
    district: 'Sahibganj',
    block: 'Udhwa',
    location_name: 'Udhwa Village, near river banks',
    latitude: 25.0125,
    longitude: 87.8432,
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop',
    sdg_tags: [6, 3, 10],
    resources_needed: ['technical', 'funding', 'volunteers'],
    author_id: 'u1',
    accepted_solution_id: null,
    upvote_count: 54,
    downvote_count: 2,
    comment_count: 4,
    is_featured: true,
    is_escalated: false,
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'p2',
    title: 'Lack of road connectivity in tribal settlements of Goilkera block',
    description: 'Multiple village hamlets (tolas) in Goilkera remain disconnected from primary healthcare centers and schools. During monsoons, mountain streams flood, completely isolating the population.',
    category: 'roads',
    status: 'in_discussion',
    district: 'West Singhbhum',
    block: 'Goilkera',
    location_name: 'Nawagaon Tola',
    latitude: 22.5124,
    longitude: 85.3812,
    image_url: 'https://images.unsplash.com/photo-1594913785162-e67853b23efb?w=600&auto=format&fit=crop',
    sdg_tags: [9, 11, 1],
    resources_needed: ['materials', 'volunteers', 'government'],
    author_id: 'u5',
    accepted_solution_id: null,
    upvote_count: 82,
    downvote_count: 1,
    comment_count: 6,
    is_featured: false,
    is_escalated: false,
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'p3',
    title: 'Post-mining coal dust pollution choking residents in Dhanbad coal belt',
    description: 'Uncovered coal transport trucks and active open-cast mines release heavy particulate matter. PM2.5 levels are persistently high, causing severe respiratory issues in children.',
    category: 'mining',
    status: 'solution_proposed',
    district: 'Dhanbad',
    block: 'Jharia',
    location_name: 'Jharia Coalfield area',
    latitude: 23.7412,
    longitude: 86.4182,
    image_url: 'https://images.unsplash.com/photo-1578345218746-50a229b3d0f8?w=600&auto=format&fit=crop',
    sdg_tags: [3, 11, 15],
    resources_needed: ['technical', 'equipment', 'government'],
    author_id: 'u3',
    accepted_solution_id: 'c2',
    upvote_count: 98,
    downvote_count: 4,
    comment_count: 5,
    is_featured: true,
    is_escalated: false,
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'p4',
    title: 'Lack of functional science labs in rural schools of Latehar',
    description: 'Government secondary schools in Balumath block have textbooks but no experimental equipment. Students have never seen a microscope or performed basic chemical tests.',
    category: 'education',
    status: 'verified_solved',
    district: 'Latehar',
    block: 'Balumath',
    location_name: 'Balumath Girls High School',
    latitude: 23.8344,
    longitude: 84.7831,
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop',
    sdg_tags: [4, 10],
    resources_needed: ['equipment', 'volunteers', 'funding'],
    author_id: 'u2',
    accepted_solution_id: 'c4',
    upvote_count: 45,
    downvote_count: 0,
    comment_count: 2,
    is_featured: false,
    is_escalated: false,
    created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'p5',
    title: 'No healthcare center within 20km range in forest areas of Khunti',
    description: 'Tribal communities living in deep forest hamlets lack emergency maternal healthcare. Transporting critical patients to Khunti town on makeshift cots often leads to casualties.',
    category: 'healthcare',
    status: 'open',
    district: 'Khunti',
    block: 'Arki',
    location_name: 'Arki forest range villages',
    latitude: 22.8421,
    longitude: 85.3491,
    image_url: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&auto=format&fit=crop',
    sdg_tags: [3, 10, 17],
    resources_needed: ['funding', 'technical', 'volunteers'],
    author_id: 'u1',
    accepted_solution_id: null,
    upvote_count: 110,
    downvote_count: 1,
    comment_count: 3,
    is_featured: true,
    is_escalated: true,
    escalated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'p6',
    title: 'Contaminated drinking water supply in Kanke Block, Ranchi',
    description: 'Over 200 families near Kanke reservoir rely on a cracked pipeline that mixes sewage with drinking water. Children report frequent stomach infections. A community-level filtration and pipe repair initiative is urgently needed.',
    category: 'water',
    status: 'in_discussion',
    district: 'Ranchi',
    block: 'Kanke',
    location_name: 'Kanke reservoir pipeline junction',
    latitude: 23.4089,
    longitude: 85.3219,
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop',
    sdg_tags: [6, 3],
    resources_needed: ['technical', 'materials', 'volunteers'],
    author_id: 'u5',
    accepted_solution_id: null,
    upvote_count: 42,
    downvote_count: 0,
    comment_count: 2,
    is_featured: false,
    is_escalated: false,
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'p7',
    title: 'Collapsed culvert on Dhanbad-Giridih road causing 40km detours',
    description: 'Monsoon rains washed away a culvert near Topchanchi, forcing heavy vehicles and ambulances to take a 40km detour. Local traders and patients suffer daily delays.',
    category: 'roads',
    status: 'solution_proposed',
    district: 'Dhanbad',
    block: 'Topchanchi',
    location_name: 'NH-2 near Topchanchi lake',
    latitude: 23.9012,
    longitude: 86.1923,
    image_url: 'https://images.unsplash.com/photo-1594913785162-e67853b23efb?w=600&auto=format&fit=crop',
    sdg_tags: [9, 11],
    resources_needed: ['materials', 'government', 'funding'],
    author_id: 'u1',
    accepted_solution_id: null,
    upvote_count: 67,
    downvote_count: 2,
    comment_count: 4,
    is_featured: true,
    is_escalated: false,
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'p8',
    title: 'No primary healthcare center within 15km in Simdega tribal belt',
    description: 'Pregnant women and critical patients in remote Simdega hamlets must travel on foot or bullock carts for hours to reach the nearest PHC. Several preventable maternal emergencies have been reported.',
    category: 'healthcare',
    status: 'open',
    district: 'Simdega',
    block: 'Kolebira',
    location_name: 'Kolebira forest hamlets',
    latitude: 22.6156,
    longitude: 84.5021,
    image_url: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&auto=format&fit=crop',
    sdg_tags: [3, 10],
    resources_needed: ['funding', 'volunteers', 'government'],
    author_id: 'u5',
    accepted_solution_id: null,
    upvote_count: 31,
    downvote_count: 0,
    comment_count: 1,
    is_featured: false,
    is_escalated: false,
    created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'p9',
    title: 'Open garbage dumps polluting Subarnarekha river in Jamshedpur outskirts',
    description: 'Unregulated waste dumping near Mango and Bagbera is contaminating the Subarnarekha river. Fisherfolk report declining catches and skin diseases from contact with polluted water.',
    category: 'waste',
    status: 'evidence_submitted',
    district: 'East Singhbhum',
    block: 'Jamshedpur',
    location_name: 'Bagbera ghat area',
    latitude: 22.8048,
    longitude: 86.1814,
    image_url: 'https://images.unsplash.com/photo-1605600611280-146c68e0b983?w=600&auto=format&fit=crop',
    sdg_tags: [6, 14, 11],
    resources_needed: ['volunteers', 'equipment', 'government'],
    author_id: 'u2',
    accepted_solution_id: 'c6',
    upvote_count: 55,
    downvote_count: 1,
    comment_count: 3,
    is_featured: false,
    is_escalated: false,
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'p10',
    title: 'Lack of digital literacy centres in rural Gumla blocks',
    description: 'Students and farmers in Gumla blocks cannot access online government schemes, banking, or telemedicine due to zero digital literacy infrastructure. A mobile training van model could reach 20 villages.',
    category: 'digital',
    status: 'verification',
    district: 'Gumla',
    block: 'Basia',
    location_name: 'Basia block headquarters',
    latitude: 23.0456,
    longitude: 84.5423,
    image_url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=600&auto=format&fit=crop',
    sdg_tags: [4, 8, 10],
    resources_needed: ['equipment', 'volunteers', 'technical'],
    author_id: 'u3',
    accepted_solution_id: 'c7',
    upvote_count: 38,
    downvote_count: 0,
    comment_count: 2,
    is_featured: true,
    is_escalated: false,
    created_at: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'p11',
    title: 'Illegal stone quarrying threatening tribal farmland in Pakur',
    description: 'Unregulated quarry operations near Amrapara are blasting within 200 metres of tribal paddy fields, causing cracks in homes and dust pollution. Farmers demand geo-fencing and environmental monitoring.',
    category: 'mining',
    status: 'open',
    district: 'Pakur',
    block: 'Amrapara',
    location_name: 'Amrapara quarry zone',
    latitude: 24.6334,
    longitude: 87.8421,
    image_url: 'https://images.unsplash.com/photo-1578345218746-50a229b3d0f8?w=600&auto=format&fit=crop',
    sdg_tags: [15, 11, 16],
    resources_needed: ['government', 'research', 'technical'],
    author_id: 'u1',
    accepted_solution_id: null,
    upvote_count: 73,
    downvote_count: 3,
    comment_count: 5,
    is_featured: false,
    is_escalated: true,
    escalated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'p12',
    title: 'Crop failure from erratic irrigation in Palamu drought blocks',
    description: 'Farmers in Chainpur and nearby blocks lost two consecutive kharif seasons due to broken canal gates and no drought advisory system. A low-cost soil moisture sensor network could prevent future losses.',
    category: 'agriculture',
    status: 'in_discussion',
    district: 'Palamu',
    block: 'Chainpur',
    location_name: 'Chainpur canal headworks',
    latitude: 24.0123,
    longitude: 84.0654,
    image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop',
    sdg_tags: [2, 13, 9],
    resources_needed: ['technical', 'funding', 'research'],
    author_id: 'u6',
    accepted_solution_id: null,
    upvote_count: 49,
    downvote_count: 1,
    comment_count: 3,
    is_featured: false,
    is_escalated: false,
    created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  }
];

const SEED_COMMENTS = [
  { id: 'c1', problem_id: 'p1', author_id: 'u2', parent_id: null, content: 'We can deploy low-cost biosand filters. My research lab has a design that uses local sand, gravel, and charcoal. Cost is under ₹800 per unit.', is_solution: true, is_accepted: false, resources_offered: ['technical', 'research'], skills_offered: ['Water Testing', 'Biosand filter design'], estimated_effort: '2 weeks', implementation_notes: 'Requires building local awareness.', upvote_count: 12, downvote_count: 0, created_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString() },
  { id: 'c2', problem_id: 'p3', author_id: 'u3', parent_id: null, content: 'IIT ISM students can design windbreak dust barriers using recycled materials and set up regular mist-sprinklers around schools in coal zones.', is_solution: true, is_accepted: true, resources_offered: ['volunteers', 'technical'], skills_offered: ['Civil Engineering', 'Aerosol studies'], estimated_effort: '1 month', implementation_notes: 'Requires coordination with local mine management and school authorities.', upvote_count: 35, downvote_count: 1, created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() },
  { id: 'c3', problem_id: 'p3', author_id: 'u6', parent_id: null, content: 'Our factory in Bokaro can donate structural frames/scaffolding to set up dust screens. Let me know the dimensions.', is_solution: false, is_accepted: false, resources_offered: ['materials'], skills_offered: [], estimated_effort: null, implementation_notes: null, upvote_count: 14, downvote_count: 0, created_at: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString() },
  { id: 'c4', problem_id: 'p4', author_id: 'u3', parent_id: null, content: 'We can build a mobile science lab kit containing basic chemistry reagents, a portable microscope, and physics kits, and travel to 5 different schools.', is_solution: true, is_accepted: true, resources_offered: ['volunteers', 'equipment'], skills_offered: ['Science Education', 'Physics coaching'], estimated_effort: '3 weeks', implementation_notes: 'Already verified. Completed with volunteer support from college.', upvote_count: 22, downvote_count: 0, created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString() },
  { id: 'c5', problem_id: 'p2', author_id: 'u3', parent_id: null, content: 'Can we build a simple bamboo bridge or suspension footbridge across the stream? It would handle pedestrians and bikes.', is_solution: true, is_accepted: false, resources_offered: ['volunteers'], skills_offered: ['Basic structural design'], estimated_effort: '3 weeks', implementation_notes: 'Needs village volunteer mobilization.', upvote_count: 18, downvote_count: 0, created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString() },
  { id: 'c6', problem_id: 'p9', author_id: 'u3', parent_id: null, content: 'Deploy community composting units and weekly riverbank cleanup drives with IIT student volunteers. Partner with Jamshedpur municipal body for waste segregation bins.', is_solution: true, is_accepted: true, resources_offered: ['volunteers', 'technical'], skills_offered: ['Waste management', 'Community mobilization'], estimated_effort: '6 weeks', implementation_notes: 'Phase 1 cleanup completed; evidence submitted.', upvote_count: 28, downvote_count: 0, created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString() },
  { id: 'c7', problem_id: 'p10', author_id: 'u3', parent_id: null, content: 'Convert a retired bus into a mobile digital literacy lab with solar panels, laptops, and trained student volunteers visiting 20 villages per month.', is_solution: true, is_accepted: true, resources_offered: ['volunteers', 'equipment', 'technical'], skills_offered: ['Digital literacy', 'Hardware setup'], estimated_effort: '2 months', implementation_notes: 'Bus retrofitted; 8 villages covered so far.', upvote_count: 41, downvote_count: 0, created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() },
  { id: 'c8', problem_id: 'p2', author_id: 'u5', parent_id: 'c5', content: 'Our panchayat can mobilize 15–20 local volunteers for bamboo collection if IIT students provide the structural design. We can start within a week of approval.', is_solution: false, is_accepted: false, resources_offered: ['volunteers'], skills_offered: [], estimated_effort: null, implementation_notes: null, upvote_count: 9, downvote_count: 0, created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() },
];

const SEED_EVIDENCE = [
  { id: 'e1', problem_id: 'p4', solution_id: 'c4', submitted_by: 'u3', file_url: 'https://images.unsplash.com/photo-1532187863486-abf9d39d6618?w=600&auto=format&fit=crop', file_type: 'image', description: 'Delivered 5 portable science kit boxes containing microscopes, glass test tubes, chemical reagents, and a manual to Balumath Girls High School.', created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString() },
  { id: 'e2', problem_id: 'p9', solution_id: 'c6', submitted_by: 'u3', file_url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&auto=format&fit=crop', file_type: 'image', description: 'Completed first phase riverbank cleanup — 2 tonnes of waste removed from Bagbera ghat. Composting units installed at 3 ward locations.', created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
  { id: 'e3', problem_id: 'p10', solution_id: 'c7', submitted_by: 'u3', file_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop', file_type: 'image', description: 'Mobile digital literacy bus operational — 240 farmers and students trained across 8 Gumla villages in first month.', created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
];

const SEED_VERIFICATIONS = [
  { id: 'v1', problem_id: 'p4', evidence_id: 'e1', verified_by: 'u2', status: 'confirmed', notes: 'Verified the delivery. Visited the school and confirmed students are using the kits in class.', created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString() },
  { id: 'v2', problem_id: 'p4', evidence_id: 'e1', verified_by: 'u1', status: 'confirmed', notes: 'Local community members verified that science classes are running. Excellent project.', created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString() },
  { id: 'v3', problem_id: 'p4', evidence_id: 'e1', verified_by: 'u5', status: 'confirmed', notes: 'Verified solved. The children are extremely excited.', created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
  { id: 'v4', problem_id: 'p9', evidence_id: 'e2', verified_by: 'u2', status: 'confirmed', notes: 'Visited Bagbera ghat — visible improvement in water clarity near cleanup zone.', created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
  { id: 'v5', problem_id: 'p10', evidence_id: 'e3', verified_by: 'u1', status: 'confirmed', notes: 'Attended training session in Basia — farmers successfully registered for PM-KISAN online.', created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
  { id: 'v6', problem_id: 'p10', evidence_id: 'e3', verified_by: 'u2', status: 'confirmed', notes: 'Confirmed 8 villages covered with documented attendance sheets.', created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
];

const SEED_VOTES = [
  { id: 'v_p1', user_id: 'u1', problem_id: 'p1', vote_type: 1 },
  { id: 'v_p2', user_id: 'u1', problem_id: 'p2', vote_type: 1 },
  { id: 'v_p3', user_id: 'u2', problem_id: 'p1', vote_type: 1 },
  { id: 'v_p4', user_id: 'u3', problem_id: 'p3', vote_type: 1 },
  { id: 'v_p5', user_id: 'u3', problem_id: 'p4', vote_type: 1 }
];

const SEED_ACTIVITIES = [
  { id: 'act1', problem_id: 'p4', actor_id: 'u2', action: 'problem_created', metadata: {}, created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString() },
  { id: 'act2', problem_id: 'p4', actor_id: 'u3', action: 'solution_proposed', metadata: { comment_id: 'c4' }, created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString() },
  { id: 'act3', problem_id: 'p4', actor_id: 'u2', action: 'solution_accepted', metadata: { comment_id: 'c4' }, created_at: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString() },
  { id: 'act4', problem_id: 'p4', actor_id: 'u3', action: 'evidence_submitted', metadata: { evidence_id: 'e1' }, created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString() },
  { id: 'act5', problem_id: 'p4', actor_id: 'u4', action: 'status_changed', metadata: { status: 'verified_solved' }, created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() }
];

// LocalStorage Initialization
const SEED_VERSION = '4';

const initLocalDB = () => {
  const needsReseed = localStorage.getItem('ss_seed_version') !== SEED_VERSION;

  if (needsReseed || !localStorage.getItem('ss_profiles')) {
    localStorage.setItem('ss_profiles', JSON.stringify(SEED_PROFILES));
  }
  if (needsReseed || !localStorage.getItem('ss_problems')) {
    localStorage.setItem('ss_problems', JSON.stringify(SEED_PROBLEMS));
  }
  if (needsReseed || !localStorage.getItem('ss_comments')) {
    localStorage.setItem('ss_comments', JSON.stringify(SEED_COMMENTS));
  }
  if (needsReseed || !localStorage.getItem('ss_evidence')) {
    localStorage.setItem('ss_evidence', JSON.stringify(SEED_EVIDENCE));
  }
  if (needsReseed || !localStorage.getItem('ss_verifications')) {
    localStorage.setItem('ss_verifications', JSON.stringify(SEED_VERIFICATIONS));
  }
  if (needsReseed || !localStorage.getItem('ss_votes')) {
    localStorage.setItem('ss_votes', JSON.stringify(SEED_VOTES));
  }
  if (needsReseed || !localStorage.getItem('ss_activities')) {
    localStorage.setItem('ss_activities', JSON.stringify(SEED_ACTIVITIES));
  }

  if (needsReseed) {
    localStorage.setItem('ss_seed_version', SEED_VERSION);
  }
};

if (IS_MOCK) {
  initLocalDB();
}

const getStorageItem = (key) => JSON.parse(localStorage.getItem(key));
const setStorageItem = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Simulation delay helper
const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

export const dbService = {
  // --- PROFILES ---
  async getProfile(userId) {
    if (!IS_MOCK) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      return data;
    }
    await delay();
    const profiles = getStorageItem('ss_profiles');
    return profiles.find(p => p.id === userId) || null;
  },

  async updateProfile(userId, updates) {
    if (!IS_MOCK) {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
      if (error) throw error;
      return data;
    }
    await delay();
    const profiles = getStorageItem('ss_profiles');
    const index = profiles.findIndex(p => p.id === userId);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...updates };
      setStorageItem('ss_profiles', profiles);
      return profiles[index];
    }
    throw new Error('Profile not found');
  },

  async getTopContributors() {
    if (!IS_MOCK) {
      const { data, error } = await supabase.from('profiles').select('*').order('impact_score', { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    }
    await delay();
    const profiles = getStorageItem('ss_profiles');
    return [...profiles].sort((a, b) => b.impact_score - a.impact_score).slice(0, 10);
  },

  // --- PROBLEMS ---
  async getProblems(filters = {}, sort = 'newest', pagination = null) {
    if (!IS_MOCK) {
      let query = supabase
        .from('problems')
        .select('*, author:profiles!problems_author_id_fkey(id, name, avatar_url, role)', { count: 'exact' });

      if (filters.category) query = query.eq('category', filters.category);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.district) query = query.eq('district', filters.district);
      if (filters.q) {
        query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
      }
      if (filters.resourceOffered) {
        query = query.contains('resources_needed', [filters.resourceOffered]);
      }

      switch (sort) {
        case 'most_upvoted':
          query = query.order('upvote_count', { ascending: false });
          break;
        case 'most_discussed':
          query = query.order('comment_count', { ascending: false });
          break;
        case 'recently_updated':
          query = query.order('updated_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      if (pagination) {
        const from = (pagination.page - 1) * pagination.pageSize;
        query = query.range(from, from + pagination.pageSize - 1);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    }

    await delay(200);
    let problems = getStorageItem('ss_problems');
    const profiles = getStorageItem('ss_profiles');

    if (filters.category) {
      problems = problems.filter((p) => p.category === filters.category);
    }
    if (filters.status) {
      problems = problems.filter((p) => p.status === filters.status);
    }
    if (filters.district) {
      problems = problems.filter((p) => p.district === filters.district);
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      problems = problems.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (filters.resourceOffered) {
      problems = problems.filter(
        (p) => p.resources_needed && p.resources_needed.includes(filters.resourceOffered)
      );
    }

    problems = problems.map((p) => ({
      ...p,
      author: profiles.find((pr) => pr.id === p.author_id),
    }));

    if (sort === 'most_upvoted') {
      problems.sort(
        (a, b) => (b.upvote_count - b.downvote_count) - (a.upvote_count - a.downvote_count)
      );
    } else if (sort === 'most_discussed') {
      problems.sort((a, b) => b.comment_count - a.comment_count);
    } else if (sort === 'recently_updated') {
      problems.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    } else {
      problems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    const total = problems.length;
    if (pagination) {
      const start = (pagination.page - 1) * pagination.pageSize;
      problems = problems.slice(start, start + pagination.pageSize);
    }

    return { data: problems, count: total };
  },

  async getProblemById(id) {
    if (!IS_MOCK) {
      const { data, error } = await supabase
        .from('problems')
        .select('*, author:profiles!problems_author_id_fkey(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    }
    await delay();
    const problems = getStorageItem('ss_problems');
    const profiles = getStorageItem('ss_profiles');
    const problem = problems.find(p => p.id === id);
    if (!problem) return null;
    return {
      ...problem,
      author: profiles.find(pr => pr.id === problem.author_id)
    };
  },

  async createProblem(problemData) {
    if (!IS_MOCK) {
      const { data, error } = await supabase.from('problems').insert(problemData).select().single();
      if (error) throw error;
      return data;
    }
    await delay();
    const problems = getStorageItem('ss_problems');
    const newProblem = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      ...problemData,
      upvote_count: 0,
      downvote_count: 0,
      comment_count: 0,
      status: 'open',
      accepted_solution_id: null,
      is_featured: false,
      is_escalated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    problems.unshift(newProblem);
    setStorageItem('ss_problems', problems);

    // Activity Log
    this.addActivity(newProblem.id, problemData.author_id, 'problem_created');
    this.updateUserScore(problemData.author_id, IMPACT_WEIGHTS.problem_posted);

    return newProblem;
  },

  async updateProblem(problemId, updates) {
    if (!IS_MOCK) {
      const { data, error } = await supabase
        .from('problems')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', problemId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    await delay();
    const problems = getStorageItem('ss_problems');
    const index = problems.findIndex((p) => p.id === problemId);
    if (index === -1) throw new Error('Problem not found');
    problems[index] = { ...problems[index], ...updates, updated_at: new Date().toISOString() };
    setStorageItem('ss_problems', problems);
    return problems[index];
  },

  async deleteProblem(problemId, user) {
    if (!user) throw new Error('Not authenticated');

    if (!IS_MOCK) {
      const { error } = await supabase
        .from('problems')
        .delete()
        .eq('id', problemId);
      if (error) throw error;
      return true;
    }

    await delay();
    const problems = getStorageItem('ss_problems');
    const problem = problems.find(p => p.id === problemId);
    if (!problem) throw new Error('Problem not found');

    const isAdmin = user.role === 'admin';
    if (problem.author_id !== user.id && !isAdmin) {
      throw new Error('Not authorized to delete this problem');
    }

    // Mock cascade deletions
    const comments = getStorageItem('ss_comments') || [];
    const problemComments = comments.filter(c => c.problem_id === problemId);
    const commentIds = problemComments.map(c => c.id);

    // Remove comments
    const remainingComments = comments.filter(c => c.problem_id !== problemId);
    setStorageItem('ss_comments', remainingComments);

    // Remove votes
    const votes = getStorageItem('ss_votes') || [];
    const remainingVotes = votes.filter(v => 
      v.problem_id !== problemId && (!v.comment_id || !commentIds.includes(v.comment_id))
    );
    setStorageItem('ss_votes', remainingVotes);

    // Remove evidence
    const evidence = getStorageItem('ss_evidence') || [];
    const remainingEvidence = evidence.filter(e => e.problem_id !== problemId);
    setStorageItem('ss_evidence', remainingEvidence);

    // Remove verifications
    const verifications = getStorageItem('ss_verifications') || [];
    const remainingVerifications = verifications.filter(v => v.problem_id !== problemId);
    setStorageItem('ss_verifications', remainingVerifications);

    // Remove activities
    const activities = getStorageItem('ss_activities') || [];
    const remainingActivities = activities.filter(a => a.problem_id !== problemId);
    setStorageItem('ss_activities', remainingActivities);

    // Remove problem itself
    const remainingProblems = problems.filter(p => p.id !== problemId);
    setStorageItem('ss_problems', remainingProblems);

    return true;
  },

  async updateProblemStatus(problemId, status, actorId) {
    if (!IS_MOCK) {
      const { data, error } = await supabase.from('problems').update({ status, updated_at: new Date().toISOString() }).eq('id', problemId).select().single();
      if (error) throw error;
      return data;
    }
    await delay();
    const problems = getStorageItem('ss_problems');
    const index = problems.findIndex(p => p.id === problemId);
    if (index !== -1) {
      const oldStatus = problems[index].status;
      problems[index].status = status;
      problems[index].updated_at = new Date().toISOString();
      setStorageItem('ss_problems', problems);

      this.addActivity(problemId, actorId, 'status_changed', { oldStatus, newStatus: status });
      return problems[index];
    }
  },

  // --- COMMENTS ---
  async getComments(problemId) {
    if (!IS_MOCK) {
      const { data, error } = await supabase
        .from('comments')
        .select('*, author:profiles!comments_author_id_fkey(*)')
        .eq('problem_id', problemId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    }
    await delay();
    const comments = getStorageItem('ss_comments');
    const profiles = getStorageItem('ss_profiles');
    return comments
      .filter(c => c.problem_id === problemId)
      .map(c => ({
        ...c,
        author: profiles.find(pr => pr.id === c.author_id)
      }));
  },

  async createComment(commentData) {
    if (!IS_MOCK) {
      const { data, error } = await supabase.from('comments').insert(commentData).select().single();
      if (error) throw error;
      return data;
    }
    await delay();
    const comments = getStorageItem('ss_comments');
    const newComment = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      ...commentData,
      is_accepted: false,
      upvote_count: 0,
      downvote_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    comments.push(newComment);
    setStorageItem('ss_comments', comments);

    // Update comment count on problem
    const problems = getStorageItem('ss_problems');
    const pIndex = problems.findIndex(p => p.id === commentData.problem_id);
    if (pIndex !== -1) {
      problems[pIndex].comment_count = (problems[pIndex].comment_count || 0) + 1;
      problems[pIndex].updated_at = new Date().toISOString();
      // Auto move status to In Discussion if currently Open
      if (problems[pIndex].status === 'open') {
        problems[pIndex].status = 'in_discussion';
        this.addActivity(commentData.problem_id, commentData.author_id, 'status_changed', { oldStatus: 'open', newStatus: 'in_discussion' });
      }
      setStorageItem('ss_problems', problems);
    }

    this.addActivity(commentData.problem_id, commentData.author_id, commentData.is_solution ? 'solution_proposed' : 'comment_added', { comment_id: newComment.id });
    
    // Impact score
    const points = commentData.is_solution ? IMPACT_WEIGHTS.solution_proposal : IMPACT_WEIGHTS.helpful_comment;
    this.updateUserScore(commentData.author_id, points);

    return newComment;
  },

  async acceptSolution(problemId, commentId, actorId) {
    if (!IS_MOCK) {
      const { error } = await supabase.rpc('accept_solution', { p_id: problemId, c_id: commentId });
      if (error) throw error;
      return true;
    }
    await delay();
    const comments = getStorageItem('ss_comments');
    const problems = getStorageItem('ss_problems');

    // Reset others
    comments.forEach(c => {
      if (c.problem_id === problemId) c.is_accepted = false;
    });

    const cIndex = comments.findIndex(c => c.id === commentId);
    if (cIndex !== -1) {
      comments[cIndex].is_accepted = true;
      setStorageItem('ss_comments', comments);

      const pIndex = problems.findIndex(p => p.id === problemId);
      if (pIndex !== -1) {
        problems[pIndex].accepted_solution_id = commentId;
        problems[pIndex].status = 'solution_proposed';
        problems[pIndex].updated_at = new Date().toISOString();
        setStorageItem('ss_problems', problems);
      }

      this.addActivity(problemId, actorId, 'solution_accepted', { comment_id: commentId });
      this.updateUserScore(comments[cIndex].author_id, IMPACT_WEIGHTS.accepted_solution);
      return true;
    }
    return false;
  },

  async updateComment(commentId, updates, user) {
    if (!user) throw new Error('Not authenticated');

    if (!IS_MOCK) {
      const { data, error } = await supabase
        .from('comments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    await delay();
    const comments = getStorageItem('ss_comments');
    const index = comments.findIndex(c => c.id === commentId);
    if (index === -1) throw new Error('Response not found');

    const isAdmin = user.role === 'admin';
    if (comments[index].author_id !== user.id && !isAdmin) {
      throw new Error('Not authorized to edit this response');
    }

    comments[index] = { ...comments[index], ...updates, updated_at: new Date().toISOString() };
    setStorageItem('ss_comments', comments);

    const profiles = getStorageItem('ss_profiles');
    return {
      ...comments[index],
      author: profiles.find(p => p.id === comments[index].author_id)
    };
  },

  async deleteComment(commentId, user) {
    if (!user) throw new Error('Not authenticated');

    let comment = null;
    let problem = null;

    if (!IS_MOCK) {
      // Fetch comment
      const { data: cData, error: cErr } = await supabase
        .from('comments')
        .select('*')
        .eq('id', commentId)
        .single();
      if (cErr) throw cErr;
      comment = cData;

      // Fetch problem
      const { data: pData, error: pErr } = await supabase
        .from('problems')
        .select('*')
        .eq('id', comment.problem_id)
        .single();
      if (pErr) throw pErr;
      problem = pData;

      // Delete comment
      const { error: delErr } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      if (delErr) throw delErr;

      // If this comment was the accepted solution, update problem status back to 'in_discussion'
      if (problem.accepted_solution_id === commentId) {
        const { error: pUpdErr } = await supabase
          .from('problems')
          .update({ accepted_solution_id: null, status: 'in_discussion', updated_at: new Date().toISOString() })
          .eq('id', problem.id);
        if (pUpdErr) {
          console.error('Failed to reset problem accepted_solution_id after solution deletion:', pUpdErr);
        }
      }
      return true;
    }

    await delay();
    const comments = getStorageItem('ss_comments');
    const cIndex = comments.findIndex(c => c.id === commentId);
    if (cIndex === -1) throw new Error('Comment not found');
    comment = comments[cIndex];

    const isAdmin = user.role === 'admin';
    if (comment.author_id !== user.id && !isAdmin) {
      throw new Error('Not authorized to delete this response');
    }

    const problems = getStorageItem('ss_problems');
    const pIndex = problems.findIndex(p => p.id === comment.problem_id);
    if (pIndex !== -1) {
      problem = problems[pIndex];
      // Decrement comment count
      problem.comment_count = Math.max(0, (problem.comment_count || 1) - 1);

      // If accepted solution, reset it
      if (problem.accepted_solution_id === commentId) {
        problem.accepted_solution_id = null;
        problem.status = 'in_discussion';
      }
      problem.updated_at = new Date().toISOString();
      setStorageItem('ss_problems', problems);
    }

    // Cascade delete sub-comments (replies)
    const remainingComments = comments.filter(c => c.id !== commentId && c.parent_id !== commentId);
    setStorageItem('ss_comments', remainingComments);

    // Clean up votes on this comment
    const votes = getStorageItem('ss_votes') || [];
    const remainingVotes = votes.filter(v => v.comment_id !== commentId);
    setStorageItem('ss_votes', remainingVotes);

    return true;
  },

  // --- VOTES ---
  async getVote(userId, problemId, commentId) {
    if (!IS_MOCK) {
      let q = supabase.from('votes').select('*').eq('user_id', userId);
      if (problemId) q = q.eq('problem_id', problemId);
      if (commentId) q = q.eq('comment_id', commentId);
      const { data, error } = await q.maybeSingle();
      if (error) throw error;
      return data;
    }
    await delay();
    const votes = getStorageItem('ss_votes');
    return votes.find(v => 
      v.user_id === userId && 
      ((problemId && v.problem_id === problemId) || (commentId && v.comment_id === commentId))
    ) || null;
  },

  async getCommentVotes(userId, commentIds) {
    if (!commentIds?.length) return [];
    if (!IS_MOCK) {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', userId)
        .in('comment_id', commentIds);
      if (error) throw error;
      return data || [];
    }
    await delay();
    const votes = getStorageItem('ss_votes');
    return votes.filter(
      (v) => v.user_id === userId && commentIds.includes(v.comment_id)
    );
  },

  async castVote({ userId, problemId, commentId, voteType }) {
    if (!IS_MOCK) {
      const existing = await this.getVote(userId, problemId, commentId);

      if (voteType === 0) {
        if (!existing) return true;
        const { error } = await supabase.from('votes').delete().eq('id', existing.id);
        if (error) throw error;
        return true;
      }

      if (existing) {
        const { error } = await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('votes').insert({
          user_id: userId,
          problem_id: problemId || null,
          comment_id: commentId || null,
          vote_type: voteType,
        });
        if (error) throw error;
      }
      return true;
    }
    await delay();
    const votes = getStorageItem('ss_votes');
    const existingIndex = votes.findIndex(v => 
      v.user_id === userId && 
      ((problemId && v.problem_id === problemId) || (commentId && v.comment_id === commentId))
    );

    let diff = voteType; // change in count
    let oldVote = 0;

    if (existingIndex !== -1) {
      oldVote = votes[existingIndex].vote_type;
      if (voteType === 0) {
        // Remove vote
        votes.splice(existingIndex, 1);
        diff = -oldVote;
      } else {
        // Change vote
        votes[existingIndex].vote_type = voteType;
        diff = voteType - oldVote;
      }
    } else if (voteType !== 0) {
      // New vote
      votes.push({
        id: 'v_' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        problem_id: problemId || null,
        comment_id: commentId || null,
        vote_type: voteType
      });
    }

    setStorageItem('ss_votes', votes);

    // Apply count changes
    if (problemId) {
      const problems = getStorageItem('ss_problems');
      const index = problems.findIndex(p => p.id === problemId);
      if (index !== -1) {
        if (diff > 0) {
          if (oldVote === -1) {
            problems[index].downvote_count = Math.max(0, problems[index].downvote_count - 1);
            problems[index].upvote_count += 1;
          } else {
            problems[index].upvote_count += 1;
          }
        } else if (diff < 0) {
          if (oldVote === 1) {
            problems[index].upvote_count = Math.max(0, problems[index].upvote_count - 1);
            problems[index].downvote_count += 1;
          } else {
            problems[index].downvote_count += 1;
          }
        } else {
          // absolute removal
          if (oldVote === 1) problems[index].upvote_count = Math.max(0, problems[index].upvote_count - 1);
          if (oldVote === -1) problems[index].downvote_count = Math.max(0, problems[index].downvote_count - 1);
        }
        setStorageItem('ss_problems', problems);
      }
    } else if (commentId) {
      const comments = getStorageItem('ss_comments');
      const index = comments.findIndex(c => c.id === commentId);
      if (index !== -1) {
        if (diff > 0) {
          if (oldVote === -1) {
            comments[index].downvote_count = Math.max(0, comments[index].downvote_count - 1);
            comments[index].upvote_count += 1;
          } else {
            comments[index].upvote_count += 1;
          }
        } else if (diff < 0) {
          if (oldVote === 1) {
            comments[index].upvote_count = Math.max(0, comments[index].upvote_count - 1);
            comments[index].downvote_count += 1;
          } else {
            comments[index].downvote_count += 1;
          }
        } else {
          if (oldVote === 1) comments[index].upvote_count = Math.max(0, comments[index].upvote_count - 1);
          if (oldVote === -1) comments[index].downvote_count = Math.max(0, comments[index].downvote_count - 1);
        }
        setStorageItem('ss_comments', comments);
        
        // Award upvote impact point
        if (voteType === 1) {
          this.updateUserScore(comments[index].author_id, IMPACT_WEIGHTS.upvote_received);
        } else if (oldVote === 1 && voteType !== 1) {
          this.updateUserScore(comments[index].author_id, -IMPACT_WEIGHTS.upvote_received);
        }
      }
    }

    return true;
  },

  // --- EVIDENCE ---
  async getEvidence(problemId) {
    if (!IS_MOCK) {
      const { data, error } = await supabase.from('evidence').select('*, author:profiles!evidence_submitted_by_fkey(*)').eq('problem_id', problemId);
      if (error) throw error;
      return data;
    }
    await delay();
    const evidence = getStorageItem('ss_evidence');
    const profiles = getStorageItem('ss_profiles');
    return evidence
      .filter(e => e.problem_id === problemId)
      .map(e => ({
        ...e,
        author: profiles.find(pr => pr.id === e.submitted_by)
      }));
  },

  async submitEvidence(evidenceData) {
    if (!IS_MOCK) {
      const { data, error } = await supabase.from('evidence').insert(evidenceData).select().single();
      if (error) throw error;
      return data;
    }
    await delay();
    const evidence = getStorageItem('ss_evidence');
    const newEvidence = {
      id: 'e_' + Math.random().toString(36).substr(2, 9),
      ...evidenceData,
      created_at: new Date().toISOString()
    };
    evidence.push(newEvidence);
    setStorageItem('ss_evidence', evidence);

    // Update status to evidence_submitted
    const problems = getStorageItem('ss_problems');
    const pIndex = problems.findIndex(p => p.id === evidenceData.problem_id);
    if (pIndex !== -1) {
      problems[pIndex].status = 'evidence_submitted';
      problems[pIndex].updated_at = new Date().toISOString();
      setStorageItem('ss_problems', problems);
    }

    this.addActivity(evidenceData.problem_id, evidenceData.submitted_by, 'evidence_submitted', { evidence_id: newEvidence.id });
    this.updateUserScore(evidenceData.submitted_by, IMPACT_WEIGHTS.evidence_submitted);

    return newEvidence;
  },

  // --- VERIFICATIONS ---
  async getVerifications(evidenceId) {
    if (!IS_MOCK) {
      const { data, error } = await supabase.from('verifications').select('*, verifier:profiles!verifications_verified_by_fkey(*)').eq('evidence_id', evidenceId);
      if (error) throw error;
      return data;
    }
    await delay();
    const verifications = getStorageItem('ss_verifications');
    const profiles = getStorageItem('ss_profiles');
    return verifications
      .filter(v => v.evidence_id === evidenceId)
      .map(v => ({
        ...v,
        verifier: profiles.find(pr => pr.id === v.verified_by)
      }));
  },

  async verifyEvidence(verificationData) {
    if (!IS_MOCK) {
      const { data, error } = await supabase.from('verifications').insert(verificationData).select().single();
      if (error) throw error;
      return data;
    }
    await delay();
    const verifications = getStorageItem('ss_verifications');
    const newVerification = {
      id: 'v_' + Math.random().toString(36).substr(2, 9),
      ...verificationData,
      created_at: new Date().toISOString()
    };
    verifications.push(newVerification);
    setStorageItem('ss_verifications', verifications);

    const evidence = getStorageItem('ss_evidence');
    const ev = evidence.find(e => e.id === verificationData.evidence_id);

    // Quorum checking
    const totalVerifications = verifications.filter(v => v.evidence_id === verificationData.evidence_id && v.status === 'confirmed').length;

    // Check if quorum met (3 verifications)
    if (totalVerifications >= 3 && ev) {
      const problems = getStorageItem('ss_problems');
      const pIndex = problems.findIndex(p => p.id === ev.problem_id);
      if (pIndex !== -1 && problems[pIndex].status !== 'verified_solved') {
        problems[pIndex].status = 'verified_solved';
        problems[pIndex].updated_at = new Date().toISOString();
        setStorageItem('ss_problems', problems);

        this.addActivity(ev.problem_id, verificationData.verified_by, 'status_changed', { oldStatus: 'evidence_submitted', newStatus: 'verified_solved' });
        
        // Award high score points to the solver (author of accepted solution)
        const comments = getStorageItem('ss_comments');
        const acceptedComment = comments.find(c => c.id === problems[pIndex].accepted_solution_id);
        if (acceptedComment) {
          this.updateUserScore(acceptedComment.author_id, IMPACT_WEIGHTS.verified_solution);
        }
      }
    } else if (ev) {
      // Just flag under verification
      const problems = getStorageItem('ss_problems');
      const pIndex = problems.findIndex(p => p.id === ev.problem_id);
      if (pIndex !== -1 && problems[pIndex].status === 'evidence_submitted') {
        problems[pIndex].status = 'verification';
        problems[pIndex].updated_at = new Date().toISOString();
        setStorageItem('ss_problems', problems);
      }
    }

    this.addActivity(ev.problem_id, verificationData.verified_by, 'verification_confirmed', { verification_id: newVerification.id });
    this.updateUserScore(verificationData.verified_by, IMPACT_WEIGHTS.verification_performed);

    return newVerification;
  },

  // --- TRANS TRANSPARENCY LEDGER (ACTIVITY LOG) ---
  async getActivities(problemId) {
    if (!IS_MOCK) {
      const { data, error } = await supabase.from('activity_log').select('*, actor:profiles!activity_log_actor_id_fkey(*)').eq('problem_id', problemId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    await delay();
    const activities = getStorageItem('ss_activities');
    const profiles = getStorageItem('ss_profiles');
    return activities
      .filter(a => a.problem_id === problemId)
      .map(a => ({
        ...a,
        actor: profiles.find(pr => pr.id === a.actor_id)
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  addActivity(problemId, actorId, action, metadata = {}) {
    const activities = getStorageItem('ss_activities') || [];
    activities.unshift({
      id: 'act_' + Math.random().toString(36).substr(2, 9),
      problem_id: problemId,
      actor_id: actorId,
      action,
      metadata,
      created_at: new Date().toISOString()
    });
    setStorageItem('ss_activities', activities);
  },

  // --- SCORE UPDATING ---
  updateUserScore(userId, points) {
    const profiles = getStorageItem('ss_profiles');
    const index = profiles.findIndex(p => p.id === userId);
    if (index !== -1) {
      profiles[index].impact_score = Math.max(0, (profiles[index].impact_score || 0) + points);
      setStorageItem('ss_profiles', profiles);
    }
  },

  // --- ANALYTICS ---
  async getAnalyticsSummary() {
    if (!IS_MOCK) {
      const { data: problems, error } = await supabase
        .from('problems')
        .select('status, category, district');
      
      if (error) {
        console.error('Error fetching analytics summary:', error);
        return {
          total: 0,
          open: 0,
          inDiscussion: 0,
          proposed: 0,
          solved: 0,
          byCategory: {},
          byDistrict: {},
          resolutionRate: 0
        };
      }

      const total = problems?.length || 0;
      const open = problems?.filter(p => p.status === 'open').length || 0;
      const inDiscussion = problems?.filter(p => p.status === 'in_discussion').length || 0;
      const proposed = problems?.filter(p => p.status === 'solution_proposed').length || 0;
      const solved = problems?.filter(p => p.status === 'verified_solved').length || 0;
      
      // Group by category
      const byCategory = {};
      problems?.forEach(p => {
        if (p.category) {
          byCategory[p.category] = (byCategory[p.category] || 0) + 1;
        }
      });

      // Group by district
      const byDistrict = {};
      problems?.forEach(p => {
        if (p.district) {
          byDistrict[p.district] = (byDistrict[p.district] || 0) + 1;
        }
      });

      return {
        total,
        open,
        inDiscussion,
        proposed,
        solved,
        byCategory,
        byDistrict,
        resolutionRate: total > 0 ? Math.round((solved / total) * 100) : 0
      };
    }

    await delay();
    const problems = getStorageItem('ss_problems') || [];

    const total = problems.length;
    const open = problems.filter(p => p.status === 'open').length;
    const inDiscussion = problems.filter(p => p.status === 'in_discussion').length;
    const proposed = problems.filter(p => p.status === 'solution_proposed').length;
    const solved = problems.filter(p => p.status === 'verified_solved').length;
    
    // Group by category
    const byCategory = {};
    problems.forEach(p => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    });

    // Group by district
    const byDistrict = {};
    problems.forEach(p => {
      byDistrict[p.district] = (byDistrict[p.district] || 0) + 1;
    });

    return {
      total,
      open,
      inDiscussion,
      proposed,
      solved,
      byCategory,
      byDistrict,
      resolutionRate: total > 0 ? Math.round((solved / total) * 100) : 0
    };
  },

  // --- RELATED PROBLEMS ---
  async getRelatedProblems(problemId, category, district) {
    if (!IS_MOCK) {
      const { data, error } = await supabase
        .from('problems')
        .select('*, author:profiles!problems_author_id_fkey(id, name, avatar_url, role)')
        .neq('id', problemId)
        .or(`category.eq.${category},district.eq.${district}`)
        .order('upvote_count', { ascending: false })
        .limit(4);
      if (error) throw error;
      return data || [];
    }
    await delay();
    const problems = getStorageItem('ss_problems');
    const profiles = getStorageItem('ss_profiles');
    return problems
      .filter(p => p.id !== problemId && (p.category === category || p.district === district))
      .sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0))
      .slice(0, 4)
      .map(p => ({
        ...p,
        author: profiles.find(pr => pr.id === p.author_id)
      }));
  }
};
