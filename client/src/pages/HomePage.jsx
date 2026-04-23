import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import LandingNav from '../components/layout/LandingNav.jsx';
import LandingFooter from '../components/layout/LandingFooter.jsx';
import styles from './HomePage.module.scss';

const ease = [0.22, 1, 0.36, 1];

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function GradientText({ children }) {
  return <span className={styles.gradientText}>{children}</span>;
}

function Ball({ n, size = 46 }) {
  return (
    <div
      className={styles.ball}
      style={{ '--ball-size': `${size}px`, '--ball-font-size': `${size * 0.32}px` }}
    >
      {n}
    </div>
  );
}

function HeroPreview() {
  return (
    <div className={styles.heroPreview}>
      {/* Main draw card */}
      <motion.div
        className={styles.cardWrapDrawMain}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease }}
        style={{ transform: 'rotate(2deg)' }}
      >
        <div className={`${styles.cardBase} ${styles.cardDraw}`}>
          <div className={styles.cardDrawHeader}>
            <div>
              <p className={styles.cardDrawLabel}>April 2026 Draw</p>
              <p className={styles.cardDrawPrize}>£2,850</p>
              <p className={styles.cardDrawSub}>prize pool</p>
            </div>
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />
              <span className={styles.liveText}>LIVE</span>
            </div>
          </div>
          <p className={styles.drawnLabel}>Drawn numbers</p>
          <div className={styles.ballRow}>
            {[28, 32, 25, 29, 31].map((n) => <Ball key={n} n={n} size={46} />)}
          </div>
          <div className={styles.cardDrawFooter}>
            <p className={styles.cardFooterText}>127 participants</p>
            <p className={styles.cardFooterText}>Algorithmic draw</p>
          </div>
        </div>
      </motion.div>

      {/* Winner card */}
      <motion.div
        className={styles.cardWrapWinner}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.65, ease }}
        style={{ transform: 'rotate(-3deg)' }}
      >
        <div className={styles.cardWinner}>
          <div className={styles.winnerIcon}>
            <span className={styles.winnerCheck}>✓</span>
          </div>
          <p className={styles.winnerTitle}>4-match winner!</p>
          <p className={styles.winnerSub}>James H. · Edinburgh</p>
          <p className={styles.winnerPrize}>£420</p>
        </div>
      </motion.div>

      {/* Scores card */}
      <motion.div
        className={styles.cardWrapScores}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.8, ease }}
        style={{ transform: 'rotate(-1.5deg)' }}
      >
        <div className={styles.cardScores}>
          <div className={styles.scoresHeader}>
            <p className={styles.scoresLabel}>My scores</p>
            <div className={styles.scoresDots}>
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className={styles.scoresDot} />)}
            </div>
          </div>
          <div className={styles.scoresRow}>
            {[28, 32, 25, 29, 31].map((n) => (
              <div key={n} className={styles.scoreChip}>
                <p className={styles.scoreChipNum}>{n}</p>
              </div>
            ))}
          </div>
          <p className={styles.scoresReady}>5/5 scores · Ready for draw</p>
        </div>
      </motion.div>

      <div className={styles.heroGlow} />
    </div>
  );
}

const stats = [
  { value: '£42,800', label: 'Paid out in prizes', icon: '◈' },
  { value: '1,240+',  label: 'Active members',      icon: '◉' },
  { value: '£18,600', label: 'Donated to charity',  icon: '♡' },
  { value: '48',      label: 'Monthly draws run',   icon: '◎' },
];

const steps = [
  { n: '01', title: 'Subscribe',      desc: 'Choose monthly or yearly. A share of every subscription fuels the prize pool and your chosen charity.', color: '#a855f7' },
  { n: '02', title: 'Log your scores', desc: 'Enter your last 5 Stableford scores after every round. These numbers are your draw entries.',             color: '#f59e0b' },
  { n: '03', title: 'Win monthly',    desc: 'Five numbers are drawn each month. Match 3, 4, or all 5 of your scores to claim your share.',             color: '#10b981' },
];

const stepIcons = ['◈', '◉', '◎'];

const tiers = [
  { match: '5 numbers', pct: '40%', label: 'Jackpot',  desc: 'Rolls over if unclaimed', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  bgHover: 'rgba(251,191,36,0.12)'  },
  { match: '4 numbers', pct: '35%', label: '4-Match',  desc: 'Split among winners',     color: '#a855f7', bg: 'rgba(168,85,247,0.08)',  bgHover: 'rgba(168,85,247,0.12)'  },
  { match: '3 numbers', pct: '25%', label: '3-Match',  desc: 'Split among winners',     color: '#10b981', bg: 'rgba(16,185,129,0.08)',  bgHover: 'rgba(16,185,129,0.12)'  },
];

