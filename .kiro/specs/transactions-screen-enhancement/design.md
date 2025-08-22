# Design Document

## Overview

This design document outlines the technical approach for enhancing the transactions screen with functional queries and relevant filter buttons, plus optimizing the calendar screen layout to fit entirely on screen without scrolling. The solution focuses on improving query performance, adding finance-specific filters, and creating a fixed-height calendar interface.

## Architecture

### Component Structure

```
TransactionsListScreen
├── Enhanced Filter System
│   ├── SearchBar (with debouncing)
│   ├── QuickFilters (date-based)
│   ├── FinanceFilters (amount, recurring, uncategorized)
│   └── CategoryFilters (top 5 categories)
├── Query Management
│   ├── FilterState Management
│   ├── API Query Builder
│   └── Results Caching
└── Transaction Display
    ├── Grouped Transaction List
    ├── Running Balance Calculation
    └── Pagination with Filters

TransactionCalendarScreen
├── Fixed Height Layout (no scrolling)
│   ├── Month Navigation (condensed)
│   ├── Summary Cards (optimized spacing)
│   ├── Calendar Grid (calculated height)
│   └── Date Range Filter (bottom placement)
├── Screen-Fitted Container
└── Removed Legend Section
```

### State Management Enhancement

The transactions slice will be enhanced to support advanced filtering:

```typescript
interface TransactionsState {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  calendarData: CalendarData;
  pagination: PaginationData;
  activeFilters: FilterState;
  queryCache: QueryCache;
  isLoading: boolean;
  error: string | null;
}

interface FilterState {
  searchQuery: string;
  dateRange: DateRangeFilter;
  categories: string[];
  transactionType: 'all' | 'income' | 'expense';
  amountRange: AmountRangeFilter;
  isRecurring: boolean | null;
  isUncategorized: boolean | null;
}
```

## Components and Interfaces

### Enhanced Filter Components

#### 1. SearchBar Component
```typescript
interface SearchBarProps {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}
```

**Features:**
- Debounced search input (300ms delay)
- Real-time filtering of transactions
- Search across description, category, and merchant fields
- Clear button when text is present

#### 2. QuickFilters Component
```typescript
interface QuickFiltersProps {
  activeFilters: string[];
  onFilterToggle: (filterId: string) => void;
  categories: Category[];
}

const QUICK_FILTERS = [
  { id: 'this_week', label: 'This Week', type: 'date' },
  { id: 'this_month', label: 'This Month', type: 'date' },
  { id: 'last_month', label: 'Last Month', type: 'date' },
  { id: 'last_3_months', label: 'Last 3 Months', type: 'date' },
  { id: 'high_amount', label: 'High Amount (>₹5000)', type: 'amount' },
  { id: 'recurring', label: 'Recurring', type: 'pattern' },
  { id: 'uncategorized', label: 'Uncategorized', type: 'category' },
];
```

**Features:**
- Horizontal scrollable filter chips
- Visual indication of active filters
- Finance-specific quick filters
- Category-based filters from top 5 categories

#### 3. Enhanced API Service Methods

