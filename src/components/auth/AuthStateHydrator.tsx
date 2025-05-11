'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthStateHydrator() {
  // Hydrate auth store on initial load
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    
    // Debug
    const authState = useAuthStore.getState();
    console.log('Auth state hydrated:', {
      isAuthenticated: authState.isAuthenticated,
      hasToken: !!authState.token,
    });
  }, []);

  // This component doesn't render anything
  return null;
}