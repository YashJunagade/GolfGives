import styles from './Input.module.scss';

export default function Input({ label, error, ...props }) {
  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <input
        {...props}
        className={`${styles.input} ${error ? styles.inputError : ''}`.trim()}
      />
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  );
}
