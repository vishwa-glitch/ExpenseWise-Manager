# Design Document

## Overview

This design document outlines the enhancement of the existing BudgetStatusSection and WeeklyFinancialHealthSection components to integrate with real backend APIs, replacing mock data with actual user financial information. The solution maintains the current full-width mobile design while adding robust data fetching, error handling, and responsive text layout to prevent overflow issues.

## Architecture

### Current State Analysis
- **BudgetStatusSection**: Currently uses mock data with hardcoded values for demonstration
- **WeeklyFinancialHealthSection**: Uses mock data for financial health calculations and insights
- **Data Flow**: Components are isolated without API integration
- **State Management**: No Redux integration for budget and insights data

### Target State Design
- **API Integration**: Direct integration with budget and analytics endpoints
- **Real-time Data**: Components fetch and display actual user data
- **Error Handling**: Comprehensive error states and retry mechanisms
- **Responsive Design**: Text wrapping and overflow prevention
- **State Management**: Integration with existing Redux slices

## Components and Interfaces

### 1. Enhanced BudgetStatusSection Component

**Location**: `src/components/dashboard/BudgetStatusSection.tsx`

**API Integration**:
```typescript
interface BudgetStatusSectionProps {
  onPress?: () => void;
  refreshTrigger?: number; // For external refresh triggers
}

interface BudgetStatusData {
  totalBudget: number;
  totalSpent: number;
  percentage: number;
  daysLeft: number;
  isOverBudget: boolean;
  budgetCount: number;
  overBudgetAmount?: number;
}
```

**Data Sources**:
- Primary: `GET /api/budgets` - List all budgets with progress
- Secondary: `GET /api/analytics/spending-trends?months=1` - Current month spending

**Key Enhancements**:
- Replace mock data with real API calls using existing budgets slice
- Add loading skeleton that maintains section layout
- Implement error boundary with retry functionality
- Add responsive text handling for currency amounts
- Include budget count information for better context

### 2. Enhanced WeeklyFinancialHealthSection Component

**Location**: `src/components/dashboard/WeeklyFinancialHealthSection.tsx`

**API Integration**:
```typescript
interface WeeklyFinancialHealthSectionProps {
  onPress?: () => void;
  refreshTrigger?: number;
}

interface WeeklyHealthData {
  overallScore: number;
  maxScore: number;
  achievements: HealthItem[];
  warnings: HealthItem[];
  issues: HealthItem[];
  weeklyStats: WeeklyStats;
  nextWeekGoal: number;
  dataAvailability: {
    hasTransactions: boolean;
    hasBudgets: boolean;
    hasGoals: boolean;
  };
}

interface HealthItem {
  type: 'success' | 'warning' | 'error';
  text: string;
  amount?: number;
}

interface WeeklyStats {
  thisWeek: number;
  budget: number;
  lastWeek: number;
  monthlyAvg: number;
  overBudget: number;
  changeFromLastWeek: number;
  changeFromMonthlyAvg: number;
}
```

**Data Sources**:
- Primary: `GET /api/insights/weekly-report` - Weekly financial report
- Fallback: `GET /api/insights/dashboard` - Real-time dashboard insights
- Supporting: `GET /api/budgets`, `GET /api/goals`, `GET /api/transactions?page=1&limit=50`

**Key Enhancements**:
- Implement real financial health score calculation
- Generate dynamic achievements/warnings based on actual data
- Add data availability checks and appropriate messaging
- Implement responsive star rating display
- Add smooth animations for score updates

### 3. Data Processing Utilities

**Location**: `src/utils/financialHealth.ts` (New)

**Core Functions**:
```typescript
interface FinancialHealthCalculator {
  calculateOverallScore(data: FinancialData): number;
  generateAchievements(data: FinancialData): HealthItem[];
  generateWarnings(data: FinancialData): HealthItem[];
  generateIssues(data: FinancialData): HealthItem[];
  calculateWeeklyStats(transactions: Transaction[], budgets: Budget[]): WeeklyStats;
}

interface FinancialData {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  weeklySpending: number;
  monthlyBudget: number;
  goalProgress: GoalProgress[];
}
```

**Score Calculation Logic**:
- Budget adherence (40% weight): Staying within weekly/monthly budgets
- Goal progress (30% weight): Contributing to active goals
- Spending consistency (20% weight): Avoiding large spending spikes
- Financial habits (10% weight): Regular transaction categorization, bill payments

### 4. Enhanced Redux Integration

**Budget Status Integration**:
```typescript
// Extend existing budgetsSlice
interface BudgetsState {
  budgets: Budget[];
  budgetStatus: BudgetStatusData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// New actions
const budgetsSlice = createSlice({
  // ... existing reducers
  reducers: {
    fetchBudgetStatusStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchBudgetStatusSuccess: (state, action) => {
      state.budgetStatus = action.payload;
      state.isLoading = false;
      state.lastUpdated = new Date().toISOString();
    },
    fetchBudgetStatusFailure: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});
```

**Weekly Health Integration**:
```typescript
// Extend existing analyticsSlice
interface AnalyticsState {
  // ... existing fields
  weeklyHealth: WeeklyHealthData | null;
  weeklyHealthLoading: boolean;
  weeklyHealthError: string | null;
}
```

