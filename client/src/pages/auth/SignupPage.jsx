import AuthLayout from '../../components/layout/AuthLayout.jsx';
import SignupForm from '../../features/auth/SignupForm.jsx';

export default function SignupPage() {
  return (
    <AuthLayout title="Join GolfGives" subtitle="Create your free account in under a minute">
      <SignupForm />
    </AuthLayout>
  );
}
