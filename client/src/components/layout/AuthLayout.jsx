import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './AuthLayout.module.scss';

const ease = [0.22, 1, 0.36, 1];

const stats = [
  { value: '£42,800', label: 'Paid in prizes' },
  { value: '1,240',   label: 'Active members' },
  { value: '£18,600', label: 'Donated' },
];

const BALL_NUMBERS = [28, 32, 25, 29, 31];

const HOW_IT_WORKS = [
  'Subscribe to enter monthly draws',
  'Enter your last 5 Stableford scores',
  'Match drawn numbers to win prizes',
];

function Ball({ n }) {
  return <div className={styles.ball}>{n}</div>;
}

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className={styles.root}>

      {/* Left panel */}
      <div className={styles.leftPanel}>
        {/* Atmospheric orbs */}
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />

        {/* Logo */}
        <Link to="/" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            <span className={styles.logoLetter}>G</span>
          </div>
          <span className={styles.logoName}>GolfGives</span>
        </Link>

        {/* Main content */}
        <motion.div
          className={styles.copyBlock}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease }}
        >
          <h2 className={styles.headline}>
            Play golf.<br />
            <span className={styles.headlineGradient}>Give back.</span><br />
            Win big.
          </h2>
          <p className={styles.tagline}>
            Enter your Stableford scores, support a charity you love, and compete in monthly prize draws.
          </p>
          <div className={styles.ballsRow}>
            {BALL_NUMBERS.map((n) => <Ball key={n} n={n} />)}
          </div>
          <div className={styles.statsGrid}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statCard}>
                <p className={styles.statValue}>{s.value}</p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div
          className={styles.stepsBlock}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <p className={styles.stepsHeading}>How it works</p>
          <div className={styles.stepsList}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s} className={styles.stepRow}>
                <span className={styles.stepBadge}>{i + 1}</span>
                <span className={styles.stepText}>{s}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className={styles.rightPanel}>
        <motion.div
          className={styles.formWrapper}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          {/* Mobile logo — shown only on small screens via media query */}
          <div className={styles.mobileLogo}>
            <div className={styles.mobileLogoIcon}>
              <span className={styles.mobileLogoLetter}>G</span>
            </div>
            <span className={styles.mobileLogoName}>GolfGives</span>
          </div>

          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>{title}</h1>
            {subtitle && <p className={styles.formSubtitle}>{subtitle}</p>}
          </div>

          {children}
        </motion.div>
      </div>

    </div>
  );
}
