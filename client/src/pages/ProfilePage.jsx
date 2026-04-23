import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import useAuthStore from '../store/authStore.js';
import { updateProfile } from '../services/profileService.js';
import { getCharities } from '../services/charityService.js';
import styles from './ProfilePage.module.scss';

const ease = [0.22, 1, 0.36, 1];

export default function ProfilePage() {
  const { user, profile, setProfile } = useAuthStore();

  // Name form — pre-populate from store immediately, no loading needed
  const [name,        setName]      = useState(profile?.full_name || '');
  const [nameLoading, setNameLoad]  = useState(false);
  const [nameError,   setNameErr]   = useState('');
  const [nameSaved,   setNameSaved] = useState(false);

  // Charity % form
  const [pct,         setPct]       = useState(profile?.charity_percent ?? 10);
  const [pctLoading,  setPctLoad]   = useState(false);
  const [pctError,    setPctErr]    = useState('');
  const [pctSaved,    setPctSaved]  = useState(false);

  // Charity name — fetch the full charity list to resolve the name
  const [charityName, setCharityName] = useState(null);

  useEffect(() => {
    if (profile?.charity_id) {
      getCharities().then((list) => {
        const found = list.find((c) => c.id === profile.charity_id);
        setCharityName(found?.name ?? null);
      });
    } else {
      setCharityName(null);
    }
  }, [profile?.charity_id]);

  // Keep form in sync if authStore profile changes (e.g. after charity selection)
  useEffect(() => {
    setName(profile?.full_name || '');
    setPct(profile?.charity_percent ?? 10);
  }, [profile]);

  const saveName = async () => {
    setNameErr(''); setNameSaved(false);
    setNameLoad(true);
    try {
      const updated = await updateProfile({ full_name: name });
      setProfile({ ...profile, ...updated });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch (err) {
      setNameErr(err.error || 'Failed to update name.');
    } finally {
      setNameLoad(false);
    }
  };

  const savePct = async () => {
    setPctErr(''); setPctSaved(false);
    setPctLoad(true);
    try {
      const updated = await updateProfile({ charity_percent: pct });
      setProfile({ ...profile, ...updated });
      setPctSaved(true);
      setTimeout(() => setPctSaved(false), 2500);
    } catch (err) {
      setPctErr(err.error || 'Failed to update charity contribution.');
    } finally {
      setPctLoad(false);
    }
  };

  return (
    <AppLayout>
      <div className={styles.page}>

        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <h1 className={styles.title}>Profile & Settings</h1>
          <p className={styles.subtitle}>Manage your account details and preferences</p>
        </motion.div>

        {/* Account info — email from Supabase auth (always reliable) */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.5, ease }}
        >
          <p className={styles.cardLabel}>Account</p>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Email</span>
            <span className={styles.infoVal}>{user?.email ?? '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoKey}>Role</span>
            <span className={styles.infoVal}>{profile?.role ?? 'member'}</span>
          </div>
        </motion.div>

        {/* Display name */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease }}
        >
          <p className={styles.cardLabel}>Display Name</p>
          <div className={styles.fieldRow}>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              placeholder="Your full name"
              maxLength={80}
            />
            <button
              className={styles.saveBtn}
              onClick={saveName}
              disabled={nameLoading || !name.trim()}
            >
              {nameLoading ? 'Saving…' : nameSaved ? '✓ Saved' : 'Save'}
            </button>
          </div>
          {nameError && <p className={styles.errorMsg}>{nameError}</p>}
        </motion.div>

        {/* Charity contribution */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.5, ease }}
        >
          <p className={styles.cardLabel}>Charity Contribution</p>
          {charityName ? (
            <p className={styles.charityName}>♡ {charityName}</p>
          ) : (
            <p className={styles.charityMissing}>
              No charity selected.{' '}
              <Link to="/charities" className={styles.charityLink}>Choose one →</Link>
            </p>
          )}
          <p className={styles.pctDesc}>
            Minimum 10% of your subscription goes to your charity each month. Increase it here.
          </p>
          <div className={styles.pctRow}>
            <div className={styles.pctSliderWrap}>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.pctLabels}>
                <span>10%</span>
                <span className={styles.pctCurrent}>{pct}%</span>
                <span>100%</span>
              </div>
            </div>
            <button
              className={styles.saveBtn}
              onClick={savePct}
              disabled={pctLoading}
            >
              {pctLoading ? 'Saving…' : pctSaved ? '✓ Saved' : 'Save'}
            </button>
          </div>
          {pctError && <p className={styles.errorMsg}>{pctError}</p>}
        </motion.div>

        {/* Subscription */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5, ease }}
        >
          <p className={styles.cardLabel}>Subscription</p>
          <p className={styles.dangerDesc}>Manage your billing and subscription plan.</p>
          <Link to="/subscription/manage" className={styles.manageLink}>
            Manage subscription →
          </Link>
        </motion.div>

      </div>
    </AppLayout>
  );
}
