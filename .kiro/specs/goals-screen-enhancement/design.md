# Design Document

## Overview

This design addresses critical issues in the goals screen implementation and fixes the SmartInsights display problem on the dashboard. The solution involves completely refactoring the broken GoalAnalyticsScreen component, creating a new modern goals management interface, and fixing missing chart components that prevent SmartInsights from rendering properly.

## Architecture

### Component Structure
```
Goals Module
├── GoalsScreen (new main goals screen)
│   ├── GoalsHeader (navigation and actions)
│   ├── GoalsList (scrollable goal cards)
│   ├── GoalCard (individual goal display)
│   ├── EmptyGoalsState (when no goals exist)
│   └── AddGoalFAB (floating action button)
├── GoalAnalyticsScreen (completely refactored)
│   ├── GoalProgressCharts (working chart components)
│   ├── GoalInsights (analytics and trends)
│   └── GoalComparison (goal performance comparison)
├── GoalFormScreen (create/edit goals)
│   ├── BasicGoalForm (manual goal creation)
│   └── AIGoalChat (AI-assisted goal creation)
└── Shared Components
    ├── ProgressBar (animated progress indicator)
    ├── GoalStatusBadge (status visualization)
    └── ContributionButton (quick contribution)

Dashboard Module (SmartInsights Fix)
├── SmartInsightsSection (existing, needs chart fixes)
│   ├── BarChart (missing component - needs creation)
│   ├── LineChart (existing, needs fixes)
│   └── PieChart (existing, needs fixes)
```

### Data Flow
1. Goals Screen loads → Fetch goals from API → Display in cards
2. User taps goal → Navigate to analytics with goal details
3. User adds contribution → Update API → Refresh UI
4. SmartInsights loads → Fetch dashboard data → Render charts
5. Chart errors → Show fallback UI with retry option

## Components and Interfaces

### GoalsScreen Component
```typescript
interface GoalsScreenProps {
  navigation: NavigationProp<any>;
}

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  target_date: string;
  days_remaining: number;
  monthly_savings_needed: number;
  status: 'active' | 'completed' | 'paused';
  category: string;
  priority: number;
}
```

**Design Features:**
- Clean header with title and add goal button
- Scrollable list of goal cards with progress indicators
- Pull-to-refresh functionality
- Empty state with motivational messaging
- Floating action button for quick goal creation

### GoalCard Component
```typescript
interface GoalCardProps {
  goal: Goal;
  onPress: (goal: Goal) => void;
  onContribute: (goalId: string) => void;
  onEdit: (goal: Goal) => void;
}
```

**Visual Design:**
- Card layout with rounded corners and shadow
- Progress bar with animated fill
- Target amount and current amount display
- Days remaining indicator
- Quick contribute button
- Status badge (active/completed/paused)
- Category icon and color coding

### Fixed GoalAnalyticsScreen Component
```typescript
interface GoalAnalyticsScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}
```

**Fixes Required:**
- Remove broken code and syntax errors
- Implement proper chart data transformation
- Add missing chart components (BarChart)
- Fix data flow and state management
- Add proper error handling

### Missing BarChart Component
```typescript
interface BarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
    }>;
  };
  title: string;
  showValuesOnTopOfBars?: boolean;
  yAxisSuffix?: string;
}
```

**Implementation:**
- Create using react-native-chart-kit
- Match styling with existing charts
- Add loading and error states
- Support horizontal scrolling for many bars

## Data Models

### API Integration (Based on Backend Config)

#### Goals API Endpoints
```typescript
// GET /api/goals - List all goals
interface GoalsResponse {
  goals: Goal[];
}

// GET /api/goals/:id - Get goal details with progress
interface GoalDetailsResponse {
  goal: Goal & {
    contribution_history: Array<{
      date: string;
      amount: number;
      description?: string;
    }>;
    progress_analytics: {
      monthly_progress: number[];
      projected_completion: string;
      savings_rate: number;
    };
  };
}

// POST /api/goals/:id/contribute - Add contribution
interface ContributeRequest {
  amount: number;
  description?: string;
}
```

