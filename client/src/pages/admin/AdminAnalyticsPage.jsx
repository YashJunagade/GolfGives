import { useEffect, useState } from 'react';
import { adminGetAnalytics } from '../../services/adminService.js';
import styles from './AdminPage.module.scss';

function StatTile({ label, value, color }) {
  return (
    <div className={styles.statTile} style={{ '--stat-accent': color ?? 'rgba(255,255,255,0.5)' }}>
      <p className={styles.statTileValue}>{value}</p>
      <p className={styles.statTileLabel}>{label}</p>
    </div>
  );
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminAnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminGetAnalytics().then(setData).finally(() => setLoading(false)); }, []);

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (!data)   return <p className={styles.empty}>Failed to load analytics.</p>;

  return (
    <div className={styles.list}>
      <div className={styles.statsGrid}>
        <StatTile label="Total Users"       value={data.totalUsers}                               color="#818cf8" />
        <StatTile label="Active Subs"       value={data.activeSubs}                               color="#34d399" />
        <StatTile label="Total Prize Pool"  value={`£${Number(data.totalPool).toFixed(2)}`}       color="#f59e0b" />
        <StatTile label="Charity Donated"   value={`£${Number(data.totalCharity).toFixed(2)}`}    color="#c084fc" />
        <StatTile label="Draws Run"         value={data.totalDraws}                               color="#38bdf8" />
        <StatTile label="Charities Listed"  value={data.totalCharities}                           color="#fb923c" />
      </div>

      {data.drawStats?.length > 0 && (
        <div className={styles.panel} style={{ marginTop: 8 }}>
          <p className={styles.sectionLabel}>Draw Statistics</p>
          <div className={styles.drawStatsTable}>
            <div className={styles.drawStatsHeader}>
              <span>Draw</span>
              <span>Type</span>
              <span>Subscribers</span>
              <span>Prize Pool</span>
              <span>5-Match</span>
              <span>4-Match</span>
              <span>3-Match</span>
              <span>Status</span>
            </div>
            {data.drawStats.map((d) => (
              <div key={d.id} className={styles.drawStatsRow}>
                <span className={styles.drawStatsPrimary}>{MONTH_NAMES[d.month - 1]} {d.year}</span>
                <span style={{ textTransform: 'capitalize', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{d.draw_type}</span>
                <span>{d.subscribers}</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>£{Number(d.total_pool).toFixed(2)}</span>
                <span style={{ color: d.winners.five > 0 ? '#34d399' : 'rgba(255,255,255,0.3)' }}>
                  {d.winners.five > 0 ? d.winners.five : '—'}
                </span>
                <span style={{ color: d.winners.four > 0 ? '#818cf8' : 'rgba(255,255,255,0.3)' }}>
                  {d.winners.four > 0 ? d.winners.four : '—'}
                </span>
                <span style={{ color: d.winners.three > 0 ? '#38bdf8' : 'rgba(255,255,255,0.3)' }}>
                  {d.winners.three > 0 ? d.winners.three : '—'}
                </span>
                <span className={styles.statusBadge} style={
                  d.status === 'published'
                    ? { '--badge-color': '#34d399', '--badge-bg': 'rgba(52,211,153,0.12)' }
                    : { '--badge-color': '#fbbf24', '--badge-bg': 'rgba(251,191,36,0.12)' }
                }>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
