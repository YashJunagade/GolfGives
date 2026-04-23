import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './LandingNav.module.scss';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={[styles.nav, scrolled && styles.navScrolled].filter(Boolean).join(' ')}
    >
      <Link to="/" className={styles.logoLink}>
        <div className={styles.logoIcon}>
          <span className={styles.logoLetter}>G</span>
        </div>
        <span className={styles.logoText}>GolfGives</span>
      </Link>

      <div className={styles.links}>
        {[
          { label: 'How it works', href: '#how-it-works' },
          { label: 'Charities',   href: '#charities' },
          { label: 'Prize pool',  href: '#draws' },
        ].map(({ label, href }) => (
          <a key={label} href={href} className={styles.navLink}>
            {label}
          </a>
        ))}
      </div>

      <div className={styles.actions}>
        <Link to="/login" className={styles.signIn}>
          Sign in
        </Link>
        <Link to="/signup" className={styles.getStarted}>
          Get started
        </Link>
      </div>
    </motion.nav>
  );
}