#### Dashboard Insights API
```typescript
// GET /api/insights/dashboard - Dashboard insights
interface DashboardInsightsResponse {
  overview: {
    monthly_income: number;
    monthly_expenses: number;
    monthly_savings: number;
    savings_rate: number;
    active_goals: number;
  };
  spending_trend: {
    last_7_days: number;
    previous_7_days: number;
    change_percentage: number;
    trend_direction: 'increasing' | 'decreasing';
  };
  top_categories: Array<{
    name: string;
    amount: number;
    transaction_count: number;
  }>;
}
```

### Redux State Updates
```typescript
interface GoalsState {
  goals: Goal[];
  selectedGoal: Goal | null;
  isLoading: boolean;
  error: string | null;
  contributionHistory: Record<string, ContributionHistory[]>;
}

interface DashboardState {
  insights: DashboardInsights | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}
```

## Error Handling

### Goals Screen Error Scenarios
1. **API Failure**: Show retry button with error message
2. **No Goals**: Display encouraging empty state with create goal CTA
3. **Goal Creation Error**: Show validation errors inline
4. **Contribution Error**: Display error toast with retry option

### SmartInsights Error Scenarios
1. **Missing Chart Components**: Create fallback BarChart component
2. **Data Transformation Errors**: Add proper error boundaries
3. **API Response Issues**: Handle malformed data gracefully
4. **Chart Rendering Failures**: Show static data summary as fallback

### Error UI Components
- **ErrorBoundary**: Wrap chart components
- **RetryButton**: Consistent retry styling
- **ErrorToast**: Non-intrusive error notifications
- **FallbackChart**: Static chart when dynamic fails

## Testing Strategy

### Unit Tests
- Goal card rendering with different states
- Progress calculation accuracy
- API data transformation
- Chart component error handling

### Integration Tests
- Goal creation and editing flow
- Contribution workflow
- Dashboard insights loading
- Navigation between screens

### Visual Tests
- Goal card layouts on different screen sizes
- Chart rendering consistency
- Animation smoothness
- Empty state displays

## Implementation Considerations

### Performance Optimizations
- **Lazy Loading**: Load goal details on demand
- **Image Caching**: Cache goal category icons
- **List Virtualization**: For large goal lists
- **Chart Memoization**: Prevent unnecessary chart re-renders

### Accessibility
- **Screen Reader**: Proper labels for progress indicators
- **Touch Targets**: Minimum 44px for all interactive elements
- **Color Contrast**: Ensure sufficient contrast for progress bars
- **Voice Over**: Descriptive text for chart data

### Responsive Design
- **Screen Sizes**: Adapt card layouts for different devices
- **Orientation**: Handle landscape mode gracefully
- **Safe Areas**: Respect device safe areas
- **Tablet Support**: Optimize for larger screens

### Backend Integration
- **Authentication**: Use Bearer token from backend config
- **Error Handling**: Handle 401, 403, 429 status codes
- **Rate Limiting**: Respect API rate limits
- **Offline Support**: Cache goal data locally

## Chart Component Fixes

### BarChart Implementation
```typescript
// Create missing BarChart component
import { BarChart as RNBarChart } from 'react-native-chart-kit';

const BarChart: React.FC<BarChartProps> = ({ data, title, ...props }) => {
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <RNBarChart
        data={data}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        {...props}
      />
    </View>
  );
};
```

### Chart Configuration
```typescript
const chartConfig = {
  backgroundColor: colors.card,
  backgroundGradientFrom: colors.card,
  backgroundGradientTo: colors.card,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: colors.primary
  }
};
```

### Data Transformation Utilities
```typescript
const transformGoalData = (goals: Goal[]) => {
  return {
    labels: goals.map(g => g.title.substring(0, 10) + '...'),
    datasets: [{
      data: goals.map(g => g.progress_percentage || 0),
      color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
    }]
  };
};

const transformCategoryData = (categories: any[]) => {
  return categories.map((cat, index) => ({
    name: cat.name,
    amount: cat.amount,
    color: colors.categories[index % colors.categories.length],
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));
};
```