```typescript
// Enhanced getTransactions method
async getTransactions(params: TransactionQueryParams): Promise<TransactionResponse> {
  const queryParams = new URLSearchParams();
  
  // Basic pagination
  queryParams.append('page', params.page?.toString() || '1');
  queryParams.append('limit', params.limit?.toString() || '20');
  
  // Enhanced filtering
  if (params.searchQuery) {
    queryParams.append('search', params.searchQuery);
  }
  
  if (params.dateRange) {
    queryParams.append('start_date', params.dateRange.startDate);
    queryParams.append('end_date', params.dateRange.endDate);
  }
  
  if (params.categories?.length) {
    queryParams.append('categories', params.categories.join(','));
  }
  
  if (params.transactionType && params.transactionType !== 'all') {
    queryParams.append('type', params.transactionType);
  }
  
  if (params.minAmount) {
    queryParams.append('min_amount', params.minAmount.toString());
  }
  
  if (params.maxAmount) {
    queryParams.append('max_amount', params.maxAmount.toString());
  }
  
  if (params.isRecurring !== null) {
    queryParams.append('is_recurring', params.isRecurring.toString());
  }
  
  if (params.isUncategorized) {
    queryParams.append('uncategorized', 'true');
  }
  
  const response = await this.api.get(`/transactions?${queryParams.toString()}`);
  return response.data;
}

interface TransactionQueryParams {
  page?: number;
  limit?: number;
  searchQuery?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  categories?: string[];
  transactionType?: 'all' | 'income' | 'expense';
  minAmount?: number;
  maxAmount?: number;
  isRecurring?: boolean | null;
  isUncategorized?: boolean;
  accountId?: string;
}
```

### Calendar Screen Layout Optimization

#### 1. Fixed Height Layout Structure (No Scrolling)
```typescript
const FixedHeightCalendarLayout = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    height: '100%', // Use full screen height
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  // Calculated heights to fit screen
  componentHeights: {
    monthNavigation: 50, // Condensed navigation
    summaryContainer: 70, // Compact summary cards
    calendarGrid: 'calculated', // Remaining space after other components
    calendarDay: 'auto', // Calculated based on available space
    filterControls: 60, // Bottom filter section
    spacing: spacing.xs, // Minimal spacing between sections
  },
  // Dynamic sizing based on screen dimensions
  responsiveLayout: {
    smallScreen: { // < 600px height
      summaryContainer: 60,
      monthNavigation: 45,
      filterControls: 50,
    },
    mediumScreen: { // 600-800px height
      summaryContainer: 70,
      monthNavigation: 50,
      filterControls: 60,
    },
    largeScreen: { // > 800px height
      summaryContainer: 80,
      monthNavigation: 55,
      filterControls: 70,
    }
  }
};
```

#### 2. Dynamic Height Calculation
```typescript
const useCalendarDimensions = () => {
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenHeight(window.height);
    });
    return () => subscription?.remove();
  }, []);
  
  const calculateComponentHeights = () => {
    const availableHeight = screenHeight - 100; // Account for status bar and safe area
    
    const fixedHeights = {
      monthNavigation: screenHeight < 600 ? 45 : 50,
      summaryContainer: screenHeight < 600 ? 60 : 70,
      filterControls: screenHeight < 600 ? 50 : 60,
      spacing: spacing.xs * 4, // Total spacing between components
    };
    
    const totalFixedHeight = Object.values(fixedHeights).reduce((sum, height) => sum + height, 0);
    const calendarGridHeight = availableHeight - totalFixedHeight;
    const calendarDayHeight = Math.floor(calendarGridHeight / 6) - 4; // 6 rows max, minus margins
    
    return {
      ...fixedHeights,
      calendarGridHeight,
      calendarDayHeight: Math.max(calendarDayHeight, 40), // Minimum height
    };
  };
  
  return calculateComponentHeights();
};
```

#### 3. Removed Legend Section
The legend section will be completely removed to save vertical space. Color meanings will be intuitive:
- Green amounts = Income
- Red amounts = Expenses
- Blue highlight = Today
- Gray background = Has transactions

#### 4. Bottom-Placed Date Range Filter
```typescript
const DateRangeFilterBottom = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: colors.card,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  padding: spacing.md,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 5,
};
```

## Data Models

### Enhanced Filter State
```typescript
interface FilterState {
  searchQuery: string;
  activeQuickFilters: string[];
  dateRange: {
    startDate: string | null;
    endDate: string | null;
    preset: 'this_week' | 'this_month' | 'last_month' | 'last_3_months' | 'custom' | null;
  };
  categories: string[];
  transactionType: 'all' | 'income' | 'expense';
  amountFilter: {
    isHighAmount: boolean; // >₹5000
    customRange: {
      min: number | null;
      max: number | null;
    };
  };
  patternFilters: {
    isRecurring: boolean | null;
    isUncategorized: boolean | null;
  };
}
```

