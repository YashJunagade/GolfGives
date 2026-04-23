import styles from './Badge.module.scss';

export default function Badge({ children, color = 'gray' }) {
  return (
    <span className={`${styles.badge} ${styles[color] ?? styles.gray}`}>
      {children}
    </span>
  );
}
