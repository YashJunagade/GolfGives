import { Link } from 'react-router-dom';
import styles from './LandingFooter.module.scss';

export default function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div>
            <Link to="/" className={styles.logoLink}>
              <div className={styles.logoIcon}>
                <span className={styles.logoLetter}>G</span>
              </div>
              <span className={styles.logoText}>GolfGives</span>
            </Link>
            <p className={styles.tagline}>
              Play golf. Give back. Win big. Connecting golfers with charities through monthly prize draws.
            </p>
            <p className={styles.copyright}>© 2026 GolfGives. All rights reserved.</p>
          </div>

          {[
            { title: 'Platform', links: ['How it works', 'Monthly draws', 'Prize pools', 'Charities'] },
            { title: 'Account',  links: ['Sign up', 'Sign in', 'Dashboard', 'Pricing'] },
            { title: 'Legal',    links: ['Privacy policy', 'Terms of use', 'Cookie policy', 'Contact'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <p className={styles.colTitle}>{title}</p>
              {links.map((l) => (
                <p key={l} className={styles.colItem}>
                  <a href="#" className={styles.colLink}>{l}</a>
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <p className={styles.secureNote}>Secured by Stripe · PCI compliant</p>
        </div>
      </div>
    </footer>
  );
}