### Query Cache Structure
```typescript
interface QueryCache {
  [key: string]: {
    data: Transaction[];
    pagination: PaginationData;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
  };
}
```

### Calendar Layout Dimensions
```typescript
interface CalendarDimensions {
  screenHeight: number;
  availableHeight: number;
  componentHeights: {
    monthNavigation: number;
    summaryContainer: number;
    calendarGridHeight: number;
    calendarDayHeight: number;
    filterControls: number;
  };
  spacing: {
    vertical: number;
    horizontal: number;
  };
}
```

## Error Handling

### Query Error Management
```typescript
const handleQueryError = (error: ApiError) => {
  switch (error.code) {
    case 'INVALID_DATE_RANGE':
      return 'Please select a valid date range';
    case 'INVALID_AMOUNT_RANGE':
      return 'Please enter valid amount values';
    case 'TOO_MANY_RESULTS':
      return 'Too many results. Please refine your filters';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred while filtering transactions';
  }
};
```

### Filter Validation
```typescript
const validateFilters = (filters: FilterState): ValidationResult => {
  const errors: string[] = [];
  
  if (filters.dateRange.startDate && filters.dateRange.endDate) {
    const start = new Date(filters.dateRange.startDate);
    const end = new Date(filters.dateRange.endDate);
    
    if (start > end) {
      errors.push('Start date must be before end date');
    }
    
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      errors.push('Date range cannot exceed 1 year');
    }
  }
  
  if (filters.amountFilter.customRange.min && filters.amountFilter.customRange.max) {
    if (filters.amountFilter.customRange.min > filters.amountFilter.customRange.max) {
      errors.push('Minimum amount must be less than maximum amount');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

## Testing Strategy

### Unit Tests
1. **Filter Logic Tests**
   - Test individual filter functions
   - Test filter combination logic
   - Test date range calculations
   - Test amount range filtering

2. **Query Builder Tests**
   - Test URL parameter construction
   - Test query caching logic
   - Test debouncing functionality

3. **Component Tests**
   - Test filter chip interactions
   - Test search input behavior
   - Test calendar layout rendering
   - Test dynamic height calculations

### Integration Tests
1. **API Integration**
   - Test enhanced getTransactions with various filter combinations
   - Test error handling for invalid queries
   - Test pagination with filters

2. **State Management**
   - Test filter state updates
   - Test transaction list updates
   - Test cache invalidation

### Performance Tests
1. **Query Performance**
   - Test response times with various filter combinations
   - Test memory usage with large datasets
   - Test debouncing effectiveness

2. **UI Performance**
   - Test calendar rendering performance with fixed height
   - Test filter chip rendering performance
   - Test transaction list rendering with filters

## Implementation Considerations

### Performance Optimizations
1. **Debounced Search**: Implement 300ms debounce on search input
2. **Query Caching**: Cache filter results for 5 minutes
3. **Memoization**: Use React.memo for filter chips and transaction items
4. **Dynamic Sizing**: Calculate calendar dimensions once and memoize

### Accessibility
1. **Screen Reader Support**: Add proper ARIA labels to filter controls
2. **Keyboard Navigation**: Ensure all filters are keyboard accessible
3. **Color Contrast**: Maintain proper contrast ratios for filter states
4. **Focus Management**: Proper focus handling in filter interactions

### Responsive Design
1. **Filter Chips**: Horizontal scrolling on smaller screens
2. **Calendar Grid**: Dynamic sizing based on screen height
3. **Search Bar**: Adaptive width based on screen size
4. **Date Range Picker**: Mobile-optimized date selection
5. **Fixed Height Layout**: Responsive component sizing for different screen sizes