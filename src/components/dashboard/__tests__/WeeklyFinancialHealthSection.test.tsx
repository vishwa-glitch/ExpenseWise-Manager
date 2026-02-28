import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { WeeklyFinancialHealthSection } from '../WeeklyFinancialHealthSection';
import analyticsReducer from '../../../store/slices/analyticsSlice';

// Mock the utilities
jest.mock('../../../utils/errorUtils', () => ({
  useErrorHandler: () => ({
    getScenarioErrorMessage: jest.fn((scenario, error) => `Error: ${error.message}`),
  }),
}));

jest.mock('../../../utils/networkUtils', () => ({
  useNetworkState: () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),
}));

jest.mock('../../../utils/refreshUtils', () => ({
  useAutoRefresh: jest.fn(),
  useUpdateAnimation: () => ({
    isUpdating: false,
    startUpdateAnimation: jest.fn(),
  }),
}));

jest.mock('../../../utils/accessibilityUtils', () => ({
  getAnimationDuration: (duration: number) => duration,
}));

// Mock the components
jest.mock('../../common/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../common/SkeletonLoader', () => ({
  WeeklyHealthSkeleton: () => <div testID="weekly-health-skeleton">Loading...</div>,
}));

jest.mock('../../common/FadeInView', () => ({
  FadeInView: ({ children }: { children: React.ReactNode }) => children,
}));

const createMockStore = (initialState: any) => {
  return configureStore({
    reducer: {
      analytics: analyticsReducer,
    },
    preloadedState: {
      analytics: initialState,
    },
  });
};

const renderWithStore = (component: React.ReactElement, initialState: any) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  };
};

