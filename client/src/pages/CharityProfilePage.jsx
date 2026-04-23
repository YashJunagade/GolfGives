import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout.jsx';
import { getCharity, selectCharity, deselectCharity } from '../services/charityService.js';
import useAuthStore from '../store/authStore.js';
import api from '../services/api.js';
import styles from './CharityProfilePage.module.scss';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const ease = [0.22, 1, 0.36, 1];

export default function CharityProfilePage() {
  const { id } = useParams();
  const { profile, setProfile } = useAuthStore();

  const [charity,   setCharity]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [success,   setSuccess]   = useState('');

  // Events state
  const [events, setEvents] = useState([]);

  // Donation state
  const [donating,    setDonating]    = useState(false);
  const [donateAmt,   setDonateAmt]   = useState(10);
  const [donateLoad,  setDonateLoad]  = useState(false);
  const [donateError, setDonateError] = useState('');

  useEffect(() => {
    getCharity(id)
      .then(setCharity)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    api.get(`/charities/${id}/events`).then(setEvents).catch(() => {});
  }, [id]);

  const isSelected = profile?.charity_id === id;

  const handleToggle = async () => {
    setSelecting(true);
    setSuccess('');
    try {
      if (isSelected) {
        await deselectCharity();
      } else {
        await selectCharity(id, profile?.charity_percent ?? 10);
      }
      const updated = await api.get('/auth/profile');
      setProfile(updated);
      setSuccess(isSelected ? 'Charity removed.' : 'Now supporting this charity!');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setSelecting(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setDonateError('');
    if (!donateAmt || donateAmt < 1) return setDonateError('Minimum donation is £1.');
    setDonateLoad(true);
    try {
      const { url } = await api.post('/donation/checkout', { charity_id: id, amount: donateAmt });
      window.location.href = url;
    } catch (err) {
      setDonateError(err.error || 'Failed to start donation. Please try again.');
      setDonateLoad(false);
    }
  };

  if (loading) return (
    <AppLayout>
      <div className={styles.spinnerWrap}><div className={styles.spinner} /></div>
    </AppLayout>
  );

  if (notFound) return (
    <AppLayout>
      <div className={styles.notFound}>
        <p className={styles.notFoundText}>Charity not found.</p>
        <Link to="/charities" className={styles.backLink}>← Back to charities</Link>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className={styles.page}>

        <Link to="/charities" className={styles.back}>← All charities</Link>

        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <div className={styles.heroInner}>
            {charity.image_url
              ? <img src={charity.image_url} alt={charity.name} className={styles.heroImg} />
              : <div className={styles.heroIcon}>♡</div>
            }
            <div>
              <div className={styles.heroMeta}>
                {charity.featured && <span className={styles.featuredBadge}>FEATURED</span>}
              </div>
              <h1 className={styles.heroTitle}>{charity.name}</h1>
              {charity.website && (
                <a href={charity.website} target="_blank" rel="noreferrer" className={styles.websiteLink}>
                  {charity.website.replace(/^https?:\/\//, '')} ↗
                </a>
              )}
            </div>
          </div>

          {charity.description && (
            <p className={styles.heroDesc}>{charity.description}</p>
          )}

          {success && (
            <motion.p className={styles.successMsg} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              ✓ {success}
            </motion.p>
          )}

          <button
            onClick={handleToggle}
            disabled={selecting}
            className={`${styles.selectBtn} ${isSelected ? styles.selectBtnActive : ''}`}
          >
            {selecting ? 'Saving…' : isSelected ? '✓ Currently supporting' : 'Support this charity'}
          </button>
        </motion.div>

        {/* Monthly contribution info */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease }}
        >
          <p className={styles.cardLabel}>Monthly Contribution</p>
          <p className={styles.cardBody}>
            {isSelected
              ? `${profile?.charity_percent ?? 10}% of your subscription goes to this charity every month.`
              : 'Select this charity to contribute a portion of your monthly subscription.'}
          </p>
          {isSelected && (
            <Link to="/charities" className={styles.adjustLink}>Adjust your contribution % →</Link>
          )}
        </motion.div>

        {/* One-time donation */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.5, ease }}
        >
          <p className={styles.cardLabel}>One-Time Donation</p>
          <p className={styles.cardBody}>
            Make a direct donation to {charity.name} — independent of your subscription.
          </p>

          {donating ? (
            <form onSubmit={handleDonate} className={styles.donateForm}>
              <div className={styles.donateRow}>
                <span className={styles.donatePound}>£</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={donateAmt}
                  onChange={(e) => setDonateAmt(Number(e.target.value))}
                  className={styles.donateInput}
                  autoFocus
                />
                <button type="submit" disabled={donateLoad} className={styles.donatePay}>
                  {donateLoad ? 'Redirecting…' : 'Donate →'}
                </button>
                <button type="button" onClick={() => setDonating(false)} className={styles.donateCancel}>
                  Cancel
                </button>
              </div>
              {donateError && <p className={styles.donateError}>{donateError}</p>}
              <p className={styles.donateNote}>You'll be taken to Stripe's secure checkout.</p>
            </form>
          ) : (
            <button onClick={() => setDonating(true)} className={styles.donateStartBtn}>
              Make a donation →
            </button>
          )}
        </motion.div>

        {/* Upcoming events */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.20, duration: 0.5, ease }}
        >
          <p className={styles.cardLabel}>Upcoming Events</p>
          {events.length > 0 ? (
            <div className={styles.eventList}>
              {events.map((ev) => (
                <div key={ev.id} className={styles.eventItem}>
                  <div className={styles.eventDateBadge}>
                    <span className={styles.eventDay}>{new Date(ev.event_date + 'T00:00:00').getDate()}</span>
                    <span className={styles.eventMon}>{new Date(ev.event_date + 'T00:00:00').toLocaleString('en-GB', { month: 'short' })}</span>
                  </div>
                  <div className={styles.eventBody}>
                    <p className={styles.eventTitle}>{ev.title}</p>
                    {ev.location && <p className={styles.eventLocation}>📍 {ev.location}</p>}
                    {ev.description && <p className={styles.eventDesc}>{ev.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noEvents}>No upcoming events scheduled for this charity.</p>
          )}
        </motion.div>

      </div>
    </AppLayout>
  );
}
