import { useState, useCallback } from 'react';
import {
  handleQueryError,
  isRetryableError,
  getRetryDelay,
  logQueryError,
  ErrorHandlingResult,
} from '../utils/queryErrorHandling';

interface UseQueryErrorHandlingProps {
  maxRetries?: number;
  onError?: (error: ErrorHandlingResult) => void;
  onRetry?: (attemptNumber: number) => void;
}

interface UseQueryErrorHandlingReturn {
  error: ErrorHandlingResult | null;
  isRetrying: boolean;
  retryCount: number;
  handleError: (error: any, context?: any) => Promise<boolean>;
  clearError: () => void;
  retry: () => Promise<boolean>;
}

/**
 * Custom hook for handling query errors with retry logic
 */
export function useQueryErrorHandling({
  maxRetries = 3,
  onError,
  onRetry,
}: UseQueryErrorHandlingProps = {}): UseQueryErrorHandlingReturn {
  const [error, setError] = useState<ErrorHandlingResult | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<any>(null);
  const [lastContext, setLastContext] = useState<any>(null);

  const clearError = useCallback(() => {
    setError(null);
    setIsRetrying(false);
    setRetryCount(0);
    setLastError(null);
    setLastContext(null);
  }, []);

  const handleError = useCallback(async (
    error: any,
    context: any = {}
  ): Promise<boolean> => {
    // Log the error
    logQueryError(error, context);

    // Store error and context for potential retry
    setLastError(error);
    setLastContext(context);

    // Process the error
    const errorResult = handleQueryError(error);
    setError(errorResult);

    // Call error callback
    if (onError) {
      onError(errorResult);
    }

    // Check if we should auto-retry
    if (errorResult.shouldRetry && retryCount < maxRetries) {
      const delay = getRetryDelay(error, retryCount + 1);
      
      setIsRetrying(true);
      
      // Wait for the delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      setRetryCount(prev => prev + 1);
      setIsRetrying(false);

      // Call retry callback
      if (onRetry) {
        onRetry(retryCount + 1);
      }

      return true; // Indicate that a retry should be attempted
    }

    return false; // No retry
  }, [retryCount, maxRetries, onError, onRetry]);

  const retry = useCallback(async (): Promise<boolean> => {
    if (!lastError || retryCount >= maxRetries) {
      return false;
    }

    if (!isRetryableError(lastError)) {
      return false;
    }

    const delay = getRetryDelay(lastError, retryCount + 1);
    
    setIsRetrying(true);
    setError(null);
    
    // Wait for the delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    setRetryCount(prev => prev + 1);
    setIsRetrying(false);

    // Call retry callback
    if (onRetry) {
      onRetry(retryCount + 1);
    }

    return true;
  }, [lastError, retryCount, maxRetries, onRetry]);

  return {
    error,
    isRetrying,
    retryCount,
    handleError,
    clearError,
    retry,
  };
}