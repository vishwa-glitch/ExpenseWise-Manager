import { RetryUtils } from './networkUtils';

export interface ErrorInfo {
  type: 'network' | 'auth' | 'server' | 'client' | 'validation' | 'unknown';
  message: string;
  userMessage: string;
  shouldRetry: boolean;
  statusCode?: number;
  originalError: any;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ timestamp: string; error: ErrorInfo }> = [];

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: any, context?: string): ErrorInfo {
    const errorInfo = this.parseError(error);
    
    // Log the error
    this.logError(errorInfo, context);
    
    return errorInfo;
  }

  private parseError(error: any): ErrorInfo {
    if (!error) {
      return {
        type: 'unknown',
        message: 'Unknown error occurred',
        userMessage: 'An unexpected error occurred. Please try again.',
        shouldRetry: false,
        originalError: error,
      };
    }

    const message = error.message || error.toString();
    const status = error.response?.status;
    const data = error.response?.data;

    // Network errors
    if (message.includes('Network Error') || message.includes('fetch') || message.includes('timeout')) {
      return {
        type: 'network',
        message,
        userMessage: 'Network connection issue. Please check your internet connection and try again.',
        shouldRetry: true,
        originalError: error,
      };
    }

    // Authentication errors
    if (status === 401) {
      return {
        type: 'auth',
        message: data?.message || 'Unauthorized',
        userMessage: 'Your session has expired. Please log in again.',
        shouldRetry: false,
        statusCode: status,
        originalError: error,
      };
    }

    if (status === 403) {
      return {
        type: 'auth',
        message: data?.message || 'Forbidden',
        userMessage: 'You don\'t have permission to access this resource.',
        shouldRetry: false,
        statusCode: status,
        originalError: error,
      };
    }

    // Client errors
    if (status === 400) {
      return {
        type: 'validation',
        message: data?.message || 'Bad Request',
        userMessage: data?.message || 'Please check your input and try again.',
        shouldRetry: false,
        statusCode: status,
        originalError: error,
      };
    }

    if (status === 404) {
      return {
        type: 'client',
        message: data?.message || 'Not Found',
        userMessage: 'The requested data could not be found.',
        shouldRetry: false,
        statusCode: status,
        originalError: error,
      };
    }

    if (status === 408) {
      return {
        type: 'network',
        message: 'Request Timeout',
        userMessage: 'The request took too long. Please try again.',
        shouldRetry: true,
        statusCode: status,
        originalError: error,
      };
    }

    if (status === 429) {
      return {
        type: 'client',
        message: 'Too Many Requests',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        shouldRetry: true,
        statusCode: status,
        originalError: error,
      };
    }

    // Server errors
    if (status >= 500) {
      return {
        type: 'server',
        message: data?.message || 'Internal Server Error',
        userMessage: 'Server error. Please try again later.',
        shouldRetry: true,
        statusCode: status,
        originalError: error,
      };
    }

    // Other client errors
    if (status >= 400) {
      return {
        type: 'client',
        message: data?.message || message,
        userMessage: data?.message || 'An error occurred. Please try again.',
        shouldRetry: false,
        statusCode: status,
        originalError: error,
      };
    }

    // Generic error
    return {
      type: 'unknown',
      message,
      userMessage: 'An unexpected error occurred. Please try again.',
      shouldRetry: RetryUtils.shouldRetry(error),
      originalError: error,
    };
  }

  private logError(errorInfo: ErrorInfo, context?: string) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: errorInfo,
      context,
    };

    // Add to in-memory log
    this.errorLog.push(logEntry);

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    // Console log for development
    console.error('Error logged:', logEntry);

    // In production, you would send this to a logging service
    // this.sendToLoggingService(logEntry);
  }

  public getErrorLog(): Array<{ timestamp: string; error: ErrorInfo }> {
    return [...this.errorLog];
  }

  public clearErrorLog() {
    this.errorLog = [];
  }

  // Helper method to create user-friendly error messages for specific scenarios
  public getScenarioErrorMessage(scenario: string, error: any): string {
    const errorInfo = this.parseError(error);

    switch (scenario) {
      case 'budget_fetch':
        if (errorInfo.type === 'network') {
          return 'Unable to load budget data. Please check your connection.';
        }
        if (errorInfo.type === 'server') {
          return 'Budget service is temporarily unavailable. Please try again later.';
        }
        return 'Unable to load budget information. Please try again.';

      case 'weekly_health':
        if (errorInfo.type === 'network') {
          return 'Unable to load financial health data. Please check your connection.';
        }
        if (errorInfo.statusCode === 404) {
          return 'Financial health data is not available yet. Add more transactions to see insights.';
        }
        return 'Unable to calculate financial health. Please try again.';

      case 'data_sync':
        if (errorInfo.type === 'network') {
          return 'Unable to sync data. Your changes will be saved when connection is restored.';
        }
        return 'Data sync failed. Please try again.';

      default:
        return errorInfo.userMessage;
    }
  }
}

// Utility function for handling async operations with error handling
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  context?: string,
  maxRetries: number = 3
): Promise<{ data?: T; error?: ErrorInfo }> {
  const errorHandler = ErrorHandler.getInstance();

  try {
    const data = await RetryUtils.withExponentialBackoff(operation, maxRetries);
    return { data };
  } catch (error) {
    const errorInfo = errorHandler.handleError(error, context);
    return { error: errorInfo };
  }
}

// React hook for error handling in components
export const useErrorHandler = () => {
  const errorHandler = ErrorHandler.getInstance();

  const handleError = React.useCallback((error: any, context?: string) => {
    return errorHandler.handleError(error, context);
  }, [errorHandler]);

  const getScenarioErrorMessage = React.useCallback((scenario: string, error: any) => {
    return errorHandler.getScenarioErrorMessage(scenario, error);
  }, [errorHandler]);

  return {
    handleError,
    getScenarioErrorMessage,
  };
};

// React import for the hook
import React from 'react';