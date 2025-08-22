import React, { memo } from 'react';
import QuickFilters from './QuickFilters';

interface MemoizedQuickFiltersProps {
  activeFilters: string[];
  onFilterToggle: (filterId: string) => void;
  categories?: Array<{ id: string; name: string; icon?: string }>;
}

/**
 * Memoized QuickFilters component for better performance
 */
const MemoizedQuickFilters: React.FC<MemoizedQuickFiltersProps> = memo(({
  activeFilters,
  onFilterToggle,
  categories,
}) => {
  return (
    <QuickFilters
      activeFilters={activeFilters}
      onFilterToggle={onFilterToggle}
      categories={categories}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  const activeFiltersEqual = 
    prevProps.activeFilters.length === nextProps.activeFilters.length &&
    prevProps.activeFilters.every((filter, index) => filter === nextProps.activeFilters[index]);
  
  const categoriesEqual = 
    prevProps.categories?.length === nextProps.categories?.length &&
    prevProps.categories?.every((cat, index) => 
      cat.id === nextProps.categories?.[index]?.id &&
      cat.name === nextProps.categories?.[index]?.name
    );

  return activeFiltersEqual && categoriesEqual;
});

MemoizedQuickFilters.displayName = 'MemoizedQuickFilters';

export default MemoizedQuickFilters;