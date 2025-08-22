/**
 * Error handling utilities for enhanced transaction queries
 */

export interface QueryError {
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
}

export interface ErrorHandlingResult {
  userMessage: string;
  shouldRetry: boolean;
  fallbackAction?: 'clear_filters' | 'simplify_query' | 'use_cache';
  technicalDetails?: string;
}

/**
 * Map API error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_DATE_RANGE: 'Please select a valid date range',
  INVALID_AMOUNT_RANGE: 'Please enter valid amount values',
  TOO_MANY_RESULTS: 'Too many results found. Please refine your filters',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  TIMEOUT_ERROR: 'Request timed out. Please try again',
  INVALID_SEARCH_QUERY: 'Invalid search query. Please check your search terms',
  INVALID_CATEGORY_FILTER: 'Invalid category selection. Please try again',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again',
  UNAUTHORIZED: 'Session expired. Please log in again',
  FORBIDDEN: 'You do not have permission to access this data',
  NOT_FOUND: 'Requested data not found',
  VALIDATION_ERROR: 'Invalid filter parameters. Please check your selections',
  DATABASE_ERROR: 'Database error. Please try again later',
  CACHE_ERROR: 'Cache error. Data may be outdated',
};

/**
 * Handle query errors and provide user-friendly feedback
 */
export function handleQueryError(error: any): ErrorHandlingResult {
  console.error('Query error:', error);

  // Extract error information
  const errorCode = error?.response?.data?.code || error?.code || 'UNKNOWN_ERROR';
  const errorMessage = error?.response?.data?.message || error?.message;
  const statusCode = error?.response?.status;

  // Determine if error is retryable
  const retryableErrors = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'SERVER_ERROR',
    'DATABASE_ERROR',
    'RATE_LIMIT_EXCEEDED',
  ];
  const shouldRetry = retryableErrors.includes(errorCode) || 
                     (statusCode >= 500 && statusCode < 600);

  // Get user-friendly message
  let userMessage = ERROR_MESSAGES[errorCode] || 'An unexpected error occurred';

  // Handle specific error cases
  switch (errorCode) {
    case 'INVALID_DATE_RANGE':
      return {
        userMessage,
        shouldRetry: false,
        fallbackAction: 'clear_filters',
        technicalDetails: 'Date range validation failed',
      };

    case 'INVALID_AMOUNT_RANGE':
      return {
        userMessage,
        shouldRetry: false,
        fallbackAction: 'clear_filters',
        technicalDetails: 'Amount range validation failed',
      };

    case 'TOO_MANY_RESULTS':
      return {
        userMessage: 'Too many results. Try adding more specific filters',
        shouldRetry: false,
        fallbackAction: 'simplify_query',
        technicalDetails: 'Result set exceeds maximum limit',
      };

    case 'NETWORK_ERROR':
    case 'TIMEOUT_ERROR':
      return {
        userMessage: 'Connection problem. Please check your internet and try again',
        shouldRetry: true,
        fallbackAction: 'use_cache',
        technicalDetails: `Network error: ${errorMessage}`,
      };

    case 'RATE_LIMIT_EXCEEDED':
      return {
        userMessage: 'Too many requests. Please wait 30 seconds and try again',
        shouldRetry: true,
        technicalDetails: 'API rate limit exceeded',
      };

    case 'UNAUTHORIZED':
      return {
        userMessage: 'Your session has expired. Please log in again',
        shouldRetry: false,
        technicalDetails: 'Authentication token expired or invalid',
      };

    case 'SERVER_ERROR':
    case 'DATABASE_ERROR':
      return {
        userMessage: 'Server error. Our team has been notified. Please try again later',
        shouldRetry: true,
        fallbackAction: 'use_cache',
        technicalDetails: `Server error: ${errorMessage}`,
      };

    default:
      // Handle HTTP status codes
      if (statusCode) {
        switch (statusCode) {
          case 400:
            userMessage = 'Invalid request. Please check your filter settings';
            break;
          case 401:
            userMessage = 'Please log in to continue';
            break;
          case 403:
            userMessage = 'Access denied. You may not have permission for this action';
            break;
          case 404:
            userMessage = 'Data not found. It may have been deleted or moved';
            break;
          case 429:
            userMessage = 'Too many requests. Please wait and try again';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            userMessage = 'Server error. Please try again later';
            break;
          default:
            userMessage = `Error ${statusCode}: ${errorMessage || 'Unknown error'}`;
        }
      }

      return {
        userMessage,
        shouldRetry,
        fallbackAction: shouldRetry ? 'use_cache' : undefined,
        technicalDetails: `${errorCode}: ${errorMessage}`,
      };
  }
}

/**
 * Create a standardized error object
 */
export function createQueryError(
  code: string,
  message: string,
  details?: any,
  retryable = false
): QueryError {
  return {
    code,
    message,
    details,
    retryable,
  };
}

/**
 * Check if an error is a network-related error
 */
export function isNetworkError(error: any): boolean {
  const networkErrorCodes = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'ECONNABORTED',
    'ENOTFOUND',
    'ECONNREFUSED',
  ];

  const errorCode = error?.code || error?.response?.data?.code;
  return networkErrorCodes.includes(errorCode) || !navigator.onLine;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  const retryableErrors = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'SERVER_ERROR',
    'DATABASE_ERROR',
    'RATE_LIMIT_EXCEEDED',
  ];

  const errorCode = error?.code || error?.response?.data?.code;
  const statusCode = error?.response?.status;

  return retryableErrors.includes(errorCode) || 
         (statusCode >= 500 && statusCode < 600);
}

/**
 * Get retry delay based on error type
 */
export function getRetryDelay(error: any, attemptNumber: number): number {
  const errorCode = error?.code || error?.response?.data?.code;

  switch (errorCode) {
    case 'RATE_LIMIT_EXCEEDED':
      return 30000; // 30 seconds
    case 'NETWORK_ERROR':
    case 'TIMEOUT_ERROR':
      return Math.min(1000 * Math.pow(2, attemptNumber), 10000); // Exponential backoff, max 10s
    case 'SERVER_ERROR':
    case 'DATABASE_ERROR':
      return 5000; // 5 seconds
    default:
      return 2000; // 2 seconds default
  }
}

/**
 * Log error for debugging and monitoring
 */
export function logQueryError(error: any, context: any = {}): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: {
      code: error?.code || error?.response?.data?.code,
      message: error?.message || error?.response?.data?.message,
      status: error?.response?.status,
      stack: error?.stack,
    },
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.error('Query Error:', errorInfo);

  // In a production app, you would send this to your error tracking service
  // Example: Sentry.captureException(error, { extra: errorInfo });
}