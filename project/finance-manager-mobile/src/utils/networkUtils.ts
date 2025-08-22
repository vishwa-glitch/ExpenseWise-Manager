import NetInfo from '@react-native-community/netinfo';
import { DeviceEventEmitter } from 'react-native';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export class NetworkUtils {
  private static instance: NetworkUtils;
  private networkState: NetworkState = {
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
  };
  private listeners: ((state: NetworkState) => void)[] = [];

  private constructor() {
    this.initialize();
  }

  public static getInstance(): NetworkUtils {
    if (!NetworkUtils.instance) {
      NetworkUtils.instance = new NetworkUtils();
    }
    return NetworkUtils.instance;
  }

  private initialize() {
    // Subscribe to network state changes
    NetInfo.addEventListener(state => {
      const newState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      };

      const wasConnected = this.networkState.isConnected;
      this.networkState = newState;

      // Notify listeners
      this.listeners.forEach(listener => listener(newState));

      // Log network state changes
      console.log('Network state changed:', newState);

      // Handle reconnection
      if (!wasConnected && newState.isConnected) {
        console.log('Network reconnected - triggering data refresh');
        this.handleReconnection();
      }
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      this.networkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      };
    });
  }

  public getCurrentState(): NetworkState {
    return { ...this.networkState };
  }

  public isOnline(): boolean {
    return this.networkState.isConnected && this.networkState.isInternetReachable;
  }

  public addListener(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private handleReconnection() {
    // Trigger a custom event that components can listen to
    // This could be used to refresh data when connection is restored
    DeviceEventEmitter.emit('networkReconnected');
  }

  public async checkConnectivity(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected && state.isInternetReachable;
    } catch (error) {
      console.error('Error checking connectivity:', error);
      return false;
    }
  }
}

// Exponential backoff utility for retry mechanisms
export class RetryUtils {
  public static async withExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 10000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check network connectivity before attempting
        const networkUtils = NetworkUtils.getInstance();
        if (!networkUtils.isOnline()) {
          throw new Error('No internet connection');
        }

        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        
        console.log(`Retry attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms:`, error);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  public static getErrorType(error: any): 'network' | 'auth' | 'server' | 'client' | 'unknown' {
    if (!error) return 'unknown';

    const message = error.message?.toLowerCase() || '';
    const status = error.response?.status;

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }

    // HTTP status codes
    if (status) {
      if (status === 401 || status === 403) return 'auth';
      if (status >= 500) return 'server';
      if (status >= 400) return 'client';
    }

    return 'unknown';
  }

  public static shouldRetry(error: any): boolean {
    const errorType = this.getErrorType(error);
    const status = error.response?.status;

    // Retry network errors
    if (errorType === 'network') return true;

    // Retry server errors (5xx)
    if (errorType === 'server') return true;

    // Retry specific client errors
    if (status === 408 || status === 429) return true; // Timeout or Rate Limited

    // Don't retry auth errors or other client errors
    return false;
  }
}

// Hook for using network state in components
export const useNetworkState = () => {
  const [networkState, setNetworkState] = React.useState<NetworkState>(() => 
    NetworkUtils.getInstance().getCurrentState()
  );

  React.useEffect(() => {
    const networkUtils = NetworkUtils.getInstance();
    const unsubscribe = networkUtils.addListener(setNetworkState);
    
    return unsubscribe;
  }, []);

  return networkState;
};

// React import for the hook
import React from 'react';