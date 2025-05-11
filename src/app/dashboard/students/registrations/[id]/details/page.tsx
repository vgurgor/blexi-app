'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/atoms/LoadingSpinner';

export default function RegistrationDetailsRedirectPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main registration details page
    router.replace(`/dashboard/students/registrations/${params.id}`);
  }, [router, params.id]);

  return <LoadingSpinner size="md" fullScreen />;
}