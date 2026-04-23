import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import styles from './RouteLoader.module.scss';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.spinner} />
    </div>
  );

  return user ? children : <Navigate to="/login" replace />;
}
