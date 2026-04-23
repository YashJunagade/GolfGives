import { useEffect, useState } from 'react';
import { adminGetSubscriptions } from '../../services/adminService.js';
import styles from './AdminPage.module.scss';

const statusVars = {
  active:    { '--badge-color': '#34d399', '--badge-bg': 'rgba(52,211,153,0.12)'  },
  cancelled: { '--badge-color': '#f87171', '--badge-bg': 'rgba(248,113,113,0.12)' },
  lapsed:    { '--badge-color': '#fbbf24', '--badge-bg': 'rgba(251,191,36,0.12)'  },
};

export default function AdminSubscriptionsPage() {
  const [subs,    setSubs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => { adminGetSubscriptions().then(setSubs).finally(() => setLoading(false)); }, []);

  const filtered = search.trim()
    ? subs.filter((s) =>
        s.users?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.users?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : subs;

  const counts = { active: 0, cancelled: 0, lapsed: 0 };
  subs.forEach((s) => { if (counts[s.status] !== undefined) counts[s.status]++; });

  if (loading) return <p className={styles.loading}>Loading...</p>;

  return (
    <div className={styles.list}>
      {/* Summary row */}
      <div className={styles.statsGrid} style={{ '--cols': 3 }}>
        {[['Active', counts.active, '#34d399'], ['Cancelled', counts.cancelled, '#f87171'], ['Lapsed', counts.lapsed, '#fbbf24']].map(([label, val, color]) => (
          <div key={label} className={styles.statTile} style={{ '--stat-accent': color }}>
            <p className={styles.statTileValue}>{val}</p>
            <p className={styles.statTileLabel}>{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className={styles.panel}>
        <div className={styles.usersHeader}>
          <p className={styles.sectionLabel}>All Subscriptions ({subs.length})</p>
          <input
            className={styles.searchInput}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!filtered.length && (
        <p className={styles.empty}>{search ? 'No subscriptions match.' : 'No subscriptions yet.'}</p>
      )}

      {filtered.map((s) => {
        const vars = statusVars[s.status] ?? { '--badge-color': 'rgba(255,255,255,0.35)', '--badge-bg': 'rgba(255,255,255,0.06)' };
        const renewal = s.current_period_end
          ? new Date(s.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : '—';
        return (
          <div key={s.id} className={styles.userRowWrap}>
            <div className={styles.userRow}>
              <div className={styles.userInfo}>
                <p className={styles.userName}>{s.users?.full_name || '—'}</p>
                <p className={styles.userEmail}>{s.users?.email}</p>
              </div>
              <div className={styles.userMeta}>
                <span className={styles.statusBadge} style={vars}>{s.status}</span>
                {s.plan && <span className={styles.userPlan}>{s.plan}</span>}
                <span className={styles.userJoined}>Renews {renewal}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
