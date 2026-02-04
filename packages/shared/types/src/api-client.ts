/**
 * Shared API request wrapper with error handling and retry logic
 */

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 2;
const RETRY_DELAY = 1000;

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Shared API request handler with retry logic
 */
export async function makeApiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    headers = {}
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: unknown = await response.json();

      if (!data || typeof data !== 'object') {
        return {
          success: true,
          data: data as T,
          message: 'Request successful'
        };
      }

      return {
        success: true,
        data: data as T,
        message: (data as { message?: string }).message || 'Request successful'
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on abort timeout
      if (error instanceof Error && error.name === 'AbortError') {
        break;
      }

      // Retry on network errors or 5xx status codes
      if (attempt < retries) {
        await delay(RETRY_DELAY * (attempt + 1));
        continue;
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Request failed',
    message: `Request failed: ${lastError?.message || 'Unknown error'}`
  };
}

/**
 * GET request wrapper
 */
export async function get<T = unknown>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, 'method'>
): Promise<ApiResponse<T>> {
  return makeApiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request wrapper
 */
export async function post<T = unknown>(
  endpoint: string,
  body: unknown,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return makeApiRequest<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * PUT request wrapper
 */
export async function put<T = unknown>(
  endpoint: string,
  body: unknown,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return makeApiRequest<T>(endpoint, { ...options, method: 'PUT', body });
}

/**
 * DELETE request wrapper
 */
export async function del<T = unknown>(
  endpoint: string,
  options?: Omit<ApiRequestOptions, 'method'>
): Promise<ApiResponse<T>> {
  return makeApiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}

/**
 * PATCH request wrapper
 */
export async function patch<T = unknown>(
  endpoint: string,
  body: unknown,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return makeApiRequest<T>(endpoint, { ...options, method: 'PATCH', body });
}
