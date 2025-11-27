import axios, { AxiosError } from "axios";
import type { ApiError } from "../types";

// ============================================
// API CONFIGURATION
// ============================================

/**
 * Base URL for your backend API.
 * This points to your ASP.NET Core backend.
 */
const API_BASE_URL = "https://localhost:7089/api";

/**
 * Create a configured axios instance.
 * All API calls will use this instance.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Timeout after 30 seconds
  timeout: 30000,
});

// ============================================
// REQUEST INTERCEPTOR
// (Runs BEFORE every HTTP request)
// ============================================

/**
 * Request interceptor - adds JWT token to all requests.
 */
api.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage (browser storage)
    const token = localStorage.getItem("token");

    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// (Runs AFTER every HTTP response)
// ============================================

/**
 * Response interceptor - handles errors globally.
 *
 * Success: Just return the response
 * Error: Handle common error scenarios
 */
api.interceptors.response.use(
  (response) => {
    // Success - log in development
    if (import.meta.env.DEV) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${
          response.status
        }`
      );
    }
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle errors globally

    // 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");

      // Redirect to login (unless already on login page)
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // 403 Forbidden - user doesn't have permission
    if (error.response?.status === 403) {
      console.error("❌ Access denied");
    }

    // 500 Server Error
    if (error.response?.status === 500) {
      console.error("❌ Server error:", error.response.data);
    }

    // Log all errors in development
    if (import.meta.env.DEV) {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to extract error message from API error response.
 *
 * @param error - Axios error object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;

    // Return detail if available
    if (apiError?.detail) {
      return apiError.detail;
    }

    // Return title if available
    if (apiError?.title) {
      return apiError.title;
    }

    // Return validation errors if available
    if (apiError?.errors) {
      const firstError = Object.values(apiError.errors)[0];
      if (firstError && firstError.length > 0) {
        return firstError[0];
      }
    }

    // Return generic HTTP error message
    return error.message || "An unexpected error occurred";
  }

  // Non-axios error
  return "An unexpected error occurred";
}

export default api;
