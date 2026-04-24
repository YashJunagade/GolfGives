import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../../lib/supabaseClient.js';
import api from '../../services/api.js';
import useAuthStore from '../../store/authStore.js';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import styles from './LoginForm.module.scss';

export default function LoginForm() {
  const navigate = useNavigate();
  const { setProfile } = useAuthStore();
  const [mode, setMode]     = useState('member'); // 'member' | 'admin'
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword(form);
    if (authError) {
      setLoading(false);
      return setError(authError.message);
    }

    // Fetch profile to check role
    try {
      const profile = await api.get('/auth/profile');
      setProfile(profile);

      if (mode === 'admin') {
        if (profile.role !== 'admin') {
          await supabase.auth.signOut();
          setProfile(null);
          setLoading(false);
          return setError('This account does not have admin access.');
        }
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setLoading(false);
      setError('Failed to load profile. Please try again.');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={styles.form}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      {/* Role toggle */}
      <div className={styles.toggle}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${mode === 'member' ? styles.toggleActive : ''}`}
          onClick={() => { setMode('member'); setError(''); }}
        >
          Member
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${mode === 'admin' ? styles.toggleActiveAdmin : ''}`}
          onClick={() => { setMode('admin'); setError(''); }}
        >
          Admin
        </button>
      </div>

      <Input label="Email address" name="email" type="email" required autoComplete="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
      <Input label="Password" name="password" type="password" required autoComplete="current-password" value={form.password} onChange={handleChange} placeholder="••••••••" />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.errorBox}
        >
          <span className={styles.errorIcon}>⚠</span>
          <p className={styles.errorText}>{error}</p>
        </motion.div>
      )}

      <Button type="submit" loading={loading} className={styles.submitButton}>
        {mode === 'admin' ? 'Sign In as Admin' : 'Sign In'}
      </Button>

      {mode === 'member' && (
        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/signup" className={styles.link}>
            Create one free
          </Link>
        </p>
      )}
    </motion.form>
  );
}
