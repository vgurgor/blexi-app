'use client';

import { Suspense, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// This component ensures that children are only rendered on the client
// and properly wrapped in a Suspense boundary
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

// This is a specialized component for handling useSearchParams
export function SearchParamsProvider({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={<div className="p-4">Loading...</div>}>
      {children}
    </ClientOnly>
  );
}