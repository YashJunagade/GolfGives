import axios from 'axios';
import supabase from '../lib/supabaseClient.js';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err)
);

export default api;
