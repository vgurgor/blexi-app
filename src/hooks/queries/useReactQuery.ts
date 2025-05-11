import { useCallback } from 'react';
import { useToast } from '../useToast';
import { ApiResponse } from '../../types/api';

interface UseReactQueryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function useReactQuery<T = any>(options?: UseReactQueryOptions<T>) {
  const toast = useToast();

  const handleApiResponse = useCallback(
    async <R = T>(
      apiCall: () => Promise<ApiResponse<R>>,
      callOptions?: UseReactQueryOptions<R>
    ): Promise<R | null> => {
      try {
        const mergedOptions = { ...options, ...callOptions };
        const response = await apiCall();

        if (response.success && response.data) {
          if (mergedOptions.showSuccessToast && mergedOptions.successMessage) {
            toast.success(mergedOptions.successMessage);
          }
          
          mergedOptions.onSuccess?.(response.data as any);
          return response.data;
        } else {
          const errorMessage = response.error || 'Bir hata oluştu';
          
          if (mergedOptions.showErrorToast) {
            toast.error(mergedOptions.errorMessage || errorMessage);
          }
          
          mergedOptions.onError?.(errorMessage);
          return null;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu';
        
        if (options?.showErrorToast) {
          toast.error(options.errorMessage || errorMessage);
        }
        
        options?.onError?.(errorMessage);
        return null;
      }
    },
    [options, toast]
  );

  return {
    handleApiResponse,
  };
}