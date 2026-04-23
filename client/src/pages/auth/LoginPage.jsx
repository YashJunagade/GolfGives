import AuthLayout from '../../components/layout/AuthLayout.jsx';
import LoginForm from '../../features/auth/LoginForm.jsx';

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your journey">
      <LoginForm />
    </AuthLayout>
  );
}
