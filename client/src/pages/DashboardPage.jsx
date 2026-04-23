import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout.jsx';
import useAuthStore from '../store/authStore.js';
import useDashboardStore from '../store/dashboardStore.js';
import api from '../services/api.js';
import styles from './DashboardPage.module.scss';

const ease = [0.22, 1, 0.36, 1];

function fadeUp(i) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.08, duration: 0.45, ease },
  };
}

function GlassCard({ children, className, gold }) {
  return (
    <div className={[styles.glassCard, gold && styles.glassCardGold, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

const subStatusColor = {
  active:    '#10d97a',
  cancelled: '#f87171',
  lapsed:    '#fbbf24',
  none:      'rgba(255,255,255,0.35)',
};

function StatCard({ label, value, color, sub, icon, index }) {
  return (
    <motion.div {...fadeUp(index)}>
      <GlassCard>
        <div className={styles.statCardInner}>
          <div className={styles.statCardTop}>
            <p className={styles.statLabel}>{label}</p>
            <span className={styles.statIcon}>{icon}</span>
          </div>
          <p className={styles.statValue} style={{ '--stat-color': color }}>{value}</p>
          {sub && <p className={styles.statSub}>{sub}</p>}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function Ball({ n }) {
  return <div className={styles.ball}>{n}</div>;
}

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const { subscription: sub, scores, draws, myResults: results, mySubmissions, upcoming, setData } = useDashboardStore();

  useEffect(() => {
    // Always refresh in background; cached data renders immediately if available
    api.get('/dashboard')
      .then(setData)
      .catch(() => {});
  }, []);

  const firstName  = profile?.full_name?.split(' ')[0] || 'there';
  const totalWon   = results.reduce((s, r) => s + Number(r.prize_per_winner || 0), 0);
  const latestDraw = draws[0];

  return (
    <AppLayout>
      <div className={styles.page}>

        {/* Header */}
        <motion.div {...fadeUp(0)} className={styles.header}>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>
                Hey, <span className={styles.titleAccent}>{firstName}</span>
              </h1>
              <p className={styles.subtitle}>
            Here's your overview for {new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
          </p>
            </div>
            {sub?.status !== 'active' && (
              <Link to="/pricing" className={styles.subscribeBtn}>
                Subscribe to enter draws →
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stat row */}
        <div className={styles.statGrid}>
          <StatCard
            label="Subscription"
            value={sub?.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : 'None'}
            color={subStatusColor[sub?.status || 'none']}
            sub={sub?.plan ? `${sub.plan} plan` : 'No plan'}
            icon="◈"
            index={0}
          />
          <StatCard
            label="Scores entered"
            value={`${scores.length} / 5`}
            sub={scores.length === 5 ? 'Ready for draw' : `${5 - scores.length} more needed`}
            icon="◉"
            index={1}
          />
          <StatCard label="Draws entered" value={draws.length} sub="Total draws" icon="◎" index={2} />
          <StatCard
            label="Total won"
            value={`£${totalWon.toFixed(2)}`}
            color="#f59e0b"
            sub={`${results.length} win${results.length !== 1 ? 's' : ''}`}
            icon="★"
            index={3}
          />
        </div>

        {/* Main grid */}
        <div className={styles.mainGrid}>

          {/* Subscription widget */}
          <motion.div {...fadeUp(4)}>
            <GlassCard gold={sub?.status === 'active'} className={styles.widgetPad}>
              <div className={styles.widgetHead}>
                <p className={styles.widgetLabel}>Subscription</p>
                <Link to="/subscription/manage" className={styles.widgetLink}>Manage →</Link>
              </div>
              {sub?.status === 'active' ? (
                <div>
                  <div className={styles.activePlanRow}>
                    <div className={styles.activeDot} />
                    <p className={styles.activePlanName}>{sub.plan} plan</p>
                  </div>
                  <p className={styles.activeRenews}>
                    Renews {sub.current_period_end
                      ? new Date(sub.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className={styles.inactiveSub}>No active subscription</p>
                  <Link to="/pricing" className={styles.subscribeBtnInline}>Subscribe now</Link>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Charity widget */}
          <motion.div {...fadeUp(5)}>
            <GlassCard className={styles.widgetPad}>
              <div className={styles.widgetHead}>
                <p className={styles.widgetLabel}>My Charity</p>
                <Link to="/charities" className={styles.widgetLink}>Change →</Link>
              </div>
              {profile?.charity_id ? (
                <div>
                  <div className={styles.charityIcon}>♡</div>
                  <p className={styles.charityName}>Charity selected</p>
                  <p className={styles.charityPct}>{profile.charity_percent}% contribution per month</p>
                </div>
              ) : (
                <div>
                  <p className={styles.noCharityText}>No charity selected yet</p>
                  <Link to="/charities" className={styles.noCharityLink}>Choose a charity →</Link>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Latest draw widget */}
          <motion.div {...fadeUp(6)}>
            <GlassCard className={styles.widgetPad}>
              <div className={styles.widgetHead}>
                <p className={styles.widgetLabel}>Latest Draw</p>
                <Link to="/draws" className={styles.widgetLink}>All draws →</Link>
              </div>
              {latestDraw ? (
                <div>
                  <p className={styles.drawMonth}>
                    {new Date(latestDraw.year, latestDraw.month - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
                  </p>
                  <div className={styles.ballRow}>
                    {latestDraw.drawn_numbers?.map((n) => <Ball key={n} n={n} />)}
                  </div>
                  <p className={styles.prizeLabel}>
                    Prize pool: <span className={styles.prizeAmount}>£{latestDraw.prize_pools?.total_pool?.toFixed(2) ?? '—'}</span>
                  </p>
                </div>
              ) : (
                <div className={styles.noDrawWrap}>
                  <p className={styles.noDrawIcon}>◎</p>
                  <p className={styles.noDrawText}>No draws published yet</p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Scores widget */}
          <motion.div {...fadeUp(7)}>
            <GlassCard className={styles.widgetPad}>
              <div className={styles.widgetHead}>
                <p className={styles.widgetLabel}>My Scores</p>
                <Link to="/scores" className={styles.widgetLink}>Manage →</Link>
              </div>

              {/* 5-slot progress */}
              <div className={styles.progressBar}>
                {[0,1,2,3,4].map((i) => (
                  <div
                    key={i}
                    className={[styles.progressSlot, i < scores.length && styles.progressSlotFilled].filter(Boolean).join(' ')}
                  />
                ))}
              </div>

              {scores.length > 0 ? (
                <div className={styles.scoreList}>
                  {scores.slice(0, 4).map((s) => (
                    <div key={s.id} className={styles.scoreRow}>
                      <span className={styles.scoreDate}>
                        {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className={styles.scoreValue}>{s.score}</span>
                    </div>
                  ))}
                  {scores.length > 4 && (
                    <p className={styles.scoreMore}>+{scores.length - 4} more</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className={styles.noScoresText}>No scores yet</p>
                  <Link to="/scores" className={styles.noScoresLink}>Add your first score →</Link>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Upcoming draw widget */}
          <motion.div {...fadeUp(8)}>
            <GlassCard className={styles.widgetPad}>
              <div className={styles.widgetHead}>
                <p className={styles.widgetLabel}>Upcoming Draw</p>
                <Link to="/draws" className={styles.widgetLink}>All draws →</Link>
              </div>
              {upcoming ? (
                <div>
                  <p className={styles.upcomingMonth}>
                    {new Date(upcoming.year, upcoming.month - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
                  </p>
                  <div className={styles.upcomingScoreBar}>
                    <div className={styles.upcomingScoreFill} style={{ width: `${(scores.length / 5) * 100}%` }} />
                  </div>
                  <p className={styles.upcomingScoreHint}>
                    {scores.length === 5
                      ? '✓ All 5 scores entered — you\'re in!'
                      : `${scores.length}/5 scores entered — ${5 - scores.length} more to qualify`}
                  </p>
                </div>
              ) : (
                <p className={styles.noDrawText}>No upcoming draw scheduled</p>
              )}
            </GlassCard>
          </motion.div>

          {/* Winnings widget */}
          <motion.div {...fadeUp(9)}>
            <GlassCard className={styles.widgetPad}>
              <div className={styles.widgetHead}>
                <p className={styles.widgetLabel}>My Winnings</p>
                <Link to="/draws" className={styles.widgetLink}>View draws →</Link>
              </div>
              {results.length > 0 ? (
                <div className={styles.winList}>
                  {results.map((r) => {
                    const sub = mySubmissions.find((s) => s.draw_result_id === r.id);
                    const status = sub?.payout_status ?? null;
                    return (
                      <div key={r.id} className={styles.winRow}>
                        <div className={styles.winLeft}>
                          <p className={styles.winMatch}>{r.match_type}-number match</p>
                          <p className={styles.winDate}>
                            {r.draws ? new Date(r.draws.year, r.draws.month - 1).toLocaleString('en-GB', { month: 'short', year: 'numeric' }) : '—'}
                          </p>
                        </div>
                        <div className={styles.winRight}>
                          <p className={styles.winPrize}>£{Number(r.prize_per_winner).toFixed(2)}</p>
                          {status === 'paid'
                            ? <span className={styles.statusPaid}>Paid</span>
                            : status === 'pending'
                            ? <span className={styles.statusPending}>Pending</span>
                            : <span className={styles.statusNone}>Submit proof</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.noDrawWrap}>
                  <p className={styles.noDrawIcon}>★</p>
                  <p className={styles.noDrawText}>No wins yet — keep playing!</p>
                </div>
              )}
            </GlassCard>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
}
