import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Route all API calls through the Next.js /backend rewrite proxy.
// This avoids CORS, mixed-content, and mobile connectivity issues:
//   browser → /backend/* (same-origin) → Next.js server → actual API
// The rewrite is configured in next.config.ts:
//   source: '/backend/:path*', destination: `${NEXT_PUBLIC_API_URL}/:path*`
const API_BASE_URL = '/backend';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Shared refresh promise — prevents concurrent refresh race conditions
let refreshPromise: Promise<string | null> | null = null;

function redirectToLogin() {
  if (globalThis.window !== undefined && globalThis.location.pathname !== '/login') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Clear the Zustand persisted auth state so the next page load starts clean
    localStorage.removeItem('trodec-auth');
    globalThis.location.href = '/login';
  }
}

async function getNewAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      const { session } = response.data.data;
      if (!session) return null;

      localStorage.setItem('accessToken', session.accessToken);
      localStorage.setItem('refreshToken', session.refreshToken);
      return session.accessToken as string;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Response interceptor — refresh token on 401, retry once
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await getNewAccessToken();
      if (newToken) {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      }

      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

// API response types - standardized format: { success, message, data }
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper to extract error message
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.message || axiosError.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export default api;
