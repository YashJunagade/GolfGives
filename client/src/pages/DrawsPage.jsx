import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout.jsx';
import { getPublishedDraws, getMyResults, getMySubmissions, submitProof } from '../services/drawService.js';
import supabase from '../lib/supabaseClient.js';
import styles from './DrawsPage.module.scss';

const ease = [0.22, 1, 0.36, 1];

const tierMeta = {
  5: { label: 'Jackpot',  color: '#f59e0b' },
  4: { label: '4-Match',  color: '#818cf8' },
  3: { label: '3-Match',  color: '#10d97a' },
};

const statusMeta = {
  pending:  { label: 'Proof under review', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
  approved: { label: 'Proof approved',     bg: 'rgba(16,217,122,0.1)', border: 'rgba(16,217,122,0.3)', color: '#10d97a' },
  rejected: { label: 'Proof rejected',     bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  color: '#f87171' },
};

function Ball({ n, highlight }) {
  return (
    <div className={`${styles.ball} ${highlight ? styles.ballHighlight : ''}`}>{n}</div>
  );
}

function ProofSection({ drawResult, submission, onSubmitted }) {
  const fileRef  = useRef(null);
  const [file,    setFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const uploadAndSubmit = async () => {
    if (!file) return setError('Please select a screenshot file.');
    setLoading(true); setError('');
    try {
      const ext  = file.name.split('.').pop();
      const path = `proofs/${drawResult.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('proofs').upload(path, file, { upsert: true });
      if (upErr) throw new Error('Upload failed. Please try again.');
      const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(path);
      await submitProof(drawResult.id, publicUrl);
      onSubmitted();
    } catch (err) {
      setError(err.message || err.error || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submission) {
    const meta = statusMeta[submission.status] || statusMeta.pending;
    return (
      <div className={styles.proofSection}>
        <p className={styles.proofTitle}>Winner Verification</p>
        <div
          className={styles.statusBadge}
          style={{ '--badge-bg': meta.bg, '--badge-border': meta.border, '--badge-color': meta.color }}
        >
          {meta.label}
        </div>
        {submission.payout_status === 'paid' && (
          <p className={styles.payoutNote}>Payment: £{Number(drawResult.prize_per_winner).toFixed(2)} paid ✓</p>
        )}
        {submission.status === 'rejected' && (
          <div className={styles.proofForm}>
            <label className={styles.fileLabel}>
              <input
                ref={fileRef} type="file" accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className={styles.fileInputHidden}
              />
              <span className={styles.fileBtn}>{file ? file.name : 'Choose screenshot…'}</span>
            </label>
            <button className={styles.proofBtn} onClick={uploadAndSubmit} disabled={loading}>
              {loading ? 'Uploading…' : 'Re-submit'}
            </button>
            {error && <p className={styles.proofError}>{error}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.proofSection}>
      <p className={styles.proofTitle}>Submit Proof to Claim Prize</p>
      <p className={styles.proofHint}>
        Upload a screenshot from your golf platform showing your scores.
      </p>
      <div className={styles.proofForm}>
        <label className={styles.fileLabel}>
          <input
            ref={fileRef} type="file" accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className={styles.fileInputHidden}
          />
          <span className={styles.fileBtn}>{file ? file.name : 'Choose screenshot…'}</span>
        </label>
        <button className={styles.proofBtn} onClick={uploadAndSubmit} disabled={loading || !file}>
          {loading ? 'Uploading…' : 'Submit Proof'}
        </button>
      </div>
      {error && <p className={styles.proofError}>{error}</p>}
    </div>
  );
}

export default function DrawsPage() {
  const [draws,       setDraws]       = useState([]);
  const [results,     setResults]     = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading,     setLoading]     = useState(true);

  const load = () => {
    Promise.all([getPublishedDraws(), getMyResults(), getMySubmissions()])
      .then(([d, r, s]) => { setDraws(d); setResults(r); setSubmissions(s); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return (
    <AppLayout>
      <div className={styles.spinnerWrap}><div className={styles.spinner} /></div>
    </AppLayout>
  );

  const myWins = results.length;
  const totalWon = results.reduce((s, r) => s + Number(r.prize_per_winner || 0), 0);

  return (
    <AppLayout>
      <div className={styles.page}>

        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <h1 className={styles.title}>Monthly Draws</h1>
          <p className={styles.subtitle}>
            {myWins > 0
              ? `You've won ${myWins} draw${myWins > 1 ? 's' : ''} — £${totalWon.toFixed(2)} total`
              : 'All published draw results'}
          </p>
        </motion.div>

        {myWins > 0 && (
          <motion.div
            className={styles.winBanner}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease }}
          >
            <div className={styles.winIcon}>★</div>
            <div>
              <p className={styles.winTitle}>Congratulations!</p>
              <p className={styles.winSub}>
                You've won {myWins} draw{myWins > 1 ? 's' : ''} totalling{' '}
                <span className={styles.winAmount}>£{totalWon.toFixed(2)}</span>
              </p>
            </div>
          </motion.div>
        )}

        {!draws.length ? (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>◎</p>
            <p className={styles.emptyText}>No draws published yet</p>
          </div>
        ) : (
          <div className={styles.list}>
            {draws.map((draw, i) => {
              const myResult = results.find((r) => r.draws?.id === draw.id);
              return (
                <motion.div
                  key={draw.id}
                  className={`${styles.card} ${myResult ? styles.cardWon : ''}`}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease }}
                >
                  <div className={styles.cardHead}>
                    <div>
                      <p className={styles.drawMonth}>
                        {new Date(draw.year, draw.month - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className={styles.drawMeta}>
                        {draw.prize_pools?.active_subscribers_count ?? 0} participants · Pool:{' '}
                        <span className={styles.drawPool}>£{draw.prize_pools?.total_pool?.toFixed(2) ?? '0'}</span>
                      </p>
                    </div>
                    {myResult && <div className={styles.wonBadge}>★ YOU WON!</div>}
                  </div>

                  <div className={styles.balls}>
                    {draw.drawn_numbers?.map((n) => <Ball key={n} n={n} />)}
                  </div>

                  {draw.draw_results?.length > 0 && (
                    <div className={styles.tiers}>
                      {draw.draw_results.map((r) => {
                        const meta = tierMeta[r.match_type] || {};
                        return (
                          <div
                            key={r.match_type}
                            className={styles.tier}
                            style={{
                              '--tier-color': meta.color,
                              '--tier-bg': `${meta.color}0f`,
                              '--tier-border': `${meta.color}2a`,
                            }}
                          >
                            <p className={styles.tierLabel}>{meta.label}</p>
                            <p className={styles.tierMeta}>
                              {r.winner_ids?.length ?? 0} winner{r.winner_ids?.length !== 1 ? 's' : ''} ·{' '}
                              <span className={styles.tierPrize}>£{Number(r.prize_per_winner).toFixed(2)}</span> each
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {myResult && (
                    <ProofSection
                      drawResult={myResult}
                      submission={submissions.find((s) => s.draw_results?.id === myResult.id || s.draw_result_id === myResult.id)}
                      onSubmitted={load}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
