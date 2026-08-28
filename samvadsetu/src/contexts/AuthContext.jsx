import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { IS_MOCK } from '../lib/config';
import { dbService } from '../services/db';
import {
  initMockAuth,
  getMockSession,
  mockSignIn,
  mockSignUp,
  mockSignOut,
} from '../services/mockAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_MOCK) {
      initMockAuth();
      const session = getMockSession();
      if (session) {
        setUser({ id: session.id, email: session.email });
        loadMockProfile(session.id);
      } else {
        setLoading(false);
      }
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadMockProfile(userId) {
    try {
      const data = await dbService.getProfile(userId);
      setProfile(data || null);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      setProfile(data || null);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function signUp({ email, password, name, role, institution }) {
    if (IS_MOCK) {
      const data = mockSignUp({ email, password, name, role, institution });
      setUser(data.user);
      await loadMockProfile(data.user.id);
      return data;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, institution },
      },
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name,
          role,
          institution: institution || null,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      } else {
        await fetchProfile(data.user.id);
      }
    }

    return data;
  }

  async function signIn({ email, password }) {
    if (IS_MOCK) {
      const data = mockSignIn({ email, password });
      setUser(data.user);
      await loadMockProfile(data.user.id);
      return data;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (IS_MOCK) {
      mockSignOut();
      setUser(null);
      setProfile(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  }

  async function updateProfile(updates) {
    if (!user) throw new Error('Not authenticated');

    if (IS_MOCK) {
      const data = await dbService.updateProfile(user.id, updates);
      setProfile(data);
      return data;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile: () => (IS_MOCK ? user && loadMockProfile(user.id) : user && fetchProfile(user.id)),
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isMockMode: IS_MOCK,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
