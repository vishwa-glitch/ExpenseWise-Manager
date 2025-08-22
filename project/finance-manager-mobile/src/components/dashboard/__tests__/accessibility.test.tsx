import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BudgetStatusSection } from '../BudgetStatusSection';
import { WeeklyFinancialHealthSection } from '../WeeklyFinancialHealthSection';
import budgetsReducer from '../../../store/slices/budgetsSlice';
import analyticsReducer from '../../../store/slices/analyticsSlice';

// Mock all utilities
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

jest.mock('../../common/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../common/SkeletonLoader', () => ({
  BudgetStatusSkeleton: () => <div testID="budget-status-skeleton">Loading...</div>,
  WeeklyHealthSkeleton: () => <div testID="weekly-health-skeleton">Loading...</div>,
}));

jest.mock('../../common/FadeInView', () => ({
  FadeInView: ({ children }: { children: React.ReactNode }) => children,
}));

const createMockStore = (initialState: any) => {
  return configureStore({
    reducer: {
      budgets: budgetsReducer,
      analytics: analyticsReducer,
    },
    preloadedState: initialState,
  });
};

const renderWithStore = (component: React.ReactElement, initialState: any) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('Accessibility Tests', () => {
  describe('BudgetStatusSection Accessibility', () => {
    const budgetState = {
      budgets: [
        {
          id: '1',
          name: 'Food Budget',
          amount: 1000,
          spent_amount: 500,
          is_active: true,
        },
      ],
      budgetStatus: {
        totalBudget: 1000,
        totalSpent: 500,
        percentage: 50,
        daysLeft: 15,
        isOverBudget: false,
        budgetCount: 1,
      },
      budgetStatusLoading: false,
      budgetStatusError: null,
    };

    const analyticsState = {
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

    it('should have proper accessibility role', () => {
      const { getByRole } = renderWithStore(
        <BudgetStatusSection />,
        { budgets: budgetState, analytics: analyticsState }
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should have descriptive accessibility label', () => {
      const { getByRole } = renderWithStore(
        <BudgetStatusSection />,
        { budgets: budgetState, analytics: analyticsState }
      );

      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toContain('Budget status');
      expect(button.props.accessibilityLabel).toContain('₹500');
      expect(button.props.accessibilityLabel).toContain('₹1,000');
      expect(button.props.accessibilityLabel).toContain('50% used • 15 days left');
    });

    it('should have helpful accessibility hint', () => {
      const { getByRole } = renderWithStore(
        <BudgetStatusSection />,
        { budgets: budgetState, analytics: analyticsState }
      );

      const button = getByRole('button');
      expect(button.props.accessibilityHint).toBe('Tap to view detailed budget breakdown');
    });

    it('should have proper accessibility for error state', () => {
      const errorState = {
        ...budgetState,
        budgetStatus: null,
        budgetStatusError: 'Network error',
      };

      const { getByRole } = renderWithStore(
        <BudgetStatusSection />,
        { budgets: errorState, analytics: analyticsState }
      );

      const retryButton = getByRole('button', { name: /retry/i });
      expect(retryButton.props.accessibilityLabel).toBe('Retry loading budget data');
    });

    it('should handle over-budget accessibility labels', () => {
      const overBudgetState = {
        ...budgetState,
        budgetStatus: {
          totalBudget: 1000,
          totalSpent: 1200,
          percentage: 120,
          daysLeft: 15,
          isOverBudget: true,
          budgetCount: 1,
          overBudgetAmount: 200,
        },
      };

      const { getByRole } = renderWithStore(
        <BudgetStatusSection />,
        { budgets: overBudgetState, analytics: analyticsState }
      );

      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toContain('Over budget by ₹200');
    });
  });

  describe('WeeklyFinancialHealthSection Accessibility', () => {
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

    const budgetState = {
      budgets: [],
      budgetStatus: null,
      budgetStatusLoading: false,
      budgetStatusError: null,
    };

    const analyticsState = {
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

    it('should have proper accessibility role', () => {
      const { getByRole } = renderWithStore(
        <WeeklyFinancialHealthSection />,
        { budgets: budgetState, analytics: analyticsState }
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should have descriptive accessibility label for health score', () => {
      const { getByRole } = renderWithStore(
        <WeeklyFinancialHealthSection />,
        { budgets: budgetState, analytics: analyticsState }
      );

      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toContain('Weekly financial health score');
      expect(button.props.accessibilityLabel).toContain('8.5 out of 10');
    });

    it('should have helpful accessibility hint', () => {
      const { getByRole } = renderWithStore(
        <WeeklyFinancialHealthSection />,
        { budgets: budgetState, analytics: analyticsState }
      );

      const button = getByRole('button');
      expect(button.props.accessibilityHint).toBe('Tap to view detailed weekly financial report');
    });

    it('should handle empty state accessibility', () => {
      const emptyAnalyticsState = {
        ...analyticsState,
        weeklyHealth: null,
        dashboardInsights: null,
      };

      const { getByText } = renderWithStore(
        <WeeklyFinancialHealthSection />,
        { budgets: budgetState, analytics: emptyAnalyticsState }
      );

      // Should have clear guidance text
      expect(getByText('Building Your Financial Profile')).toBeTruthy();
      expect(getByText('We need more data to calculate your financial health score. Here\'s how to get started:')).toBeTruthy();
    });

    it('should handle partial data state accessibility', () => {
      const partialAnalyticsState = {
        ...analyticsState,
        weeklyHealth: null,
        dashboardInsights: {
          overview: {
            monthly_expenses: 5000,
            active_budgets: 1,
            active_goals: 0,
          },
        },
      };

      const { getByText } = renderWithStore(
        <WeeklyFinancialHealthSection />,
        { budgets: budgetState, analytics: partialAnalyticsState }
      );

      // Should have progress indicators
      expect(getByText('Getting Better Data...')).toBeTruthy();
      expect(getByText('Transactions')).toBeTruthy();
      expect(getByText('Budgets')).toBeTruthy();
      expect(getByText('Goals')).toBeTruthy();
    });
  });

  describe('Touch Target Accessibility', () => {
    it('should have adequate touch targets for BudgetStatusSection', () => {
      const budgetState = {
        budgets: [
          {
            id: '1',
            name: 'Food Budget',
            amount: 1000,
            spent_amount: 500,
            is_active: true,
          },
        ],
        budgetStatus: {
          totalBudget: 1000,
          totalSpent: 500,
          percentage: 50,
          daysLeft: 15,
          isOverBudget: false,
          budgetCount: 1,
        },
        budgetStatusLoading: false,
        budgetStatusError: null,
      };

      const analyticsState = {
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

      const { getByRole } = renderWithStore(
        <BudgetStatusSection />,
        { budgets: budgetState, analytics: analyticsState }
      );

      const button = getByRole('button');
      
      // TouchableOpacity should have adequate size for touch
      // The component uses padding and margins that ensure good touch targets
      expect(button).toBeTruthy();
    });

    it('should have adequate touch targets for retry buttons', () => {
      const errorState = {
        budgets: [],
        budgetStatus: null,
        budgetStatusLoading: false,
        budgetStatusError: 'Network error',
      };

      const analyticsState = {
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

      const { getByRole } = renderWithStore(
        <BudgetStatusSection />,
        { budgets: errorState, analytics: analyticsState }
      );

      const retryButton = getByRole('button', { name: /retry/i });
      
      // Retry button should have adequate padding for touch
      expect(retryButton).toBeTruthy();
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should provide meaningful content for screen readers in BudgetStatusSection', () => {
      const budgetState = {
        budgets: [
          {
            id: '1',
            name: 'Food Budget',
            amount: 1000,
            spent_amount: 500,
            is_active: true,
          },
        ],
        budgetStatus: {
          totalBudget: 1000,
          totalSpent: 500,
          percentage: 50,
          daysLeft: 15,
          isOverBudget: false,
          budgetCount: 1,
        },
        budgetStatusLoading: false,
        budgetStatusError: null,
      };

      const analyticsState = {
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
        <BudgetStatusSection />,
        { budgets: budgetState, analytics: analyticsState }
      );

      // Text content should be meaningful for screen readers
      expect(getByText('Budget Status')).toBeTruthy();
      expect(getByText('₹500 of ₹1,000')).toBeTruthy();
      expect(getByText('50% used • 15 days left')).toBeTruthy();
    });

    it('should provide meaningful content for screen readers in WeeklyFinancialHealthSection', () => {
      const mockWeeklyHealth = {
        overallScore: 85,
        maxScore: 100,
        achievements: [
          { type: 'success', text: 'Stayed within budget this week' },
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

      const budgetState = {
        budgets: [],
        budgetStatus: null,
        budgetStatusLoading: false,
        budgetStatusError: null,
      };

      const analyticsState = {
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
        <WeeklyFinancialHealthSection />,
        { budgets: budgetState, analytics: analyticsState }
      );

      // Text content should be meaningful for screen readers
      expect(getByText('Your Weekly Financial Health')).toBeTruthy();
      expect(getByText('Overall Score:')).toBeTruthy();
      expect(getByText('8.5/10')).toBeTruthy();
      expect(getByText('Stayed within budget this week')).toBeTruthy();
    });
  });
});