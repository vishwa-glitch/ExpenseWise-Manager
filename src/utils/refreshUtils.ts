import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchBudgetStatus } from '../store/slices/budgetsSlice';
import { fetchWeeklyHealth, fetchDashboardInsights } from '../store/slices/analyticsSlice';

export interface RefreshConfig {
  enabled: boolean;
  interval?: number; // in milliseconds
  onAppForeground?: boolean;
  onNetworkReconnect?: boolean;
}

export class RefreshManager {
  private static instance: RefreshManager;
  private refreshCallbacks: Map<string, () => void> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private appStateSubscription: any = null;

  private constructor() {
    this.setupAppStateListener();
  }

  public static getInstance(): RefreshManager {
    if (!RefreshManager.instance) {
      RefreshManager.instance = new RefreshManager();
    }
    return RefreshManager.instance;
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      console.log('App became active - triggering foreground refresh');
      this.triggerForegroundRefresh();
    }
  };

  private triggerForegroundRefresh() {
    this.refreshCallbacks.forEach((callback, key) => {
      console.log(`Triggering foreground refresh for: ${key}`);
      callback();
    });
  }

  public registerRefreshCallback(key: string, callback: () => void, config: RefreshConfig) {
    this.refreshCallbacks.set(key, callback);

    // Set up interval if specified
    if (config.enabled && config.interval) {
      this.clearInterval(key);
      const intervalId = setInterval(() => {
        console.log(`Triggering interval refresh for: ${key}`);
        callback();
      }, config.interval);
      this.intervals.set(key, intervalId);
    }
  }

  public unregisterRefreshCallback(key: string) {
    this.refreshCallbacks.delete(key);
    this.clearInterval(key);
  }

  private clearInterval(key: string) {
    const intervalId = this.intervals.get(key);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(key);
    }
  }

  public triggerRefresh(key?: string) {
    if (key) {
      const callback = this.refreshCallbacks.get(key);
      if (callback) {
        callback();
      }
    } else {
      // Trigger all registered refreshes
      this.refreshCallbacks.forEach((callback, callbackKey) => {
        console.log(`Triggering manual refresh for: ${callbackKey}`);
        callback();
      });
    }
  }

  public cleanup() {
    // Clear all intervals
    this.intervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.intervals.clear();
    this.refreshCallbacks.clear();

    // Remove app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

// Hook for automatic refresh functionality
export const useAutoRefresh = (
  key: string,
  refreshCallback: () => void,
  config: RefreshConfig = { enabled: true, onAppForeground: true }
) => {
  const refreshManager = RefreshManager.getInstance();

  useEffect(() => {
    if (config.enabled) {
      refreshManager.registerRefreshCallback(key, refreshCallback, config);
    }

    return () => {
      refreshManager.unregisterRefreshCallback(key);
    };
  }, [key, refreshCallback, config.enabled, config.interval]);

  const triggerManualRefresh = useCallback(() => {
    refreshManager.triggerRefresh(key);
  }, [key, refreshManager]);

  return { triggerManualRefresh };
};

// Hook for pull-to-refresh functionality
export const usePullToRefresh = (refreshCallback: () => Promise<void>) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCallback();
    } catch (error) {
      console.error('Pull to refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshCallback]);

  return { refreshing, onRefresh };
};

// Hook for dashboard data refresh
export const useDashboardRefresh = () => {
  const dispatch = useAppDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Refresh all dashboard data
      await Promise.all([
        dispatch(fetchBudgetStatus()),
        dispatch(fetchWeeklyHealth()),
        dispatch(fetchDashboardInsights()),
      ]);
    } catch (error) {
      console.error('Dashboard refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]);

  // Set up automatic refresh
  useAutoRefresh(
    'dashboard',
    refreshDashboardData,
    {
      enabled: true,
      interval: 5 * 60 * 1000, // 5 minutes
      onAppForeground: true,
      onNetworkReconnect: true,
    }
  );

  // Set up pull-to-refresh
  const { refreshing: pullRefreshing, onRefresh: onPullRefresh } = usePullToRefresh(refreshDashboardData);

  return {
    isRefreshing: isRefreshing || pullRefreshing,
    refreshDashboardData,
    onPullRefresh,
  };
};

// Hook for listening to data changes and triggering updates
export const useDataChangeListener = () => {
  const dispatch = useAppDispatch();

  const handleBudgetChange = useCallback(() => {
    console.log('Budget data changed - refreshing related components');
    dispatch(fetchBudgetStatus());
    dispatch(fetchWeeklyHealth()); // Weekly health depends on budget data
  }, [dispatch]);

  const handleTransactionChange = useCallback(() => {
    console.log('Transaction data changed - refreshing related components');
    dispatch(fetchBudgetStatus()); // Budget status depends on spending
    dispatch(fetchWeeklyHealth()); // Weekly health depends on transactions
    dispatch(fetchDashboardInsights()); // Dashboard insights depend on transactions
  }, [dispatch]);

  const handleGoalChange = useCallback(() => {
    console.log('Goal data changed - refreshing related components');
    dispatch(fetchWeeklyHealth()); // Weekly health includes goal progress
    dispatch(fetchDashboardInsights()); // Dashboard insights include goal info
  }, [dispatch]);

  return {
    handleBudgetChange,
    handleTransactionChange,
    handleGoalChange,
  };
};

// Utility for smooth animations during updates
export const useUpdateAnimation = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startUpdateAnimation = useCallback(() => {
    setIsUpdating(true);
    
    // Clear existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // Set timeout to end animation
    animationTimeoutRef.current = setTimeout(() => {
      setIsUpdating(false);
    }, 300); // 300ms animation duration
  }, []);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return { isUpdating, startUpdateAnimation };
};