## Data Models

### Enhanced Budget Status Model
```typescript
interface EnhancedBudgetStatus {
  totalBudget: number;
  totalSpent: number;
  percentage: number;
  daysLeft: number;
  isOverBudget: boolean;
  budgetBreakdown: BudgetBreakdown[];
  monthlyTrend: {
    currentMonth: number;
    previousMonth: number;
    changePercentage: number;
  };
}

interface BudgetBreakdown {
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  isOverBudget: boolean;
}
```

### Financial Health Score Model
```typescript
interface HealthScoreComponents {
  budgetAdherence: {
    score: number;
    weight: number;
    details: string;
  };
  goalProgress: {
    score: number;
    weight: number;
    details: string;
  };
  spendingConsistency: {
    score: number;
    weight: number;
    details: string;
  };
  financialHabits: {
    score: number;
    weight: number;
    details: string;
  };
}
```

## Error Handling

### API Error Scenarios
1. **Network Failure**: Show offline indicator with cached data if available
2. **Server Error (5xx)**: Display generic error with retry button
3. **No Data Available**: Show empty state with guidance to add budgets/transactions
4. **Partial Data**: Display available information with indicators for missing data
5. **Timeout**: Show timeout message with manual refresh option

### Error UI Components
```typescript
interface ErrorStateProps {
  type: 'network' | 'server' | 'empty' | 'partial' | 'timeout';
  message: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
}
```

### Loading States
- **Skeleton Loading**: Maintain section layout while loading
- **Progressive Loading**: Show basic info first, then detailed calculations
- **Refresh Indicators**: Pull-to-refresh and button-triggered refresh states

## Testing Strategy

### Unit Tests
- **Data Processing**: Test financial health calculations with various data scenarios
- **Component Rendering**: Test components with different data states (loading, error, success)
- **API Integration**: Mock API responses and test error handling
- **Responsive Layout**: Test text wrapping and overflow prevention

### Integration Tests
- **Redux Integration**: Test data flow from API to components
- **Error Recovery**: Test retry mechanisms and error state transitions
- **Real-time Updates**: Test component updates when underlying data changes
- **Performance**: Test with large datasets and frequent updates

### Visual Regression Tests
- **Text Overflow**: Ensure star ratings and long text don't break layout
- **Loading States**: Verify skeleton loaders maintain proper spacing
- **Error States**: Test error message display and retry button placement
- **Responsive Design**: Test on various screen sizes and orientations

## Implementation Approach

### Phase 1: API Integration Setup
1. Create financial health utility functions
2. Extend Redux slices for budget status and weekly health data
3. Add API service methods for new endpoints
4. Implement basic error handling structure

### Phase 2: Budget Status Enhancement
1. Replace mock data with real API integration
2. Add loading states and error handling
3. Implement responsive text layout
4. Add automatic refresh triggers

### Phase 3: Weekly Financial Health Enhancement
1. Implement real financial health score calculation
2. Add dynamic achievement/warning generation
3. Integrate with multiple data sources
4. Add data availability checks and empty states

### Phase 4: UI Polish and Optimization
1. Add smooth animations for data updates
2. Implement comprehensive error boundaries
3. Optimize performance for frequent updates
4. Add accessibility improvements

## Design Specifications

### Responsive Text Handling
```typescript
interface ResponsiveTextProps {
  maxWidth?: number;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail';
  adjustsFontSizeToFit?: boolean;
}
```

### Loading Skeleton Specifications
- **Budget Status**: Maintain exact height and spacing of loaded state
- **Weekly Health**: Progressive loading for score, then items, then stats
- **Animation**: Subtle shimmer effect with 1.5s duration
- **Accessibility**: Proper loading announcements for screen readers

### Error State Specifications
- **Retry Button**: Consistent styling with primary color
- **Error Messages**: User-friendly language, not technical errors
- **Icons**: Appropriate icons for different error types
- **Layout**: Maintain section height to prevent layout shifts

### Performance Considerations
- **Data Caching**: Cache API responses for 5 minutes
- **Debounced Updates**: Prevent excessive API calls during rapid changes
- **Memory Management**: Proper cleanup of subscriptions and timers
- **Bundle Size**: Lazy load heavy calculation utilities

## Accessibility Considerations

### Screen Reader Support
- **Dynamic Content**: Announce score changes and data updates
- **Error States**: Clear error descriptions and recovery instructions
- **Loading States**: Inform users about loading progress
- **Interactive Elements**: Proper labels for retry buttons and section taps

### Visual Accessibility
- **Color Contrast**: Ensure sufficient contrast for all text and indicators
- **Text Scaling**: Support dynamic type sizing
- **Focus Indicators**: Clear focus states for interactive elements
- **Motion Sensitivity**: Respect reduced motion preferences

### Touch Accessibility
- **Touch Targets**: Minimum 44px touch targets for interactive elements
- **Gesture Support**: Support for swipe-to-refresh gestures
- **Haptic Feedback**: Appropriate feedback for user actions