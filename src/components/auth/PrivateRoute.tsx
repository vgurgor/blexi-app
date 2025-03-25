'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { hasRole } from '@/lib/auth';
import PageLoader from '@/components/PageLoader';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRoles?: string | string[];
  redirectTo?: string;
}

/**
 * A component that restricts access to authenticated users with specific roles
 */
export default function PrivateRoute({
  children,
  requiredRoles,
  redirectTo = '/auth/login',
}: PrivateRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        if (!isAuthenticated) {
          // If not authenticated, check if we have a valid token
          const authenticated = await checkAuth();
          if (!authenticated) {
            router.push(redirectTo);
            return;
          }
        }

        // If roles are required, check if user has the required role
        if (requiredRoles && !hasRole(requiredRoles)) {
          router.push('/dashboard');
          return;
        }

        setChecking(false);
      } catch (error) {
        console.error('Auth verification error:', error);
        router.push(redirectTo);
      }
    };

    verify();
  }, [isAuthenticated, checkAuth, requiredRoles, router, redirectTo]);

  if (isLoading || checking) {
    return <PageLoader />;
  }

  return <>{children}</>;
}