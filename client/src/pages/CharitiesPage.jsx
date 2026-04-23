import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import { getCharities, selectCharity, deselectCharity } from '../services/charityService.js';
import { updateProfile } from '../services/profileService.js';
import useAuthStore from '../store/authStore.js';
import api from '../services/api.js';
import styles from './CharitiesPage.module.scss';

const ease = [0.22, 1, 0.36, 1];

const charityColors = ['#f87171', '#fb7185', '#fb923c', '#a78bfa', '#10d97a', '#38bdf8'];

export default function CharitiesPage() {
  const { profile, setProfile } = useAuthStore();
  const [charities,   setCharities]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selecting,   setSelecting]   = useState(null);
  const [percent,     setPercent]     = useState(profile?.charity_percent ?? 10);
  const [pctSaving,   setPctSaving]   = useState(false);
  const [pctSaved,    setPctSaved]    = useState(false);
  const [success,     setSuccess]     = useState('');
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('all'); // 'all' | 'featured'

  // Keep slider in sync if profile changes externally (e.g. save from ProfilePage)
  useEffect(() => {
    setPercent(profile?.charity_percent ?? 10);
  }, [profile?.charity_percent]);

  const savePct = async () => {
    setPctSaving(true);
    try {
      const updated = await updateProfile({ charity_percent: percent });
      setProfile({ ...profile, ...updated });
      setPctSaved(true);
      setTimeout(() => setPctSaved(false), 2500);
    } finally {
      setPctSaving(false);
    }
  };

  useEffect(() => {
    getCharities().then(setCharities).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (charityId) => {
    const isCurrentlySelected = profile?.charity_id === charityId;
    setSelecting(charityId);
    setSuccess('');
    try {
      if (isCurrentlySelected) {
        await deselectCharity();
      } else {
        await selectCharity(charityId, percent);
      }
      const updated = await api.get('/auth/profile');
      setProfile(updated);
      setSuccess(isCurrentlySelected ? 'Charity removed.' : 'Charity updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setSelecting(null);
    }
  };

  const filtered = charities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || c.featured;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <AppLayout>
      <div className={styles.spinnerWrap}><div className={styles.spinner} /></div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className={styles.page}>

        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <h1 className={styles.title}>Charities</h1>
          <p className={styles.subtitle}>
            {profile?.charity_percent ?? 10}% of your subscription goes directly to your chosen charity every month.
          </p>
        </motion.div>

        {/* Contribution slider */}
        <motion.div
          className={styles.sliderCard}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease }}
        >
          <div className={styles.sliderHead}>
            <div>
              <p className={styles.sliderLabel}>My monthly contribution</p>
              <p className={styles.sliderDesc}>Choose how much you want to give</p>
            </div>
            <p className={styles.sliderValue}>{percent}%</p>
          </div>
          <input
            type="range" min={10} max={100} step={5}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.sliderFooter}>
            <div className={styles.sliderRange}>
              <span className={styles.sliderMin}>Min 10%</span>
              <span className={styles.sliderMax}>Max 100%</span>
            </div>
            <button
              className={styles.savePctBtn}
              onClick={savePct}
              disabled={pctSaving || percent === (profile?.charity_percent ?? 10)}
            >
              {pctSaving ? 'Saving…' : pctSaved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </motion.div>

        {/* Search + filter */}
        <motion.div
          className={styles.searchRow}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4, ease }}
        >
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInput}
              placeholder="Search charities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filterBtns}>
            <button
              className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter('all')}
            >All</button>
            <button
              className={`${styles.filterBtn} ${filter === 'featured' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter('featured')}
            >★ Featured</button>
          </div>
        </motion.div>

        {success && (
          <motion.div className={styles.success} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <span className={styles.successIcon}>✓</span>
            <p className={styles.successText}>{success}</p>
          </motion.div>
        )}

        {filtered.length === 0 && search ? (
          <p className={styles.emptySearch}>No charities match "{search}"</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((c, i) => {
              const isSelected = profile?.charity_id === c.id;
              const color = charityColors[i % charityColors.length];
              return (
                <motion.div
                  key={c.id}
                  className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
                  style={isSelected ? {
                    '--card-bg': `${color}0d`,
                    '--card-border': `${color}55`,
                    '--card-shadow': `0 0 40px ${color}08, 0 8px 32px rgba(0,0,0,0.2)`,
                  } : {}}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease }}
                >
                  <div className={styles.cardTop}>
                    <div
                      className={styles.icon}
                      style={{ '--icon-bg': `${color}18`, '--icon-border': `${color}35`, '--icon-color': color }}
                    >
                      ♡
                    </div>
                    <div className={styles.cardMeta}>
                      <div className={styles.nameRow}>
                        <h3 className={styles.name}>{c.name}</h3>
                        {c.featured && <span className={styles.featured}>FEATURED</span>}
                      </div>
                      <p className={styles.desc}>{c.description || 'Supporting important causes in our community.'}</p>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button
                      onClick={() => handleToggle(c.id)}
                      disabled={!!selecting}
                      className={styles.selectBtn}
                      style={{
                        '--btn-bg': isSelected ? `linear-gradient(135deg, ${color}dd, ${color}aa)` : `${color}12`,
                        '--btn-border': isSelected ? 'none' : `1px solid ${color}40`,
                        '--btn-color': isSelected ? '#07070f' : color,
                        '--btn-shadow': isSelected ? `0 4px 18px ${color}40` : 'none',
                        opacity: selecting && selecting !== c.id ? 0.45 : 1,
                      }}
                    >
                      {selecting === c.id ? (
                        <span className={styles.selectBtnSpinner}>
                          <span className={styles.btnSpinner} />
                          Saving...
                        </span>
                      ) : isSelected ? '✓ Selected' : 'Select'}
                    </button>
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noreferrer" className={styles.visitBtn}>
                        Visit ↗
                      </a>
                    )}
                    <Link to={`/charities/${c.id}`} className={styles.visitBtn}>
                      Details →
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
