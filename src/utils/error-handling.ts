import { ApiErrorResponse } from '../types/api';

/**
 * Convert API error to a user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  
  // Handle ApiErrorResponse type
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as ApiErrorResponse).message;
  }
  
  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Default error message
  return 'An unknown error occurred';
}

/**
 * Log error to monitoring service
 * TODO: Implement actual error logging service (e.g., Sentry)
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  // For now, just log to console
  console.error('Error:', error);
  
  if (context) {
    console.error('Context:', context);
  }
  
  // In the future, this would send to Sentry or other error monitoring service
}

/**
 * Create a consistent error object
 */
export function createErrorObject(message: string, code?: string, details?: Record<string, string[]>): ApiErrorResponse {
  return {
    message,
    code,
    details,
  };
}