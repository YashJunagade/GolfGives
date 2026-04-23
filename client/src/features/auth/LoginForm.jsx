import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../../lib/supabaseClient.js';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import styles from './LoginForm.module.scss';

export default function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(form);
    setLoading(false);
    if (error) return setError(error.message);
    navigate('/dashboard');
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={styles.form}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
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
        Sign In
      </Button>

      <p className={styles.footer}>
        Don't have an account?{' '}
        <Link to="/signup" className={styles.link}>
          Create one free
        </Link>
      </p>
    </motion.form>
  );
}
