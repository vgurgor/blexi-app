import { useState, useCallback } from 'react';
import { ApiResponse, ApiErrorResponse } from '../types/api';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiErrorResponse | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiErrorResponse) => void;
}

export function useApi<T = any>(options?: UseApiOptions) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiPromise: Promise<ApiResponse<T>>) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await apiPromise;
        
        if (!response.success) {
          const error = { 
            message: response.error || 'Something went wrong', 
            code: response.status.toString() 
          };
          setState((prev) => ({ ...prev, isLoading: false, error }));
          options?.onError?.(error);
          return null;
        }
        
        setState((prev) => ({ 
          ...prev, 
          data: response.data || null, 
          isLoading: false 
        }));
        
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (err) {
        const error = { 
          message: err instanceof Error ? err.message : 'Something went wrong' 
        };
        setState((prev) => ({ ...prev, isLoading: false, error }));
        options?.onError?.(error);
        return null;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}