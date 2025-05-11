import AuthRedirect from '@/components/auth/AuthRedirect';

export default function HomePage() {
  // The AuthRedirect component will handle checking cookies
  // and performing redirects on the server
  return <AuthRedirect />;
}