import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface UseSearchWithDebounceProps {
  onSearch: (query: string) => void;
  debounceMs?: number;
  initialValue?: string;
}

interface UseSearchWithDebounceReturn {
  searchQuery: string;
  debouncedSearchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

/**
 * Custom hook for managing search with debounce functionality
 * @param onSearch - Callback function called when debounced search query changes
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 * @param initialValue - Initial search query value
 * @returns Object with search state and handlers
 */
export function useSearchWithDebounce({
  onSearch,
  debounceMs = 300,
  initialValue = '',
}: UseSearchWithDebounceProps): UseSearchWithDebounceReturn {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);

  // Call onSearch when debounced value changes
  useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    debouncedSearchQuery,
    setSearchQuery,
    clearSearch,
  };
}