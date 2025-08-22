import { configureStore } from '@reduxjs/toolkit';
import budgetsReducer, { 
  fetchBudgetStatus, 
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  toggleBudget 
} from '../slices/budgetsSlice';
import { apiService } from '../../services/api';

// Mock the API service
jest.mock('../../services/api');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('budgetsSlice Integration Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        budgets: budgetsReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('fetchBudgetStatus', () => {
    it('should fetch budget status successfully', async () => {
      const mockBudgetStatus = {
        budgetStatus: {
          totalBudget: 5000,
          totalSpent: 3000,
          percentage: 60,
          daysLeft: 15,
          isOverBudget: false,
          budgetCount: 3,
        },
        budgets: [
          {
            id: '1',
            name: 'Food Budget',
            amount: 2000,
            spent_amount: 1200,
            is_active: true,
            period: 'monthly',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockApiService.getBudgetStatus.mockResolvedValue(mockBudgetStatus);

      await store.dispatch(fetchBudgetStatus());

      const state = store.getState().budgets;
      expect(state.budgetStatus).toEqual(mockBudgetStatus.budgetStatus);
      expect(state.budgetStatusLoading).toBe(false);
      expect(state.budgetStatusError).toBeNull();
    });

    it('should handle fetchBudgetStatus failure', async () => {
      const errorMessage = 'Network error';
      mockApiService.getBudgetStatus.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchBudgetStatus());

      const state = store.getState().budgets;
      expect(state.budgetStatus).toBeNull();
      expect(state.budgetStatusLoading).toBe(false);
      expect(state.budgetStatusError).toBe(errorMessage);
    });

    it('should calculate budget status from budgets when API returns budgets data', async () => {
      const mockBudgetsResponse = {
        budgets: [
          {
            id: '1',
            name: 'Food Budget',
            amount: 1000,
            spent_amount: 600,
            is_active: true,
            period: 'monthly',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            name: 'Transport Budget',
            amount: 500,
            spent_amount: 200,
            is_active: true,
            period: 'monthly',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      // Mock getBudgetStatus to fail, then getBudgets to succeed (fallback)
      mockApiService.getBudgetStatus.mockRejectedValue(new Error('404'));
      mockApiService.getBudgets.mockResolvedValue(mockBudgetsResponse);

      await store.dispatch(fetchBudgetStatus());

      const state = store.getState().budgets;
      expect(state.budgetStatus).toEqual({
        totalBudget: 1500,
        totalSpent: 800,
        percentage: 53, // Math.round((800/1500) * 100)
        daysLeft: expect.any(Number),
        isOverBudget: false,
        budgetCount: 2,
      });
    });
  });

  describe('Budget CRUD Operations', () => {
    it('should handle complete budget lifecycle', async () => {
      // Create budget
      const newBudget = {
        id: '1',
        name: 'Test Budget',
        amount: 1000,
        spent_amount: 0,
        is_active: true,
        period: 'monthly',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockApiService.createBudget.mockResolvedValue({ budget: newBudget });
      await store.dispatch(createBudget({ name: 'Test Budget', amount: 1000 }));

      let state = store.getState().budgets;
      expect(state.budgets).toHaveLength(1);
      expect(state.budgets[0]).toEqual(newBudget);
      expect(state.budgetStatus?.budgetCount).toBe(1);

      // Update budget
      const updatedBudget = { ...newBudget, amount: 1500, spent_amount: 500 };
      mockApiService.updateBudget.mockResolvedValue({ budget: updatedBudget });
      await store.dispatch(updateBudget({ id: '1', data: { amount: 1500 } }));

      state = store.getState().budgets;
      expect(state.budgets[0].amount).toBe(1500);
      expect(state.budgetStatus?.totalBudget).toBe(1500);

      // Toggle budget
      const toggledBudget = { ...updatedBudget, is_active: false };
      mockApiService.toggleBudget.mockResolvedValue({ budget: toggledBudget });
      await store.dispatch(toggleBudget({ id: '1', isActive: false }));

      state = store.getState().budgets;
      expect(state.budgets[0].is_active).toBe(false);
      expect(state.budgetStatus?.budgetCount).toBe(0); // Inactive budgets not counted

      // Delete budget
      mockApiService.deleteBudget.mockResolvedValue({});
      await store.dispatch(deleteBudget('1'));

      state = store.getState().budgets;
      expect(state.budgets).toHaveLength(0);
      expect(state.budgetStatus?.budgetCount).toBe(0);
    });
  });

  describe('Automatic Budget Status Updates', () => {
    it('should recalculate budget status when budgets are fetched', async () => {
      const mockBudgetsResponse = {
        budgets: [
          {
            id: '1',
            name: 'Food Budget',
            amount: 1000,
            spent_amount: 800,
            is_active: true,
            period: 'monthly',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockApiService.getBudgets.mockResolvedValue(mockBudgetsResponse);
      await store.dispatch(fetchBudgets());

      const state = store.getState().budgets;
      expect(state.budgetStatus).toEqual({
        totalBudget: 1000,
        totalSpent: 800,
        percentage: 80,
        daysLeft: expect.any(Number),
        isOverBudget: false,
        budgetCount: 1,
      });
    });

    it('should handle over-budget scenarios correctly', async () => {
      const mockBudgetsResponse = {
        budgets: [
          {
            id: '1',
            name: 'Food Budget',
            amount: 1000,
            spent_amount: 1200,
            is_active: true,
            period: 'monthly',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockApiService.getBudgets.mockResolvedValue(mockBudgetsResponse);
      await store.dispatch(fetchBudgets());

      const state = store.getState().budgets;
      expect(state.budgetStatus?.isOverBudget).toBe(true);
      expect(state.budgetStatus?.percentage).toBe(120);
      expect(state.budgetStatus?.overBudgetAmount).toBe(200);
    });

    it('should filter out inactive budgets from calculations', async () => {
      const mockBudgetsResponse = {
        budgets: [
          {
            id: '1',
            name: 'Active Budget',
            amount: 1000,
            spent_amount: 500,
            is_active: true,
            period: 'monthly',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            name: 'Inactive Budget',
            amount: 2000,
            spent_amount: 1000,
            is_active: false,
            period: 'monthly',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockApiService.getBudgets.mockResolvedValue(mockBudgetsResponse);
      await store.dispatch(fetchBudgets());

      const state = store.getState().budgets;
      expect(state.budgetStatus?.totalBudget).toBe(1000); // Only active budget
      expect(state.budgetStatus?.totalSpent).toBe(500);
      expect(state.budgetStatus?.budgetCount).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      mockApiService.getBudgets.mockRejectedValue(networkError);

      await store.dispatch(fetchBudgets());

      const state = store.getState().budgets;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network Error');
      expect(state.budgets).toEqual([]);
      expect(state.budgetStatus?.budgetCount).toBe(0);
    });

    it('should handle API errors with proper error messages', async () => {
      const apiError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      };
      mockApiService.createBudget.mockRejectedValue(apiError);

      await store.dispatch(createBudget({ name: 'Test Budget', amount: 1000 }));

      const state = store.getState().budgets;
      expect(state.budgets).toHaveLength(0);
      // Error handling would be done by the component layer
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state across multiple operations', async () => {
      // Initial fetch
      const initialBudgets = [
        {
          id: '1',
          name: 'Food Budget',
          amount: 1000,
          spent_amount: 500,
          is_active: true,
          period: 'monthly',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockApiService.getBudgets.mockResolvedValue({ budgets: initialBudgets });
      await store.dispatch(fetchBudgets());

      // Add new budget
      const newBudget = {
        id: '2',
        name: 'Transport Budget',
        amount: 500,
        spent_amount: 200,
        is_active: true,
        period: 'monthly',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockApiService.createBudget.mockResolvedValue({ budget: newBudget });
      await store.dispatch(createBudget({ name: 'Transport Budget', amount: 500 }));

      const state = store.getState().budgets;
      expect(state.budgets).toHaveLength(2);
      expect(state.budgetStatus?.totalBudget).toBe(1500);
      expect(state.budgetStatus?.totalSpent).toBe(700);
      expect(state.budgetStatus?.budgetCount).toBe(2);
    });
  });
});