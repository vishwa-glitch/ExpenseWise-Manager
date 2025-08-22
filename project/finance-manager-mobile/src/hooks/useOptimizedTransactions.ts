import { useCallback, useEffect, useState, useMemo } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useTypedSelector } from './useTypedSelector';
import { fetchTransactions } from '../store/slices/transactionsSlice';
import { useQueryCache } from './useQueryCache';

interface UseOptimizedTransactionsProps {
  queryParams: any;
  enabled?: boolean;
}

interface UseOptimizedTransactionsReturn {
  transactions: any[];
  pagination: any;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  canLoadMore: boolean;
}

/**
 * Custom hook for optimized transaction loading with caching
 */
export function useOptimizedTransactions({
  queryParams,
  enabled = true,
}: UseOptimizedTransactionsProps): UseOptimizedTransactionsReturn {
  const dispatch = useAppDispatch();
  const { transactions, pagination, isLoading, error } = useTypedSelector(
    (state) => state.transactions
  );
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const { getCachedData, setCachedData, hasCachedData } = useQueryCache();

  // Memoize query parameters to prevent unnecessary re-renders
  const memoizedParams = useMemo(() => queryParams, [JSON.stringify(queryParams)]);

  // Check if we can load more data
  const canLoadMore = useMemo(() => {
    return pagination && currentPage < pagination.pages && !isLoading && !isLoadingMore;
  }, [pagination, currentPage, isLoading, isLoadingMore]);

  // Load transactions with caching
  const loadTransactions = useCallback(async (page = 1, reset = true) => {
    if (!enabled) return;

    const params = { ...memoizedParams, page, limit: 20 };
    
    // Check cache first
    const cachedData = getCachedData(params);
    if (cachedData && page === 1) {
      console.log('📦 Using cached transactions data');
      // Note: We can't directly set Redux state from here, 
      // but the cache check helps avoid unnecessary API calls
      return;
    }

    try {
      console.log('🔄 Loading transactions from API:', params);
      const result = await dispatch(fetchTransactions(params)).unwrap();
      
      // Cache the result
      if (result.transactions && result.pagination) {
        setCachedData(params, result.transactions, result.pagination);
      }
      
      if (reset) {
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
    }
  }, [enabled, memoizedParams, dispatch, getCachedData, setCachedData]);

  // Refetch current data
  const refetch = useCallback(async () => {
    await loadTransactions(1, true);
  }, [loadTransactions]);

  // Load more data (pagination)
  const loadMore = useCallback(async () => {
    if (!canLoadMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      await loadTransactions(nextPage, false);
      setCurrentPage(nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [canLoadMore, currentPage, loadTransactions]);

  // Load data when params change
  useEffect(() => {
    if (enabled) {
      loadTransactions(1, true);
    }
  }, [enabled, memoizedParams]);

  // Reset page when params change
  useEffect(() => {
    setCurrentPage(1);
  }, [memoizedParams]);

  return {
    transactions,
    pagination,
    isLoading: isLoading || isLoadingMore,
    error,
    refetch,
    loadMore,
    canLoadMore,
  };
}