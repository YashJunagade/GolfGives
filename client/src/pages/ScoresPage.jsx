import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout.jsx';
import ScoreList from '../features/scores/ScoreList.jsx';
import ScoreForm from '../features/scores/ScoreForm.jsx';
import { getScores } from '../services/scoreService.js';
import styles from './ScoresPage.module.scss';

const ease = [0.22, 1, 0.36, 1];

export default function ScoresPage() {
  const [scores,  setScores]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    try {
      const data = await getScores();
      setScores(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchScores(); }, [fetchScores]);

  const maxScore = scores.length ? Math.max(...scores.map((s) => s.score)) : 0;
  const avgScore = scores.length ? (scores.reduce((a, s) => a + s.score, 0) / scores.length).toFixed(1) : '—';

  const statItems = [
    { label: 'Best score',   value: maxScore,        color: '#f59e0b' },
    { label: 'Average',      value: avgScore,         color: '#ffffff' },
    { label: 'Total scores', value: scores.length,    color: '#ffffff' },
  ];

  return (
    <AppLayout>
      <div className={styles.page}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className={styles.header}
        >
          <h1 className={styles.title}>My Scores</h1>
          <p className={styles.subtitle}>
            Your last 5 Stableford scores — used as your monthly draw entries.
          </p>
        </motion.div>

        {/* Score progress + stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease }}
          className={styles.progressCard}
        >
          <div className={styles.progressHead}>
            <div>
              <p className={styles.slotsLabel}>Draw entry slots</p>
              <p className={styles.slotsCount}>
                {scores.length}<span className={styles.slotsDenom}> / 5</span>
              </p>
            </div>
            <div className={styles.dotsRow}>
              {[0,1,2,3,4].map((i) => (
                <div
                  key={i}
                  className={[styles.dot, i < scores.length && styles.dotFilled].filter(Boolean).join(' ')}
                />
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ '--pct': (scores.length / 5) * 100 }}
            />
          </div>

          {scores.length > 0 && (
            <div className={styles.statsGrid}>
              {statItems.map((stat) => (
                <div key={stat.label} className={styles.statCard}>
                  <p className={styles.statValue} style={{ '--stat-color': stat.color }}>{stat.value}</p>
                  <p className={styles.statLabel}>{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Score list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.5, ease }}
          className={styles.listSection}
        >
          {loading ? (
            <div className={styles.spinnerWrap}>
              <div className={styles.spinner} />
            </div>
          ) : (
            <ScoreList scores={scores} onUpdate={fetchScores} />
          )}
        </motion.div>

        {/* Add score */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease }}
          className={styles.addCard}
        >
          <p className={styles.addLabel}>Add new score</p>
          <ScoreForm onAdded={fetchScores} scoreCount={scores.length} />
        </motion.div>

      </div>
    </AppLayout>
  );
}
