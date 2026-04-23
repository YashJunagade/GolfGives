import styles from './Button.module.scss';

export default function Button({ children, variant = 'primary', loading = false, style: propStyle = {}, className = '', ...props }) {
  const isDisabled = loading || props.disabled;

  return (
    <button
      {...props}
      disabled={isDisabled}
      style={propStyle}
      className={`${styles.btn} ${styles[variant] ?? ''} ${isDisabled ? styles.disabled : ''} ${className}`.trim()}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}
