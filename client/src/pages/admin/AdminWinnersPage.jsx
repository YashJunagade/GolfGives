import { useEffect, useState } from 'react';
import { adminGetWinners, adminReview, adminMarkPaid } from '../../services/adminService.js';
import styles from './AdminPage.module.scss';

export default function AdminWinnersPage() {
  const [subs,   setSubs]   = useState([]);
  const [acting, setActing] = useState(null);

  useEffect(() => { adminGetWinners().then(setSubs); }, []);

  const review = async (id, status) => {
    setActing(id);
    const updated = await adminReview(id, status).finally(() => setActing(null));
    setSubs((prev) => prev.map((s) => s.id === id ? updated : s));
  };

  const markPaid = async (id) => {
    setActing(id);
    const updated = await adminMarkPaid(id).finally(() => setActing(null));
    setSubs((prev) => prev.map((s) => s.id === id ? updated : s));
  };

  const badgeVars = {
    pending:  { '--badge-color': '#fbbf24', '--badge-bg': 'rgba(251,191,36,0.12)'  },
    approved: { '--badge-color': '#34d399', '--badge-bg': 'rgba(52,211,153,0.12)'  },
    rejected: { '--badge-color': '#f87171', '--badge-bg': 'rgba(248,113,113,0.12)' },
  };

  return (
    <div className={styles.listCompact}>
      {!subs.length && <p className={styles.empty}>No submissions yet.</p>}
      {subs.map((s) => (
        <div key={s.id} className={styles.winnerCard}>
          <div className={styles.winnerCardInner}>
            <div>
              <p className={styles.winnerName}>
                {s.users?.full_name}{' '}
                <span className={styles.winnerEmail}>({s.users?.email})</span>
              </p>
              <p className={styles.winnerMeta}>
                {s.draw_results?.match_type}-Match · £{s.draw_results?.prize_per_winner} ·
                {s.draw_results?.draws
                  ? ` ${new Date(s.draw_results.draws.year, s.draw_results.draws.month - 1).toLocaleString('en-GB', { month: 'short', year: 'numeric' })}`
                  : ''}
              </p>
              <a href={s.proof_url} target="_blank" rel="noreferrer" className={styles.winnerProof}>
                View proof ↗
              </a>
            </div>
            <div className={styles.winnerActions}>
              <span className={styles.statusBadge} style={badgeVars[s.status] ?? {}}>
                {s.status}
              </span>
              {s.status === 'pending' && (
                <>
                  <button
                    onClick={() => review(s.id, 'approved')}
                    disabled={acting === s.id}
                    className={styles.btnApprove}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => review(s.id, 'rejected')}
                    disabled={acting === s.id}
                    className={styles.btnReject}
                  >
                    Reject
                  </button>
                </>
              )}
              {s.status === 'approved' && s.payout_status === 'pending' && (
                <button
                  onClick={() => markPaid(s.id)}
                  disabled={acting === s.id}
                  className={styles.btnMarkPaid}
                >
                  Mark Paid
                </button>
              )}
              {s.payout_status === 'paid' && (
                <span className={styles.paidLabel}>✓ Paid</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
