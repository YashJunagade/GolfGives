import { useLocation, NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '../../components/layout/AppLayout.jsx';
import styles from './AdminPage.module.scss';

const tabs = [
  { path: 'draws',         label: 'Draws' },
  { path: 'winners',       label: 'Winners' },
  { path: 'charities',     label: 'Charities' },
  { path: 'users',         label: 'Users' },
  { path: 'subscriptions', label: 'Subscriptions' },
  { path: 'analytics',     label: 'Analytics' },
];

export default function AdminPage() {
  const { pathname } = useLocation();

  return (
    <AppLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
      </div>

      <div className={styles.tabBar}>
        {tabs.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              [styles.tabBtn, isActive && styles.tabBtnActive].filter(Boolean).join(' ')
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Outlet />
      </motion.div>
    </AppLayout>
  );
}
