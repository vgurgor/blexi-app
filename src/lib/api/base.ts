import { getAuthToken } from '../auth';
import { ApiResponse, ApiErrorResponse } from '../../types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.blexi.co';
const API_TIMEOUT = 15000; // 15 seconds timeout

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Create an AbortController with timeout
 */
function createAbortController(timeoutMs: number): { controller: AbortController; timeoutId: NodeJS.Timeout } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
}

/**
 * Fetch API with proper error handling and timeout
 */
export async function fetchApi<T = any>(
  endpoint: string, 
  options: RequestInit = {},
  timeoutMs: number = API_TIMEOUT
): Promise<ApiResponse<T>> {
  const { controller, timeoutId } = createAbortController(timeoutMs);
  
  try {
    const token = getAuthToken();
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    // Clear the timeout since the request completed
    clearTimeout(timeoutId);

    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      return {
        status: response.status,
        success: false,
        error: data.message || 'API isteği başarısız oldu',
        data: null as T | undefined,
      };
    }

    return {
      status: response.status,
      success: true,
      data: data as T,
    };
  } catch (error) {
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // Handle fetch errors (network errors, timeouts, etc.)
    if (error instanceof Error) {
      const isAbortError = error.name === 'AbortError';
      
      return {
        status: isAbortError ? 408 : 500,
        success: false,
        error: isAbortError ? 'İstek zaman aşımına uğradı' : error.message,
      };
    }
    
    return {
      status: 500,
      success: false,
      error: 'Bilinmeyen bir hata oluştu',
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string, timeoutMs?: number) => 
    fetchApi<T>(endpoint, {}, timeoutMs),
  
  post: <T = any>(endpoint: string, body: any, timeoutMs?: number) => 
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }, timeoutMs),
  
  put: <T = any>(endpoint: string, body: any, timeoutMs?: number) => 
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }, timeoutMs),
  
  patch: <T = any>(endpoint: string, body: any, timeoutMs?: number) => 
    fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, timeoutMs),
  
  delete: <T = any>(endpoint: string, timeoutMs?: number) => 
    fetchApi<T>(endpoint, {
      method: 'DELETE',
    }, timeoutMs),
};

/**
 * Create a full error response object
 */
export function createErrorResponse(status: number, message: string, details?: Record<string, string[]>): ApiErrorResponse {
  return {
    message,
    code: status.toString(),
    details,
  };
}