import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api.js';
import styles from './SubscriptionSuccessPage.module.scss';

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let timer;
    const sessionId = searchParams.get('session_id');

    const confirm = async () => {
      // First try direct session verification (doesn't depend on webhook timing)
      if (sessionId) {
        try {
          const data = await api.get(`/subscription/verify?session_id=${sessionId}`);
          if (data?.status === 'active') {
            setConfirmed(true);
            timer = setTimeout(() => navigate('/dashboard'), 1800);
            return;
          }
        } catch { /* fall through to polling */ }
      }

      // Fallback: poll status in case webhook already fired
      let attempts = 0;
      const MAX = 6;

      const poll = async () => {
        try {
          const data = await api.get('/subscription/status');
          if (data?.status === 'active') {
            setConfirmed(true);
            timer = setTimeout(() => navigate('/dashboard'), 1800);
            return;
          }
        } catch { /* ignore */ }

        attempts++;
        if (attempts < MAX) {
          timer = setTimeout(poll, 1500);
        } else {
          navigate('/dashboard');
        }
      };

      timer = setTimeout(poll, 1000);
    };

    timer = setTimeout(confirm, 800);
    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <div className={styles.page}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={styles.inner}
      >
        <motion.div
          key={confirmed ? 'confirmed' : 'pending'}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: confirmed ? 0 : 0.2, type: 'spring', stiffness: 200 }}
          className={[styles.iconRing, confirmed ? styles.confirmed : styles.pending].join(' ')}
        >
          {confirmed ? (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 16l5 5 11-11" stroke="#10d97a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <div className={styles.spinner} />
          )}
        </motion.div>

        <h1 className={styles.heading}>
          {confirmed ? "You're in!" : 'Confirming your subscription…'}
        </h1>
        <p className={styles.subtext}>
          {confirmed
            ? "Your subscription is active. You're now entered into monthly draws and your contribution is going to your chosen charity."
            : 'Waiting for payment confirmation. This only takes a moment.'}
        </p>
        {confirmed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.redirect}
          >
            Redirecting to your dashboard…
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
