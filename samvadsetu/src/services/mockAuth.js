const SESSION_KEY = 'ss_auth_session';
const USERS_KEY = 'ss_auth_users';

export const DEMO_ACCOUNTS = [
  { id: 'u4', email: 'admin@samvadsetu.in', password: 'demo123' },
  { id: 'u1', email: 'citizen@samvadsetu.in', password: 'demo123' },
  { id: 'u3', email: 'student@samvadsetu.in', password: 'demo123' },
  { id: 'u2', email: 'industry@samvadsetu.in', password: 'demo123' },
];

export function initMockAuth() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_ACCOUNTS));
  }
}

export function getMockSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function mockSignIn({ email, password }) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const account = users.find((u) => u.email === email && u.password === password);
  if (!account) {
    throw new Error('Invalid login credentials');
  }
  const session = { id: account.id, email: account.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { user: session };
}

export function mockSignUp({ email, password, name, role, institution }) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  if (users.some((u) => u.email === email)) {
    throw new Error('User already registered');
  }
  const id = `u_${Math.random().toString(36).substr(2, 9)}`;
  users.push({ id, email, password, name, role, institution });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const profiles = JSON.parse(localStorage.getItem('ss_profiles') || '[]');
  profiles.push({
    id,
    name,
    role,
    institution: institution || null,
    avatar_url: null,
    bio: null,
    district: null,
    impact_score: 0,
    resources_offered: [],
  });
  localStorage.setItem('ss_profiles', JSON.stringify(profiles));

  const session = { id, email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { user: session };
}

export function mockSignOut() {
  localStorage.removeItem(SESSION_KEY);
}
