import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminRoute from './AdminRoute.jsx';
import GuestRoute from './GuestRoute.jsx';

// Public / auth
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import SignupPage from '../pages/auth/SignupPage.jsx';

// App pages
import DashboardPage from '../pages/DashboardPage.jsx';
import ScoresPage from '../pages/ScoresPage.jsx';
import CharitiesPage from '../pages/CharitiesPage.jsx';
import CharityProfilePage from '../pages/CharityProfilePage.jsx';
import DrawsPage from '../pages/DrawsPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';

// Subscription
import PricingPage from '../pages/subscription/PricingPage.jsx';
import SubscriptionSuccessPage from '../pages/subscription/SubscriptionSuccessPage.jsx';
import SubscriptionManagePage from '../pages/subscription/SubscriptionManagePage.jsx';

// Admin
import AdminPage from '../pages/admin/AdminPage.jsx';
import AdminDrawsPage from '../pages/admin/AdminDrawsPage.jsx';
import AdminWinnersPage from '../pages/admin/AdminWinnersPage.jsx';
import AdminCharitiesPage from '../pages/admin/AdminCharitiesPage.jsx';
import AdminUsersPage from '../pages/admin/AdminUsersPage.jsx';
import AdminSubscriptionsPage from '../pages/admin/AdminSubscriptionsPage.jsx';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage.jsx';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"      element={<GuestRoute><HomePage /></GuestRoute>} />
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected app */}
      <Route path="/dashboard"            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/scores"               element={<ProtectedRoute><ScoresPage /></ProtectedRoute>} />
      <Route path="/charities"            element={<ProtectedRoute><CharitiesPage /></ProtectedRoute>} />
      <Route path="/charities/:id"        element={<ProtectedRoute><CharityProfilePage /></ProtectedRoute>} />
      <Route path="/draws"                element={<ProtectedRoute><DrawsPage /></ProtectedRoute>} />
      <Route path="/profile"              element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Subscription */}
      <Route path="/pricing"              element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
      <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccessPage /></ProtectedRoute>} />
      <Route path="/subscription/manage"  element={<ProtectedRoute><SubscriptionManagePage /></ProtectedRoute>} />

      {/* Admin — nested routes */}
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>}>
        <Route index element={<Navigate to="draws" replace />} />
        <Route path="draws"     element={<AdminDrawsPage />} />
        <Route path="winners"   element={<AdminWinnersPage />} />
        <Route path="charities" element={<AdminCharitiesPage />} />
        <Route path="users"         element={<AdminUsersPage />} />
        <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
        <Route path="analytics"     element={<AdminAnalyticsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
