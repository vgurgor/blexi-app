import AuthRedirect from '@/components/auth/AuthRedirect';

export default async function HomePage() {
  // With 'use server' in AuthRedirect, we can't use it as a component
  // Instead, we call it as a server function
  await AuthRedirect();

  // This will never be rendered due to the redirect
  return null;
}