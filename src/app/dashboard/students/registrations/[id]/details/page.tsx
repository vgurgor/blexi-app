'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RegistrationDetailsRedirectPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main registration details page
    router.replace(`/dashboard/students/registrations/${params.id}`);
  }, [router, params.id]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}