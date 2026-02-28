import { useCallback, useEffect } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useTypedSelector } from './useTypedSelector';
import { setCacheEntry, clearExpiredCache, clearCache } from '../store/slices/transactionsSlice';
import { generateCacheKey, isCacheValid } from '../utils/filterUtils';

interface UseQueryCacheReturn {
  getCachedData: (params: any) => { data: any[]; pagination: any } | null;
  setCachedData: (params: any, data: any[], pagination: any) => void;
  clearExpiredEntries: () => void;
  clearAllCache: () => void;
  hasCachedData: (params: any) => boolean;
}

/**
 * Custom hook for managing query result caching
 * @returns Object with cache management functions
 */
export function useQueryCache(): UseQueryCacheReturn {
  const dispatch = useAppDispatch();
  const queryCache = useTypedSelector((state) => state.transactions.queryCache);

  // Clear expired cache entries on mount and periodically
  useEffect(() => {
    const clearExpired = () => {
      dispatch(clearExpiredCache());
    };

    // Clear expired entries immediately
    clearExpired();

    // Set up periodic cleanup every 5 minutes
    const interval = setInterval(clearExpired, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const getCachedData = useCallback((params: any) => {
    const cacheKey = generateCacheKey(params);
    const entry = queryCache[cacheKey];

    if (entry && isCacheValid(entry)) {
      console.log('📦 Using cached data for query:', cacheKey);
      return {
        data: entry.data,
        pagination: entry.pagination,
      };
    }

    return null;
  }, [queryCache]);

  const setCachedData = useCallback((params: any, data: any[], pagination: any) => {
    const cacheKey = generateCacheKey(params);
    console.log('💾 Caching data for query:', cacheKey);
    
    dispatch(setCacheEntry({
      key: cacheKey,
      data,
      pagination,
    }));
  }, [dispatch]);

  const clearExpiredEntries = useCallback(() => {
    dispatch(clearExpiredCache());
  }, [dispatch]);

  const clearAllCache = useCallback(() => {
    dispatch(clearCache());
  }, [dispatch]);

  const hasCachedData = useCallback((params: any) => {
    const cacheKey = generateCacheKey(params);
    const entry = queryCache[cacheKey];
    return entry && isCacheValid(entry);
  }, [queryCache]);

  return {
    getCachedData,
    setCachedData,
    clearExpiredEntries,
    clearAllCache,
    hasCachedData,
  };
}