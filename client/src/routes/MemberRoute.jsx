import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import styles from './RouteLoader.module.scss';

export default function MemberRoute({ children }) {
  const { user, profile, loading } = useAuthStore();

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.spinner} />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;

  return children;
}
