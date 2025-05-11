import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function HomePage() {
  // Check for auth token in cookies before redirecting
  const cookieStore = cookies();
  const hasAuthCookie = cookieStore.has('auth_token');

  if (hasAuthCookie) {
    redirect('/dashboard');
  } else {
    redirect('/auth/login');
  }
}