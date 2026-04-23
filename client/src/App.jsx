import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter.jsx';
import { useAuthInit } from './hooks/useAuth.js';

function AppContent() {
  useAuthInit();
  return <AppRouter />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