const CHARITY_COLORS = ['#f87171', '#fb923c', '#a78bfa', '#34d399', '#38bdf8', '#fb7185'];

const testimonials = [
  { quote: "GolfGives is the first platform that makes my game feel like it matters beyond the course. Won once already and donated to Cancer Research.", name: 'James H.', loc: 'Edinburgh', stars: 5 },
  { quote: "Won £340 in my third month. But honestly the charity contribution feels just as good as the win. Brilliant concept.",                         name: 'Sarah T.', loc: 'Manchester', stars: 5 },
  { quote: "The draw system is brilliantly simple. Enter your scores and let GolfGives do the rest.",                                                     name: 'David M.', loc: 'Dublin',     stars: 5 },
];

export default function HomePage() {
  const [charities, setCharities] = useState([]);

  useEffect(() => {
    fetch('/api/charities')
      .then((r) => r.json())
      .then((data) => setCharities(Array.isArray(data) ? data.filter((c) => c.active) : []))
      .catch(() => {});
  }, []);

  const displayCharities = charities.length > 0 ? charities : [];
  const currentMonth = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.page}>
      <LandingNav />

      {/* Fixed atmospheric background */}
      <div className={styles.atmosphere}>
        <div className={[styles.orb, styles.orbViolet].join(' ')} />
        <div className={[styles.orb, styles.orbTeal].join(' ')} />
        <div className={[styles.orb, styles.orbAmber].join(' ')} />
      </div>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.heroBadgeWrap}
          >
            <span className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              Monthly draws now live · {currentMonth}
            </span>
          </motion.div>

          <motion.h1
            className={styles.heroH1}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
          >
            Play golf.<br />
            <GradientText>Give back.</GradientText><br />
            Win big.
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease }}
          >
            Enter your Stableford scores, support a charity you love, and compete in monthly prize draws. Golf with purpose.
          </motion.p>

          <motion.div
            className={styles.heroCtas}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38, ease }}
          >
            <Link to="/signup" className={styles.btnPrimary}>
              Start for free
            </Link>
            <a href="#how-it-works" className={styles.btnGhost}>
              See how it works ↓
            </a>
          </motion.div>

          <motion.div
            className={styles.heroSocial}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <div className={styles.avatarStack}>
              {['J', 'S', 'D', 'A'].map((l, i) => (
                <div
                  key={l}
                  className={styles.avatar}
                  style={{ '--avatar-bg': `hsl(${260 + i * 30},40%,30%)`, zIndex: 4 - i }}
                >
                  {l}
                </div>
              ))}
            </div>
            <p className={styles.heroSocialText}>
              Joined by{' '}
              <span className={styles.heroSocialHighlight}>1,240+ golfers</span>
              {' '}· Cancel anytime
            </p>
          </motion.div>
        </div>

        <HeroPreview />
      </section>

      {/* ── STATS ── */}
      <div className={styles.statsBar}>
        <div className={styles.statsInner}>
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className={[styles.statCell, i === stats.length - 1 ? styles.noBorder : ''].filter(Boolean).join(' ')}>
                <p className={styles.statLabel}>{s.icon} {s.label}</p>
                <p className={styles.statValue}>{s.value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionInner}>
          <Reveal>
            <div className={styles.sectionHeadCenter}>
              <p className={styles.eyebrow}>How it works</p>
              <h2 className={styles.sectionH2}>
                Three steps to<br /><GradientText>winning with purpose</GradientText>
              </h2>
            </div>
          </Reveal>

          <div className={styles.stepsGrid}>
            <div className={styles.stepsConnector} />
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.14}>
                <div
                  className={styles.stepCard}
                  style={{
                    '--step-color': step.color,
                    '--step-icon-bg': `${step.color}15`,
                    '--step-icon-border': `${step.color}35`,
                  }}
                >
                  <div className={styles.stepIconRow}>
                    <div className={styles.stepIcon}>{stepIcons[i]}</div>
                    <span className={styles.stepNum}>{step.n}</span>
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE POOL ── */}
      <section id="draws" className={styles.prizeSection}>
        <div className={styles.prizeInner}>
          <Reveal>
            <p className={styles.eyebrow}>Prize pool</p>
            <h2 className={styles.prizeH2}>Real prizes,<br />every month</h2>
            <p className={styles.prizeBody}>
              60% of subscription revenue goes directly into the prize pool. Three tiers mean more chances to win every single month.
            </p>
            <Link to="/signup" className={styles.btnPrimaryMd}>
              Join the draw →
            </Link>
          </Reveal>

          <Reveal delay={0.18}>
            <div className={styles.tierList}>
              <div className={styles.tierBallRow}>
                {[28, 32, 25, 29, 31].map((n) => <Ball key={n} n={n} size={52} />)}
              </div>
              {tiers.map((t) => (
                <div
                  key={t.label}
                  className={styles.tierCard}
                  style={{
                    '--tier-bg': t.bg,
                    '--tier-bg-hover': t.bgHover,
                    '--tier-border': `${t.color}25`,
                    '--tier-border-hover': `${t.color}50`,
                    '--tier-color': t.color,
                    '--tier-icon-bg': `${t.color}18`,
                    '--tier-icon-border': `${t.color}44`,
                  }}
                >
                  <div className={styles.tierIconBox}>
                    <span className={styles.tierPct}>{t.pct}</span>
                  </div>
                  <div className={styles.tierInfo}>
                    <p className={styles.tierName}>{t.match} match</p>
                    <p className={styles.tierMeta}>{t.label} · {t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CHARITIES ── */}
      <section id="charities" className={styles.charitiesSection}>
        <div className={styles.sectionInner}>
          <Reveal>
            <div className={[styles.sectionHeadCenter, styles.sectionHeadMb64].join(' ')}>
              <p className={styles.eyebrow}>Charity partners</p>
              <h2 className={[styles.sectionH2, styles.sectionH2Sm].join(' ')}>
                Every round,<br /><GradientText>someone benefits</GradientText>
              </h2>
              <p className={styles.charitySectionDesc}>
                At least 10% of your subscription goes to your chosen charity — every month.
              </p>
            </div>
          </Reveal>
          <div className={styles.charityGrid}>
            {displayCharities.map((c, i) => {
              const color = CHARITY_COLORS[i % CHARITY_COLORS.length];
              return (
                <Reveal key={c.id ?? c.name} delay={i * 0.09}>
                  <div
                    className={styles.charityCard}
                    style={{
                      '--charity-icon-bg':     `${color}15`,
                      '--charity-icon-border': `${color}35`,
                      '--charity-cause-color': `${color}99`,
                    }}
                  >
                    {c.featured && <span className={styles.featuredBadge}>★ Featured</span>}
                    <div className={styles.charityIcon}>♡</div>
                    <p className={styles.charityName}>{c.name}</p>
                    <p className={styles.charityCause}>{c.description || 'Charity partner'}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionInner}>
          <Reveal>
            <div className={[styles.sectionHeadCenter, styles.sectionHeadMb64].join(' ')}>
              <p className={styles.eyebrow}>Member stories</p>
              <h2 className={[styles.sectionH2, styles.sectionH2Sm].join(' ')}>
                Loved by <GradientText>golfers everywhere</GradientText>
              </h2>
            </div>
          </Reveal>
          <div className={styles.testimonialGrid}>
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.12}>
                <div className={styles.testimonialCard}>
                  <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((s) => <span key={s} className={styles.star}>★</span>)}
                  </div>
                  <p className={styles.testimonialQuote}>"{t.quote}"</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.testimonialAvatar}>{t.name[0]}</div>
                    <div>
                      <p className={styles.testimonialName}>{t.name}</p>
                      <p className={styles.testimonialLoc}>{t.loc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlowViolet} />
        <div className={styles.ctaGlowAmber} />
        <Reveal>
          <div className={styles.ctaContent}>
            <p className={styles.ctaEyebrow}>Ready to start?</p>
            <h2 className={styles.ctaH2}>
              Play golf.<br /><GradientText>Make a difference.</GradientText>
            </h2>
            <p className={styles.ctaSub}>
              Join 1,240+ golfers already making an impact.
            </p>
            <Link to="/signup" className={styles.btnPrimaryLg}>
              Get started free →
            </Link>
            <p className={styles.ctaDisclaimer}>No commitment · Cancel anytime · From £9.99/month</p>
          </div>
        </Reveal>
      </section>

      <LandingFooter />
    </div>
  );
}
