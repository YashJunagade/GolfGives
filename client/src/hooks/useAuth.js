import { useEffect } from 'react';
import supabase from '../lib/supabaseClient.js';
import useAuthStore from '../store/authStore.js';
import api from '../services/api.js';

export function useAuthInit() {
  const { setUser, setProfile, setLoading, clear } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await api.get('/auth/profile');
        setProfile(profile);
      } catch {
        // profile fetch fails silently — user may not have profile yet
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile();
      } else {
        clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}

export default useAuthStore;
