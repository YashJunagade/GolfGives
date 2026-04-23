import styles from './AuthCard.module.scss';

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.brandName}>GolfGives</h1>
          <p className={styles.brandTagline}>Play golf. Give back. Win big.</p>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{title}</h2>
          {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
