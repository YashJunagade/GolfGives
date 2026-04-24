import { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../../lib/supabaseClient.js';
import useAuthStore from '../../store/authStore.js';
import styles from './AppLayout.module.scss';

const memberItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '◈' },
  { to: '/scores',    label: 'My Scores',  icon: '◉' },
  { to: '/draws',     label: 'Draws',      icon: '◎' },
  { to: '/charities', label: 'Charities',  icon: '♡' },
];
const adminItems = [
  { to: '/admin/draws',         label: 'Draws',         icon: '◎' },
  { to: '/admin/winners',       label: 'Winners',       icon: '★' },
  { to: '/admin/charities',     label: 'Charities',     icon: '♡' },
  { to: '/admin/users',         label: 'Users',         icon: '◉' },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: '◈' },
  { to: '/admin/analytics',     label: 'Analytics',     icon: '▦' },
];

function NavItem({ item, isActive, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={[styles.navItem, isActive && styles.navItemActive].filter(Boolean).join(' ')}
    >
      <span className={[styles.navIcon, isActive && styles.navIconActive].filter(Boolean).join(' ')}>
        {item.icon}
      </span>
      {item.label}
    </NavLink>
  );
}

function Sidebar({ profile, onSignOut, onClose }) {
  const location = useLocation();
  const initial  = (profile?.full_name || 'U')[0].toUpperCase();

  return (
    <div className={styles.sidebarInner}>
      <div className={styles.sidebarGlow} />

      {/* Logo */}
      <div className={styles.logoStrip}>
        <div className={styles.logoIcon}>
          <span className={styles.logoIconLetter}>G</span>
        </div>
        <span className={styles.logoName}>GolfGives</span>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {profile?.role === 'admin' ? (
          <>
            <p className={styles.adminLabel}>Admin</p>
            {adminItems.map((item) => (
              <NavItem key={item.to} item={item} isActive={location.pathname.startsWith(item.to)} onClick={onClose} />
            ))}
          </>
        ) : (
          memberItems.map((item) => (
            <NavItem key={item.to} item={item} isActive={location.pathname === item.to} onClick={onClose} />
          ))
        )}
      </nav>

      {/* User */}
      <div className={styles.userFooter}>
        <div className={styles.userCard}>
          <Link to={profile?.role === 'admin' ? '/admin' : '/profile'} onClick={onClose} className={styles.userCardLink}>
            <div className={styles.userAvatar}>{initial}</div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{profile?.full_name || 'User'}</p>
              <p className={styles.userEmail}>{profile?.email}</p>
            </div>
          </Link>
          <button onClick={onSignOut} title="Sign out" className={styles.signOutBtn}>
            ⎋
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  const { profile }  = useAuthStore();
  const navigate     = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className={styles.root}>

      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        <Sidebar profile={profile} onSignOut={handleSignOut} onClose={() => {}} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.mobileBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className={styles.mobileDrawer}
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            >
              <Sidebar profile={profile} onSignOut={handleSignOut} onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className={styles.mainCol}>
        <header className={styles.topbar}>
          <button onClick={() => setMobileOpen(true)} className={styles.menuBtn}>☰</button>
          <div className={styles.topbarLogo}>
            <div className={styles.topbarLogoIcon}>
              <span className={styles.topbarLogoLetter}>G</span>
            </div>
            <span className={styles.topbarLogoName}>GolfGives</span>
          </div>
        </header>

        <main className={styles.main}>
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>

    </div>
  );
}
