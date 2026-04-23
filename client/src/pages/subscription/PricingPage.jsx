import { useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '../../components/layout/AppLayout.jsx';
import { createCheckout } from '../../services/subscriptionService.js';
import styles from './PricingPage.module.scss';

const ease = [0.22, 1, 0.36, 1];

const plans = [
  {
    id:       'monthly',
    label:    'Monthly',
    price:    '£9.99',
    period:   '/ month',
    saving:   null,
    features: [
      'Enter every monthly draw',
      'Up to 5 Stableford scores',
      'Support your chosen charity',
      'View draw history & results',
    ],
    popular: false,
  },
  {
    id:       'yearly',
    label:    'Yearly',
    price:    '£89.99',
    period:   '/ year',
    saving:   'Save £29.89 vs monthly',
    features: [
      'Everything in Monthly',
      '2 months free',
      'Priority winner verification',
      'Early access to new features',
    ],
    popular: true,
  },
];

const CHECK_COLOR = {
  popular:  { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.33)', stroke: '#f59e0b' },
  standard: { bg: 'rgba(16,217,122,0.1)',  border: 'rgba(16,217,122,0.25)', stroke: '#10d97a' },
};

function CheckIcon({ popular }) {
  const c = popular ? CHECK_COLOR.popular : CHECK_COLOR.standard;
  return (
    <div
      className={styles.checkIcon}
      style={{ '--check-bg': c.bg, '--check-border': c.border }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5l2 2 4-4" stroke={c.stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function PricingPage() {
  const [loading, setLoading] = useState(null);
  const [error,   setError]   = useState('');

  const handleSubscribe = async (plan) => {
    setError('');
    setLoading(plan);
    try {
      const { url } = await createCheckout(plan);
      window.location.href = url;
    } catch (err) {
      setError(err.error || 'Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  return (
    <AppLayout>
      <div className={styles.container}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className={styles.header}
        >
          <p className={styles.eyebrow}>Simple pricing</p>
          <h1 className={styles.title}>Choose your plan</h1>
          <p className={styles.subtitle}>
            Subscribe to enter monthly draws and support your chosen charity
          </p>
        </motion.div>

        <div className={styles.grid}>
          {plans.map((plan, i) => {
            const isLoading = loading === plan.id;
            const isDimmed  = !!loading && !isLoading;

            const cardClass = [styles.card, plan.popular ? styles.popular : styles.standard].join(' ');
            const btnClass  = [
              styles.subscribeBtn,
              plan.popular ? styles.btnPopular : styles.btnStandard,
              isDimmed ? styles.dimmed : '',
            ].filter(Boolean).join(' ');

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.55, ease }}
                className={styles.cardWrapper}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>BEST VALUE</div>
                )}

                <div className={cardClass}>
                  <p className={styles.planLabelText}>{plan.label}</p>

                  <div className={styles.priceRow}>
                    <span className={styles.priceAmount}>{plan.price}</span>
                    <span className={styles.pricePeriod}>{plan.period}</span>
                  </div>

                  {plan.saving ? (
                    <div className={styles.savingBadge}>
                      <span className={styles.savingText}>{plan.saving}</span>
                    </div>
                  ) : (
                    <div className={styles.savingPlaceholder} />
                  )}

                  <div className={styles.featureList}>
                    {plan.features.map((f) => (
                      <div key={f} className={styles.featureItem}>
                        <CheckIcon popular={plan.popular} />
                        <span className={styles.featureText}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!loading}
                    className={btnClass}
                  >
                    {isLoading && <span className={styles.btnSpinner} />}
                    {isLoading ? 'Redirecting...' : 'Subscribe now'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <p className={styles.footer}>
          Secured by Stripe · Cancel anytime
        </p>
      </div>
    </AppLayout>
  );
}
