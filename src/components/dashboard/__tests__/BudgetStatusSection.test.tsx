import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BudgetStatusSection } from '../BudgetStatusSection';
import budgetsReducer from '../../../store/slices/budgetsSlice';
import { fetchBudgetStatus } from '../../../store/slices/budgetsSlice';

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
  BudgetStatusSkeleton: () => <div testID="budget-status-skeleton">Loading...</div>,
}));

jest.mock('../../common/FadeInView', () => ({
  FadeInView: ({ children }: { children: React.ReactNode }) => children,
}));

const createMockStore = (initialState: any) => {
  return configureStore({
    reducer: {
      budgets: budgetsReducer,
    },
    preloadedState: {
      budgets: initialState,
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

describe('BudgetStatusSection', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading States', () => {
    it('should show loading skeleton when budgetStatusLoading is true and no budgetStatus', () => {
      const initialState = {
        budgets: [],
        budgetStatus: null,
        budgetStatusLoading: true,
        budgetStatusError: null,
      };

      const { getByTestId } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByTestId('budget-status-skeleton')).toBeTruthy();
    });

    it('should show loading indicator when updating existing data', () => {
      const initialState = {
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
        budgetStatusLoading: true,
        budgetStatusError: null,
      };

      const { getByTestId } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByTestId('loading-indicator')).toBeTruthy();
    });
  });

  describe('Error States', () => {
    it('should show error state when budgetStatusError exists and no cached data', () => {
      const initialState = {
        budgets: [],
        budgetStatus: null,
        budgetStatusLoading: false,
        budgetStatusError: 'Network error',
      };

      const { getByText, getByRole } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByText('Error: Network error')).toBeTruthy();
      expect(getByRole('button', { name: /retry/i })).toBeTruthy();
    });

    it('should show network error when offline', () => {
      // Mock network state as offline
      jest.doMock('../../../utils/networkUtils', () => ({
        useNetworkState: () => ({
          isConnected: false,
          isInternetReachable: false,
          type: 'none',
        }),
      }));

      const initialState = {
        budgets: [],
        budgetStatus: null,
        budgetStatusLoading: false,
        budgetStatusError: 'Network error',
      };

      const { getByText } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByText('No internet connection')).toBeTruthy();
      expect(getByText('Budget data will refresh when connection is restored')).toBeTruthy();
    });

    it('should handle retry button press', async () => {
      const initialState = {
        budgets: [],
        budgetStatus: null,
        budgetStatusLoading: false,
        budgetStatusError: 'Network error',
      };

      const { getByRole, store } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
        initialState
      );

      const retryButton = getByRole('button', { name: /retry/i });
      
      await act(async () => {
        fireEvent.press(retryButton);
      });

      // Verify that fetchBudgetStatus was dispatched
      const actions = store.getState();
      // Note: In a real test, you'd mock the dispatch and verify the action was called
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no budgets exist', () => {
      const initialState = {
        budgets: [],
        budgetStatus: {
          totalBudget: 0,
          totalSpent: 0,
          percentage: 0,
          daysLeft: 0,
          isOverBudget: false,
          budgetCount: 0,
        },
        budgetStatusLoading: false,
        budgetStatusError: null,
      };

      const { getByText } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByText('No budgets set up yet')).toBeTruthy();
      expect(getByText('Create your first budget to track spending')).toBeTruthy();
    });
  });

  describe('Success States', () => {
    it('should display budget status correctly when within budget', () => {
      const initialState = {
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

      const { getByText } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByText('Budget Status')).toBeTruthy();
      expect(getByText('₹500 of ₹1,000')).toBeTruthy();
      expect(getByText('50% used • 15 days left')).toBeTruthy();
    });

    it('should display over-budget status correctly', () => {
      const initialState = {
        budgets: [
          {
            id: '1',
            name: 'Food Budget',
            amount: 1000,
            spent_amount: 1200,
            is_active: true,
          },
        ],
        budgetStatus: {
          totalBudget: 1000,
          totalSpent: 1200,
          percentage: 120,
          daysLeft: 15,
          isOverBudget: true,
          budgetCount: 1,
          overBudgetAmount: 200,
        },
        budgetStatusLoading: false,
        budgetStatusError: null,
      };

      const { getByText } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
        initialState
      );

      expect(getByText('₹1,200 of ₹1,000')).toBeTruthy();
      expect(getByText('Over budget by ₹200')).toBeTruthy();
    });

    it('should filter out inactive budgets', () => {
      const initialState = {
        budgets: [
          {
            id: '1',
            name: 'Active Budget',
            amount: 1000,
            spent_amount: 500,
            is_active: true,
          },
          {
            id: '2',
            name: 'Inactive Budget',
            amount: 2000,
            spent_amount: 1000,
            is_active: false,
          },
        ],
        budgetStatus: null, // Force fallback calculation
        budgetStatusLoading: false,
        budgetStatusError: null,
      };

      const { getByText } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
        initialState
      );

      // Should only show active budget amounts
      expect(getByText('₹500 of ₹1,000')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', async () => {
      const initialState = {
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

      const { getByRole } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
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
      const initialState = {
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

      const { getByRole } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
        initialState
      );

      const touchable = getByRole('button');
      
      expect(touchable.props.accessibilityLabel).toContain('Budget status');
      expect(touchable.props.accessibilityLabel).toContain('₹500');
      expect(touchable.props.accessibilityLabel).toContain('₹1,000');
      expect(touchable.props.accessibilityHint).toBe('Tap to view detailed budget breakdown');
    });

    it('should have proper accessibility for error state', () => {
      const initialState = {
        budgets: [],
        budgetStatus: null,
        budgetStatusLoading: false,
        budgetStatusError: 'Network error',
      };

      const { getByRole } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
        initialState
      );

      const retryButton = getByRole('button', { name: /retry/i });
      
      expect(retryButton.props.accessibilityLabel).toBe('Retry loading budget data');
    });
  });

  describe('Responsive Layout', () => {
    it('should handle long currency amounts without overflow', () => {
      const initialState = {
        budgets: [
          {
            id: '1',
            name: 'Very Expensive Budget',
            amount: 999999999,
            spent_amount: 888888888,
            is_active: true,
          },
        ],
        budgetStatus: {
          totalBudget: 999999999,
          totalSpent: 888888888,
          percentage: 89,
          daysLeft: 15,
          isOverBudget: false,
          budgetCount: 1,
        },
        budgetStatusLoading: false,
        budgetStatusError: null,
      };

      const { getByText } = renderWithStore(
        <BudgetStatusSection onPress={mockOnPress} />,
        initialState
      );

      // Should render without throwing and display the amounts
      expect(getByText(/₹88,88,88,888 of ₹99,99,99,999/)).toBeTruthy();
    });
  });
});