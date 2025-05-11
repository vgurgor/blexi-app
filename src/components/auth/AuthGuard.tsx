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
        // In case the Zustand store hasn't hydrated yet, manually try to read from localStorage
        if (!isAuthenticated && !isPublicPath && typeof window !== 'undefined') {
          console.log('Checking auth state on path:', pathname);

          // Try to get auth data from localStorage
          try {
            const storedAuth = localStorage.getItem('blexi-auth-storage');
            if (storedAuth) {
              const parsedAuth = JSON.parse(storedAuth);
              console.log('Found stored auth data:', {
                hasToken: !!parsedAuth?.state?.token,
                isAuthenticated: !!parsedAuth?.state?.isAuthenticated
              });

              // If we have stored auth data but Zustand isn't hydrated, manually rehydrate
              if (parsedAuth?.state?.token && parsedAuth?.state?.isAuthenticated) {
                useAuthStore.persist.rehydrate();
              }
            }
          } catch (e) {
            console.error('Error reading from localStorage:', e);
          }
        }

        // If it's a public path and user is authenticated, redirect to dashboard
        if (isPublicPath && isAuthenticated) {
          router.replace('/dashboard');
          return;
        }

        // If path requires auth and user is not authenticated
        if (!isPublicPath && !isAuthenticated) {
          console.log('Auth needed but not authenticated, checking token...');
          // First try to verify token - maybe we have a valid token but state is not updated
          const authenticated = await checkAuth();

          if (!authenticated) {
            console.log('Token verification failed, redirecting to login');
            // Save the original URL to redirect back after login
            const callbackUrl = encodeURIComponent(pathname);
            router.replace(`/auth/login?callbackUrl=${callbackUrl}`);
            return;
          } else {
            console.log('Token verification succeeded');
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