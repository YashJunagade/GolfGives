import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateScore, deleteScore } from '../../services/scoreService.js';
import styles from './ScoreList.module.scss';

const ease = [0.22, 1, 0.36, 1];

export default function ScoreList({ scores, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const [error,     setError]     = useState('');

  const startEdit = (score) => {
    setError('');
    setEditingId(score.id);
    setEditValue(String(score.score));
  };

  const saveEdit = async (id) => {
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val < 1 || val > 45) {
      setError('Score must be between 1 and 45.');
      return;
    }
    setLoadingId(id);
    setError('');
    try {
      await updateScore(id, val);
      onUpdate();
      setEditingId(null);
    } catch (err) {
      setError(err.error || 'Failed to save score. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    setLoadingId(id);
    setError('');
    try {
      await deleteScore(id);
      onUpdate();
    } catch {
      setError('Failed to delete score. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  if (!scores.length) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyIcon}>◉</p>
        <p className={styles.emptyText}>No scores yet. Add your first score below.</p>
      </div>
    );
  }

  return (
    <div>
      {error && <p className={styles.listError}>{error}</p>}
      <div className={styles.list}>
        <AnimatePresence initial={false}>
          {scores.map((s, i) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease }}
              className={styles.row}
            >
              <div className={styles.posDot}>{i + 1}</div>

              <span className={styles.date}>
                {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>

              {editingId === s.id ? (
                <input
                  type="number" min={1} max={45}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(s.id); if (e.key === 'Escape') setEditingId(null); }}
                  autoFocus
                  className={styles.editInput}
                />
              ) : (
                <div className={styles.scoreChip}>{s.score}</div>
              )}

              <div className={styles.actions}>
                {editingId === s.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(s.id)}
                      disabled={loadingId === s.id}
                      className={styles.btnSave}
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className={styles.btnCancel}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(s)} className={styles.btnEdit}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={loadingId === s.id}
                      className={styles.btnDelete}
                    >
                      {loadingId === s.id ? '...' : '✕'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