describe('WeeklyFinancialHealthSection', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading States', () => {
    it('should show loading skeleton when weeklyHealthLoading is true and no weeklyHealth', () => {
      const initialState = {
        weeklyHealth: null,
        weeklyHealthLoading: true,
        weeklyHealthError: null,
        dashboardInsights: null,
        spendingTrends: [],
        categoryBreakdown: [],
        selectedTimePeriod: 'monthly' as const,
        spendingTrendsByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        categoryBreakdownByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        isLoading: false,
        isRefreshing: false,
        error: null,
      };

      const { getByTestId } = renderWithStore(
        <WeeklyFinancialHealthSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByTestId('weekly-health-skeleton')).toBeTruthy();
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no data is available', () => {
      const initialState = {
        weeklyHealth: null,
        weeklyHealthLoading: false,
        weeklyHealthError: null,
        dashboardInsights: null,
        spendingTrends: [],
        categoryBreakdown: [],
        selectedTimePeriod: 'monthly' as const,
        spendingTrendsByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        categoryBreakdownByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        isLoading: false,
        isRefreshing: false,
        error: null,
      };

      const { getByText } = renderWithStore(
        <WeeklyFinancialHealthSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByText('Building Your Financial Profile')).toBeTruthy();
      expect(getByText('We need more data to calculate your financial health score. Here\'s how to get started:')).toBeTruthy();
    });

    it('should show guidance for missing data types', () => {
      const initialState = {
        weeklyHealth: null,
        weeklyHealthLoading: false,
        weeklyHealthError: null,
        dashboardInsights: {
          overview: {
            monthly_expenses: 0,
            active_budgets: 0,
            active_goals: 0,
          },
        },
        spendingTrends: [],
        categoryBreakdown: [],
        selectedTimePeriod: 'monthly' as const,
        spendingTrendsByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        categoryBreakdownByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        isLoading: false,
        isRefreshing: false,
        error: null,
      };

      const { getByText } = renderWithStore(
        <WeeklyFinancialHealthSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByText('Add some transactions to track your spending')).toBeTruthy();
      expect(getByText('Set up budgets to monitor your spending limits')).toBeTruthy();
      expect(getByText('Create savings goals to track your progress')).toBeTruthy();
    });
  });

  describe('Partial Data States', () => {
    it('should show partial data state when building profile', () => {
      const initialState = {
        weeklyHealth: null,
        weeklyHealthLoading: false,
        weeklyHealthError: null,
        dashboardInsights: {
          overview: {
            monthly_expenses: 5000,
            active_budgets: 1,
            active_goals: 0,
          },
        },
        spendingTrends: [],
        categoryBreakdown: [],
        selectedTimePeriod: 'monthly' as const,
        spendingTrendsByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        categoryBreakdownByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        isLoading: false,
        isRefreshing: false,
        error: null,
      };

      const { getByText } = renderWithStore(
        <WeeklyFinancialHealthSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByText('Getting Better Data...')).toBeTruthy();
      expect(getByText('We\'re starting to see your financial patterns! Add more data for better insights:')).toBeTruthy();
    });

    it('should show progress indicators correctly', () => {
      const initialState = {
        weeklyHealth: null,
        weeklyHealthLoading: false,
        weeklyHealthError: null,
        dashboardInsights: {
          overview: {
            monthly_expenses: 5000,
            active_budgets: 1,
            active_goals: 1,
          },
        },
        spendingTrends: [],
        categoryBreakdown: [],
        selectedTimePeriod: 'monthly' as const,
        spendingTrendsByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        categoryBreakdownByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        isLoading: false,
        isRefreshing: false,
        error: null,
      };

      const { getByText } = renderWithStore(
        <WeeklyFinancialHealthSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByText('Transactions')).toBeTruthy();
      expect(getByText('Budgets')).toBeTruthy();
      expect(getByText('Goals')).toBeTruthy();
    });
  });

  describe('Success States', () => {
    it('should display weekly health data correctly', () => {
      const mockWeeklyHealth = {
        overallScore: 85,
        maxScore: 100,
        achievements: [
          { type: 'success', text: 'Stayed within budget this week' },
        ],
        warnings: [
          { type: 'warning', text: 'High spending on dining' },
        ],
        issues: [
          { type: 'error', text: 'Missed savings goal' },
        ],
        weeklyStats: {
          thisWeek: 1200,
          budget: 1500,
          lastWeek: 1100,
          monthlyAvg: 1250,
          overBudget: 0,
          changeFromLastWeek: 9,
          changeFromMonthlyAvg: -4,
        },
        nextWeekGoal: 1300,
        dataAvailability: {
          hasTransactions: true,
          hasBudgets: true,
          hasGoals: true,
        },
      };

      const initialState = {
        weeklyHealth: mockWeeklyHealth,
        weeklyHealthLoading: false,
        weeklyHealthError: null,
        dashboardInsights: null,
        spendingTrends: [],
        categoryBreakdown: [],
        selectedTimePeriod: 'monthly' as const,
        spendingTrendsByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        categoryBreakdownByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        isLoading: false,
        isRefreshing: false,
        error: null,
      };

      const { getByText } = renderWithStore(
        <WeeklyFinancialHealthSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByText('Your Weekly Financial Health')).toBeTruthy();
      expect(getByText('8.5/10')).toBeTruthy(); // Score converted to 0-10 scale
      expect(getByText('Stayed within budget this week')).toBeTruthy();
      expect(getByText('High spending on dining')).toBeTruthy();
      expect(getByText('Missed savings goal')).toBeTruthy();
      expect(getByText('₹1,200')).toBeTruthy(); // This week amount
      expect(getByText('Next Week Goal: Keep under ₹1,300')).toBeTruthy();
    });

    it('should display star rating correctly', () => {
      const mockWeeklyHealth = {
        overallScore: 70, // 7 out of 10
        maxScore: 100,
        achievements: [],
        warnings: [],
        issues: [],
        weeklyStats: {
          thisWeek: 1200,
          budget: 1500,
          lastWeek: 1100,
          monthlyAvg: 1250,
          overBudget: 0,
          changeFromLastWeek: 9,
          changeFromMonthlyAvg: -4,
        },
        nextWeekGoal: 1300,
        dataAvailability: {
          hasTransactions: true,
          hasBudgets: true,
          hasGoals: true,
        },
      };

      const initialState = {
        weeklyHealth: mockWeeklyHealth,
        weeklyHealthLoading: false,
        weeklyHealthError: null,
        dashboardInsights: null,
        spendingTrends: [],
        categoryBreakdown: [],
        selectedTimePeriod: 'monthly' as const,
        spendingTrendsByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        categoryBreakdownByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        isLoading: false,
        isRefreshing: false,
        error: null,
      };

      const { getByText } = renderWithStore(
        <WeeklyFinancialHealthSection onPress={mockOnPress} />,
        initialState
      );

      // Should show 7 filled stars and 3 empty stars
      expect(getByText('⭐⭐⭐⭐⭐⭐⭐☆☆☆')).toBeTruthy();
    });

    it('should display percentage changes correctly', () => {
      const mockWeeklyHealth = {
        overallScore: 85,
        maxScore: 100,
        achievements: [],
        warnings: [],
        issues: [],
        weeklyStats: {
          thisWeek: 1200,
          budget: 1500,
          lastWeek: 1100,
          monthlyAvg: 1250,
          overBudget: 0,
          changeFromLastWeek: 9,
          changeFromMonthlyAvg: -4,
        },
        nextWeekGoal: 1300,
        dataAvailability: {
          hasTransactions: true,
          hasBudgets: true,
          hasGoals: true,
        },
      };

      const initialState = {
        weeklyHealth: mockWeeklyHealth,
        weeklyHealthLoading: false,
        weeklyHealthError: null,
        dashboardInsights: null,
        spendingTrends: [],
        categoryBreakdown: [],
        selectedTimePeriod: 'monthly' as const,
        spendingTrendsByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        categoryBreakdownByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        isLoading: false,
        isRefreshing: false,
        error: null,
      };

      const { getByText } = renderWithStore(
        <WeeklyFinancialHealthSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByText('(+9%)')).toBeTruthy(); // Change from last week
      expect(getByText('(-4%)')).toBeTruthy(); // Change from monthly avg
    });
  });

  describe('Fallback Data Generation', () => {
    it('should generate fallback data from dashboard insights', () => {
      const initialState = {
        weeklyHealth: null,
        weeklyHealthLoading: false,
        weeklyHealthError: null,
        dashboardInsights: {
          overview: {
            monthly_expenses: 12000,
            active_budgets: 2,
            active_goals: 1,
          },
        },
        spendingTrends: [],
        categoryBreakdown: [],
        selectedTimePeriod: 'monthly' as const,
        spendingTrendsByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        categoryBreakdownByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        isLoading: false,
        isRefreshing: false,
        error: null,
      };

      const { getByText } = renderWithStore(
        <WeeklyFinancialHealthSection onPress={mockOnPress} />,
        initialState
      );

      // Should show calculated weekly amounts (monthly / 4)
      expect(getByText(/₹3,000/)).toBeTruthy(); // Weekly spending
      expect(getByText(/₹3,600/)).toBeTruthy(); // Weekly budget (with 20% buffer)
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', async () => {
      const mockWeeklyHealth = {
        overallScore: 85,
        maxScore: 100,
        achievements: [],
        warnings: [],
        issues: [],
        weeklyStats: {
          thisWeek: 1200,
          budget: 1500,
          lastWeek: 1100,
          monthlyAvg: 1250,
          overBudget: 0,
          changeFromLastWeek: 9,
          changeFromMonthlyAvg: -4,
        },
        nextWeekGoal: 1300,
        dataAvailability: {
          hasTransactions: true,
          hasBudgets: true,
          hasGoals: true,
        },
      };

      const initialState = {
        weeklyHealth: mockWeeklyHealth,
        weeklyHealthLoading: false,
        weeklyHealthError: null,
        dashboardInsights: null,
        spendingTrends: [],
        categoryBreakdown: [],
        selectedTimePeriod: 'monthly' as const,
        spendingTrendsByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        categoryBreakdownByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        isLoading: false,
        isRefreshing: false,
        error: null,
      };

      const { getByRole } = renderWithStore(
        <WeeklyFinancialHealthSection onPress={mockOnPress} />,
        initialState
      );

      const touchable = getByRole('button');
      
      await act(async () => {
        fireEvent.press(touchable);
      });

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const mockWeeklyHealth = {
        overallScore: 85,
        maxScore: 100,
        achievements: [],
        warnings: [],
        issues: [],
        weeklyStats: {
          thisWeek: 1200,
          budget: 1500,
          lastWeek: 1100,
          monthlyAvg: 1250,
          overBudget: 0,
          changeFromLastWeek: 9,
          changeFromMonthlyAvg: -4,
        },
        nextWeekGoal: 1300,
        dataAvailability: {
          hasTransactions: true,
          hasBudgets: true,
          hasGoals: true,
        },
      };

      const initialState = {
        weeklyHealth: mockWeeklyHealth,
        weeklyHealthLoading: false,
        weeklyHealthError: null,
        dashboardInsights: null,
        spendingTrends: [],
        categoryBreakdown: [],
        selectedTimePeriod: 'monthly' as const,
        spendingTrendsByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        categoryBreakdownByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        isLoading: false,
        isRefreshing: false,
        error: null,
      };

      const { getByRole } = renderWithStore(
        <WeeklyFinancialHealthSection onPress={mockOnPress} />,
        initialState
      );

      const touchable = getByRole('button');
      
      expect(touchable.props.accessibilityLabel).toContain('Weekly financial health score');
      expect(touchable.props.accessibilityLabel).toContain('8.5 out of 10');
      expect(touchable.props.accessibilityHint).toBe('Tap to view detailed weekly financial report');
    });
  });

  describe('Responsive Layout', () => {
    it('should handle long achievement text without overflow', () => {
      const mockWeeklyHealth = {
        overallScore: 85,
        maxScore: 100,
        achievements: [
          { 
            type: 'success', 
            text: 'This is a very long achievement text that should wrap properly without causing horizontal overflow issues in the component layout' 
          },
        ],
        warnings: [],
        issues: [],
        weeklyStats: {
          thisWeek: 1200,
          budget: 1500,
          lastWeek: 1100,
          monthlyAvg: 1250,
          overBudget: 0,
          changeFromLastWeek: 9,
          changeFromMonthlyAvg: -4,
        },
        nextWeekGoal: 1300,
        dataAvailability: {
          hasTransactions: true,
          hasBudgets: true,
          hasGoals: true,
        },
      };

      const initialState = {
        weeklyHealth: mockWeeklyHealth,
        weeklyHealthLoading: false,
        weeklyHealthError: null,
        dashboardInsights: null,
        spendingTrends: [],
        categoryBreakdown: [],
        selectedTimePeriod: 'monthly' as const,
        spendingTrendsByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        categoryBreakdownByPeriod: {
          weekly: null,
          monthly: null,
          '6months': null,
          yearly: null,
        },
        isLoading: false,
        isRefreshing: false,
        error: null,
      };

      const { getByText } = renderWithStore(
        <WeeklyFinancialHealthSection onPress={mockOnPress} />,
        initialState
      );

      // Should render without throwing
      expect(getByText(/This is a very long achievement text/)).toBeTruthy();
    });
  });
});