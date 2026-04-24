import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../../lib/supabaseClient.js';
import { getCharities, selectCharity } from '../../services/charityService.js';
import api from '../../services/api.js';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import styles from './SignupForm.module.scss';

const ease = [0.22, 1, 0.36, 1];
const COLORS = ['#f87171', '#fb7185', '#fb923c', '#a78bfa', '#10d97a', '#38bdf8'];

export default function SignupForm() {
  const navigate = useNavigate();
  const [mode,       setMode]       = useState('member'); // 'member' | 'admin'
  const [step,       setStep]       = useState(1);
  const [form,       setForm]       = useState({ full_name: '', email: '', password: '', adminCode: '' });
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [charities,  setCharities]  = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (step === 2) getCharities().then(setCharities).catch(() => {});
  }, [step]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate admin code before creating any account
    if (mode === 'admin') {
      try {
        await api.post('/auth/check-admin-code', { adminCode: form.adminCode });
      } catch (err) {
        setLoading(false);
        return setError(err.error || 'Invalid admin invite code.');
      }
    }

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    });

    if (authError) {
      setLoading(false);
      return setError(authError.message);
    }

    if (mode === 'admin') {
      try {
        await api.post('/auth/register-admin', { adminCode: form.adminCode });
      } catch (err) {
        await supabase.auth.signOut();
        setLoading(false);
        return setError(err.error || 'Failed to assign admin role.');
      }
      setLoading(false);
      navigate('/admin');
      return;
    }

    api.post('/auth/welcome').catch(() => {});
    setLoading(false);
    setStep(2);
  };

  const handleCharitySelect = async (id) => {
    setSelected(id);
    setSaving(true);
    try {
      await selectCharity(id, 10);
    } catch {
      // non-blocking
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => navigate('/dashboard');

  return (
    <AnimatePresence mode="wait">
      {step === 1 ? (
        <motion.form
          key="step1"
          onSubmit={handleSignup}
          className={styles.form}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease }}
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

          <Input label="Full name" name="full_name" type="text" required autoComplete="name" value={form.full_name} onChange={handleChange} placeholder="John Smith" />
          <Input label="Email address" name="email" type="email" required autoComplete="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
          <Input label="Password" name="password" type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />

          {mode === 'admin' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                label="Admin Invite Code"
                name="adminCode"
                type="password"
                required
                value={form.adminCode}
                onChange={handleChange}
                placeholder="GolfAdmin@2026"
              />
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠</span>
              <p className={styles.errorText}>{error}</p>
            </motion.div>
          )}

          <Button type="submit" loading={loading} className={styles.submitButton}>
            {mode === 'admin' ? 'Create Admin Account' : 'Create Account'}
          </Button>

          <p className={styles.footer}>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>Sign in</Link>
          </p>
        </motion.form>
      ) : (
        <motion.div
          key="step2"
          className={styles.charityStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease }}
        >
          <div className={styles.stepHeader}>
            <p className={styles.stepBadge}>Step 2 of 2</p>
            <h2 className={styles.stepTitle}>Choose your charity</h2>
            <p className={styles.stepDesc}>
              10% of your subscription goes directly to your chosen charity every month. You can change this anytime.
            </p>
          </div>

          <div className={styles.charityGrid}>
            {charities.map((c, i) => {
              const color = COLORS[i % COLORS.length];
              const isSelected = selected === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCharitySelect(c.id)}
                  disabled={saving}
                  className={`${styles.charityCard} ${isSelected ? styles.charityCardActive : ''}`}
                  style={isSelected ? { '--c': color, borderColor: color, background: `${color}14` } : { '--c': color }}
                >
                  <span className={styles.charityDot} style={{ background: color }} />
                  <span className={styles.charityCardName}>{c.name}</span>
                  {isSelected && <span className={styles.charityCheck}>✓</span>}
                </button>
              );
            })}
          </div>

          <Button type="button" onClick={handleContinue} className={styles.submitButton}>
            {selected ? 'Continue to Dashboard →' : 'Skip for now →'}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
