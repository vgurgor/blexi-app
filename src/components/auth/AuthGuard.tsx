'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { hasRole, getUserRole } from '@/lib/auth';
import PageLoader from '@/components/PageLoader';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated, user, checkAuth } = useAuthStore();

  // Public paths that don't require authentication
  const isPublicPath = 
    pathname === '/' || 
    pathname === '/auth/login' || 
    pathname === '/auth/forgot-password' || 
    pathname.startsWith('/auth/reset-password');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // If it's a public path and user is authenticated, redirect to dashboard
        if (isPublicPath && isAuthenticated) {
          router.replace('/dashboard');
          return;
        }

        // If path requires auth and user is not authenticated
        if (!isPublicPath && !isAuthenticated) {
          // First try to verify token - maybe we have a valid token but state is not updated
          const authenticated = await checkAuth();
          
          if (!authenticated) {
            // Save the original URL to redirect back after login
            const callbackUrl = encodeURIComponent(pathname);
            router.replace(`/auth/login?callbackUrl=${callbackUrl}`);
            return;
          }
        }

        // Role-based access control for specific paths
        if (isAuthenticated && user?.role) {
          const userRole = user.role;

          // Admin-only paths
          if (pathname.startsWith('/dashboard/settings') && 
              userRole !== 'super-admin' && 
              userRole !== 'admin') {
            router.replace('/dashboard');
            return;
          }

          // Manager or Admin paths
          if ((pathname.startsWith('/dashboard/companies') || 
               pathname.startsWith('/dashboard/reports')) && 
              !['super-admin', 'admin', 'manager'].includes(userRole)) {
            router.replace('/dashboard');
            return;
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth verification error:', error);
        router.replace('/auth/login');
      }
    };

    handleAuth();
  }, [pathname, isAuthenticated, router, checkAuth, user, isPublicPath]);

  if (loading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}