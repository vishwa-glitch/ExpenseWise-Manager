import { useEffect, useState } from 'react';
import { useTypedSelector } from './useTypedSelector';
import { useAppDispatch } from './useAppDispatch';
import { fetchCategories } from '../store/slices/categoriesSlice';

interface CategoryFilterData {
  id: string;
  name: string;
  icon?: string;
  transactionCount?: number;
}

interface UseCategoryFiltersReturn {
  topCategories: CategoryFilterData[];
  allCategories: CategoryFilterData[];
  isLoading: boolean;
  error: string | null;
  refreshCategories: () => void;
}

/**
 * Custom hook for managing category-based filtering
 * @returns Object with category data and management functions
 */
export function useCategoryFilters(): UseCategoryFiltersReturn {
  const dispatch = useAppDispatch();
  const { categories, isLoading, error } = useTypedSelector((state) => state.categories);
  const [topCategories, setTopCategories] = useState<CategoryFilterData[]>([]);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  useEffect(() => {
    if (categories.length > 0) {
      // Sort categories by usage/transaction count and get top 5
      const sortedCategories = [...categories]
        .sort((a, b) => (b.transaction_count || 0) - (a.transaction_count || 0))
        .slice(0, 5)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          transactionCount: cat.transaction_count || 0,
        }));
      
      setTopCategories(sortedCategories);
    }
  }, [categories]);

  const refreshCategories = () => {
    dispatch(fetchCategories());
  };

  const allCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    transactionCount: cat.transaction_count || 0,
  }));

  return {
    topCategories,
    allCategories,
    isLoading,
    error,
    refreshCategories,
  };
}