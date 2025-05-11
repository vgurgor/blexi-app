import { redirect } from 'next/navigation';
import { isServerAuthenticated } from '@/lib/serverAuth';

export default function AuthRedirect() {
  // This component runs on the server
  const isAuthenticated = isServerAuthenticated();
  
  if (isAuthenticated) {
    redirect('/dashboard');
  } else {
    redirect('/auth/login');
  }
  
  // This return is never reached due to redirects
  return null;
}