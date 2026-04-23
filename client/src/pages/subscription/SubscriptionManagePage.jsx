import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '../../components/layout/AppLayout.jsx';
import useDashboardStore from '../../store/dashboardStore.js';
import { cancelSubscription } from '../../services/subscriptionService.js';
import styles from './SubscriptionManagePage.module.scss';

const ease = [0.22, 1, 0.36, 1];

const planLabel = { monthly: 'Monthly Plan', yearly: 'Yearly Plan' };

export default function SubscriptionManagePage() {
  const navigate = useNavigate();
  const { subscription: sub, setData, scores, draws, myResults } = useDashboardStore();
  const [confirming, setConfirming] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const handleCancel = async () => {
    setLoading(true);
    setError('');
    try {
      await cancelSubscription();
      setData({ subscription: { ...sub, status: 'cancelled' }, scores, draws, myResults });
      navigate('/dashboard');
    } catch (err) {
      setError(err.error || 'Failed to cancel. Please try again.');
      setLoading(false);
    }
  };

  const isActive    = sub?.status === 'active';
  const isCancelled = sub?.status === 'cancelled';

  const badgeVars = isActive
    ? { '--badge-bg': 'rgba(16,217,122,0.12)', '--badge-border': 'rgba(16,217,122,0.3)', '--badge-color': '#10d97a', '--dot-color': '#10d97a' }
    : { '--badge-bg': 'rgba(248,113,113,0.12)', '--badge-border': 'rgba(248,113,113,0.3)', '--badge-color': '#f87171', '--dot-color': '#f87171' };

  return (
    <AppLayout>
      <div className={styles.container}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className={styles.header}
        >
          <Link to="/dashboard" className={styles.backLink}>
            ← Back to dashboard
          </Link>
          <h1 className={styles.pageTitle}>Manage Subscription</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease }}
          className={[styles.planCard, isActive ? styles.active : styles.inactive].join(' ')}
        >
          <div className={styles.planCardTop}>
            <div>
              <p className={styles.planLabel}>Current Plan</p>
              <div className={styles.planNameRow}>
                <div className={styles.statusDot} style={badgeVars} />
                <p className={styles.planName}>
                  {sub?.plan ? planLabel[sub.plan] : 'No Plan'}
                </p>
              </div>
            </div>
            <div className={styles.statusBadge} style={badgeVars}>
              {sub?.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : 'None'}
            </div>
          </div>

          <div className={styles.planMeta}>
            <div className={styles.metaGroup}>
              <p className={styles.metaLabel}>Billing</p>
              <p className={styles.metaValue}>
                {sub?.plan === 'yearly' ? '£89.99 / year' : '£9.99 / month'}
              </p>
            </div>
            {sub?.current_period_end && (
              <div className={styles.metaGroup}>
                <p className={styles.metaLabel}>
                  {isCancelled ? 'Access until' : 'Renews'}
                </p>
                <p className={styles.metaValue}>
                  {new Date(sub.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {isActive && !confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16, duration: 0.4 }}
          >
            <button onClick={() => setConfirming(true)} className={styles.cancelTrigger}>
              Cancel subscription
            </button>
          </motion.div>
        )}

        {confirming && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.confirmPanel}
          >
            <p className={styles.confirmTitle}>Cancel your subscription?</p>
            <p className={styles.confirmBody}>
              You'll keep access until the end of your current billing period. You won't be charged again.
            </p>
            {error && <p className={styles.errorText}>{error}</p>}
            <div className={styles.confirmActions}>
              <button
                onClick={handleCancel}
                disabled={loading}
                className={styles.confirmCancelBtn}
              >
                {loading && <span className={styles.btnSpinner} />}
                {loading ? 'Cancelling…' : 'Yes, cancel'}
              </button>
              <button onClick={() => setConfirming(false)} className={styles.keepBtn}>
                Keep subscription
              </button>
            </div>
          </motion.div>
        )}

        {isCancelled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
            className={styles.resubSection}
          >
            <p className={styles.resubPrompt}>Want to resubscribe?</p>
            <Link to="/pricing" className={styles.resubLink}>View plans</Link>
          </motion.div>
        )}

      </div>
    </AppLayout>
  );
}
