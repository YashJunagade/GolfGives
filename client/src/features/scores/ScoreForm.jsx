import { useState } from 'react';
import { addScore } from '../../services/scoreService.js';
import styles from './ScoreForm.module.scss';

export default function ScoreForm({ onAdded, scoreCount }) {
  const [score,   setScore]   = useState('');
  const [date,    setDate]    = useState(new Date().toISOString().split('T')[0]);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await addScore(parseInt(score, 10), date);
      setScore('');
      onAdded();
    } catch (err) {
      setError(err.error || 'Failed to add score.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.row}>
        <div className={styles.fieldScore}>
          <label className={styles.label}>Score (1–45)</label>
          <input
            type="number" min={1} max={45} required
            value={score} onChange={(e) => setScore(e.target.value)}
            placeholder="28"
            className={styles.input}
          />
        </div>
        <div className={styles.fieldDate}>
          <label className={styles.label}>Date played</label>
          <input
            type="date" required
            value={date} max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            className={styles.input}
          />
        </div>
        <button
          type="submit" disabled={loading}
          className={styles.submitBtn}
        >
          {loading && <span className={styles.spinner} />}
          {loading ? 'Adding...' : '+ Add Score'}
        </button>
      </div>

      {scoreCount >= 5 && (
        <p className={styles.warnMsg}>
          <span>⚠</span> At max 5 scores — adding a new one will remove the oldest.
        </p>
      )}
      {error && (
        <p className={styles.errorMsg}>
          <span>✕</span> {error}
        </p>
      )}
    </form>
  );
}
