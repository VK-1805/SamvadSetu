import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env file
const envPath = path.resolve(__dirname, '../.env');
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('VITE_SUPABASE_URL=')[1].trim();
    }
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = trimmed.split('VITE_SUPABASE_ANON_KEY=')[1].trim();
    }
  }
} catch (e) {
  console.error('Failed to read .env file:', e.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase environment variables not found in .env file.');
  process.exit(1);
}

console.log(`Connecting to Supabase at: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SEED_USERS = [
  { email: 'citizen1@samvadsetu.in', password: 'demo123', name: 'Ravi Kisku', role: 'citizen', district: 'West Singhbhum' },
  { email: 'industry1@samvadsetu.in', password: 'demo123', name: 'Dr. Ananya Sen', role: 'industry', district: 'Ranchi', institution: 'Jharkhand Health Society' },
  { email: 'student@samvadsetu.in', password: 'demo123', name: 'Siddharth Mahto', role: 'student', district: 'Dhanbad', institution: 'IIT (ISM) Dhanbad' },
  { email: 'admin@samvadsetu.in', password: 'demo123', name: 'Amit Kumar', role: 'admin', district: 'Ranchi', institution: 'Urban Development Dept' },
  { email: 'citizen2@samvadsetu.in', password: 'demo123', name: 'Priya Soren', role: 'citizen', district: 'Dumka' },
  { email: 'industry2@samvadsetu.in', password: 'demo123', name: 'Vikram Aditya', role: 'industry', district: 'Bokaro', institution: 'Steel Authority of India' },
];

const SEED_PROBLEMS = [
  {
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
    is_featured: true,
  },
  {
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
  },
  {
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
  },
  {
    title: 'Lack of digital literacy centres in rural Gumla blocks',
    description: 'Students and farmers in Gumla blocks cannot access online government schemes, banking, or telemedicine due to zero digital literacy infrastructure. A mobile training van model could reach 20 villages.',
    category: 'digital',
    status: 'evidence_submitted',
    district: 'Gumla',
    block: 'Basia',
    location_name: 'Basia Block HQ',
    latitude: 22.8945,
    longitude: 84.7832,
    image_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop',
    sdg_tags: [4, 9, 10],
    resources_needed: ['equipment', 'volunteers', 'technical'],
    is_featured: true,
  }
];

async function seed() {
  try {
    console.log('Starting Supabase Seeding...');

    // 1. Create users and store their auth IDs mapped to their seed names
    const usersMap = {};
    for (const u of SEED_USERS) {
      console.log(`Registering/Signing in user: ${u.email}`);
      
      // Attempt login first (in case already seeded/created)
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: u.email,
        password: u.password,
      });

      let userId;
      if (!signInError && signInData?.user) {
        userId = signInData.user.id;
        console.log(`User ${u.name} already exists. Auth ID: ${userId}`);
      } else {
        // Sign up if user doesn't exist
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: u.email,
          password: u.password,
          options: {
            data: {
              name: u.name,
              role: u.role,
              institution: u.institution || null,
            }
          }
        });

        if (signUpError) {
          console.warn(`Sign up warning for ${u.email}: ${signUpError.message}`);
          continue;
        }
        
        userId = signUpData.user.id;
        console.log(`Registered user ${u.name}. Auth ID: ${userId}`);
      }

      // Add profile info to usersMap
      usersMap[u.name] = userId;

      // Update their profile table manually to set district/institution details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: u.name,
          role: u.role,
          district: u.district,
          institution: u.institution || null,
        })
        .eq('id', userId);

      if (profileError) {
        console.error(`Error updating profile for ${u.name}:`, profileError);
      }
    }

    console.log('Seeded Users Map:', usersMap);

    // Clean existing tables (carefully)
    console.log('Clearing old problems (cascades comments/votes/evidence/verifications)...');
    const { error: deleteError } = await supabase.from('problems').delete().neq('title', '');
    if (deleteError) {
      console.warn('Could not clear problems:', deleteError.message);
    }

    // 2. Insert Problems
    const problemsInserted = [];
    for (const p of SEED_PROBLEMS) {
      // Find author ID
      let authorName = 'Ravi Kisku'; // Default
      if (p.category === 'mining') authorName = 'Siddharth Mahto';
      if (p.category === 'digital') authorName = 'Dr. Ananya Sen';

      const authorId = usersMap[authorName];
      if (!authorId) {
        console.error(`Author ID not found for ${authorName}`);
        continue;
      }

      const { data: probData, error: probError } = await supabase
        .from('problems')
        .insert({
          ...p,
          author_id: authorId,
        })
        .select()
        .single();

      if (probError) {
        console.error(`Error inserting problem: "${p.title}":`, probError);
        continue;
      }

      console.log(`Inserted problem: "${probData.title}" (ID: ${probData.id})`);
      problemsInserted.push(probData);
    }

    // 3. Insert comments / proposed solutions
    console.log('Inserting comments & proposed solutions...');
    const probWater = problemsInserted.find(p => p.category === 'water');
    const probMining = problemsInserted.find(p => p.category === 'mining');
    const probDigital = problemsInserted.find(p => p.category === 'digital');

    if (probWater && usersMap['Dr. Ananya Sen']) {
      const { data: c1, error: c1Err } = await supabase.from('comments').insert({
        problem_id: probWater.id,
        author_id: usersMap['Dr. Ananya Sen'],
        content: 'We can deploy low-cost biosand filters. My research lab has a design that uses local sand, gravel, and charcoal. Cost is under ₹800 per unit.',
        is_solution: true,
        resources_offered: ['technical', 'research'],
        skills_offered: ['Water Testing', 'Biosand filter design'],
        estimated_effort: '2 weeks',
        implementation_notes: 'Requires building local awareness.',
      }).select().single();

      if (!c1Err) console.log('Inserted water solution c1');
    }

    if (probMining && usersMap['Siddharth Mahto'] && usersMap['Vikram Aditya']) {
      const { data: c2, error: c2Err } = await supabase.from('comments').insert({
        problem_id: probMining.id,
        author_id: usersMap['Siddharth Mahto'],
        content: 'IIT ISM students can design windbreak dust barriers using recycled materials and set up regular mist-sprinklers around schools in coal zones.',
        is_solution: true,
        resources_offered: ['volunteers', 'technical'],
        skills_offered: ['Civil Engineering', 'Aerosol studies'],
        estimated_effort: '1 month',
        implementation_notes: 'Requires coordination with local mine management and school authorities.',
      }).select().single();

      if (!c2Err && c2) {
        console.log('Inserted mining solution c2');
        // Accept the solution
        await supabase.rpc('accept_solution', { p_id: probMining.id, c_id: c2.id });
        console.log('Accepted mining solution');
      }

      await supabase.from('comments').insert({
        problem_id: probMining.id,
        author_id: usersMap['Vikram Aditya'],
        content: 'Our factory in Bokaro can donate structural frames/scaffolding to set up dust screens. Let me know the dimensions.',
        is_solution: false,
      });
      console.log('Inserted mining comment from industry partner');
    }

    if (probDigital && usersMap['Siddharth Mahto']) {
      const { data: c7, error: c7Err } = await supabase.from('comments').insert({
        problem_id: probDigital.id,
        author_id: usersMap['Siddharth Mahto'],
        content: 'Convert a retired bus into a mobile digital literacy lab with solar panels, laptops, and trained student volunteers visiting 20 villages per month.',
        is_solution: true,
        resources_offered: ['volunteers', 'equipment', 'technical'],
        skills_offered: ['Digital literacy', 'Hardware setup'],
        estimated_effort: '2 months',
        implementation_notes: 'Bus retrofitted; 8 villages covered so far.',
      }).select().single();

      if (!c7Err && c7) {
        console.log('Inserted digital solution c7');
        // Accept the solution
        await supabase.rpc('accept_solution', { p_id: probDigital.id, c_id: c7.id });
        console.log('Accepted digital solution');

        // Submit evidence
        const { data: ev, error: evErr } = await supabase.from('evidence').insert({
          problem_id: probDigital.id,
          solution_id: c7.id,
          submitted_by: usersMap['Siddharth Mahto'],
          file_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop',
          file_type: 'image',
          description: 'Mobile digital literacy bus operational — 240 farmers and students trained across 8 Gumla villages in first month.',
        }).select().single();

        if (!evErr && ev) {
          console.log('Submitted digital evidence');
          
          // Add verifications
          if (usersMap['Ravi Kisku']) {
            await supabase.from('verifications').insert({
              problem_id: probDigital.id,
              evidence_id: ev.id,
              verified_by: usersMap['Ravi Kisku'],
              status: 'confirmed',
              notes: 'Attended training session in Basia — farmers successfully registered for PM-KISAN online.',
            });
          }
          if (usersMap['Dr. Ananya Sen']) {
            await supabase.from('verifications').insert({
              problem_id: probDigital.id,
              evidence_id: ev.id,
              verified_by: usersMap['Dr. Ananya Sen'],
              status: 'confirmed',
              notes: 'Confirmed 8 villages covered with documented attendance sheets.',
            });
          }
          console.log('Seeded confirmations for digital solution');
        } else {
          console.error('Evidence insert error:', evErr);
        }
      }
    }

    console.log('Supabase database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

seed();
