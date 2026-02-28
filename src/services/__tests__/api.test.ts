import { apiService } from '../api';
import { BudgetStatusResponse, WeeklyHealthResponse } from '../../types/api';

// Mock axios
jest.mock('axios');
jest.mock('expo-secure-store');

describe('API Service - Budget and Financial Health Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBudgetStatus', () => {
    it('should return budget status from dedicated endpoint', async () => {
      const mockResponse: BudgetStatusResponse = {
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

      // Mock successful API call
      const mockGet = jest.fn().mockResolvedValue({ data: mockResponse });
      (apiService as any).api = { get: mockGet };

      const result = await apiService.getBudgetStatus();

      expect(mockGet).toHaveBeenCalledWith('/budgets/status');
      expect(result).toEqual(mockResponse);
    });

    it('should fallback to regular budgets endpoint when status endpoint is not available', async () => {
      const mockBudgetsResponse = {
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
          {
            id: '2',
            name: 'Transport Budget',
            amount: 1000,
            spent_amount: 800,
            is_active: true,
            period: 'monthly',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      // Mock 404 error for status endpoint, success for budgets endpoint
      const mockGet = jest.fn()
        .mockRejectedValueOnce({ response: { status: 404 } })
        .mockResolvedValueOnce({ data: mockBudgetsResponse });
      
      (apiService as any).api = { get: mockGet };
      (apiService as any).getBudgets = jest.fn().mockResolvedValue(mockBudgetsResponse);

      const result = await apiService.getBudgetStatus();

      expect(result.budgetStatus.totalBudget).toBe(3000);
      expect(result.budgetStatus.totalSpent).toBe(2000);
      expect(result.budgetStatus.percentage).toBe(67);
      expect(result.budgetStatus.budgetCount).toBe(2);
      expect(result.budgetStatus.isOverBudget).toBe(false);
      expect(result.budgets).toEqual(mockBudgetsResponse.budgets);
    });

    it('should handle over-budget scenarios correctly', async () => {
      const mockBudgetsResponse = {
        budgets: [
          {
            id: '1',
            name: 'Food Budget',
            amount: 1000,
            spent_amount: 1500,
            is_active: true,
            period: 'monthly',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      const mockGet = jest.fn().mockRejectedValueOnce({ response: { status: 404 } });
      (apiService as any).api = { get: mockGet };
      (apiService as any).getBudgets = jest.fn().mockResolvedValue(mockBudgetsResponse);

      const result = await apiService.getBudgetStatus();

      expect(result.budgetStatus.isOverBudget).toBe(true);
      expect(result.budgetStatus.overBudgetAmount).toBe(500);
      expect(result.budgetStatus.percentage).toBe(150);
    });

    it('should filter out inactive budgets', async () => {
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

      const mockGet = jest.fn().mockRejectedValueOnce({ response: { status: 404 } });
      (apiService as any).api = { get: mockGet };
      (apiService as any).getBudgets = jest.fn().mockResolvedValue(mockBudgetsResponse);

      const result = await apiService.getBudgetStatus();

      expect(result.budgetStatus.totalBudget).toBe(1000);
      expect(result.budgetStatus.totalSpent).toBe(500);
      expect(result.budgetStatus.budgetCount).toBe(1);
    });
  });

  describe('getWeeklyHealthReport', () => {
    it('should return weekly health report from dedicated endpoint', async () => {
      const mockResponse: WeeklyHealthResponse = {
        financial_health: {
          overall_score: 85,
          max_score: 100,
          achievements: [
            { type: 'success', text: 'Stayed within budget', amount: 500 },
          ],
          warnings: [
            { type: 'warning', text: 'High spending on dining' },
          ],
          issues: [],
          weekly_stats: {
            thisWeek: 1200,
            budget: 1500,
            lastWeek: 1100,
            monthlyAvg: 1250,
            overBudget: 0,
            changeFromLastWeek: 9,
            changeFromMonthlyAvg: -4,
          },
          next_week_goal: 1300,
          data_availability: {
            hasTransactions: true,
            hasBudgets: true,
            hasGoals: true,
          },
        },
        week_period: {
          start_date: '2024-01-01',
          end_date: '2024-01-07',
        },
        generated_at: '2024-01-08T00:00:00Z',
      };

      const mockGet = jest.fn().mockResolvedValue({ data: mockResponse });
      (apiService as any).api = { get: mockGet };

      const result = await apiService.getWeeklyHealthReport();

      expect(result).toEqual(mockResponse);
    });

    it('should fallback to dashboard insights when weekly report is not available', async () => {
      const mockDashboardResponse = {
        overview: {
          monthly_income: 5000,
          monthly_expenses: 3000,
          monthly_savings: 2000,
          savings_rate: 40,
          active_recommendations: 2,
          active_goals: 3,
          active_budgets: 4,
        },
        spending_trend: {
          change_percentage: 5,
          trend_direction: 'increasing',
        },
        top_categories: [],
        upcoming_bills: [],
      };

      const mockGet = jest.fn().mockRejectedValueOnce({ response: { status: 404 } });
      (apiService as any).api = { get: mockGet };
      (apiService as any).getDashboardInsights = jest.fn().mockResolvedValue(mockDashboardResponse);

      const result = await apiService.getWeeklyHealthReport();

      expect(result).not.toBeNull();
      expect(result?.financial_health.overall_score).toBeGreaterThanOrEqual(0);
      expect(result?.financial_health.overall_score).toBeLessThanOrEqual(100);
      expect(result?.financial_health.data_availability.hasTransactions).toBe(true);
      expect(result?.financial_health.data_availability.hasBudgets).toBe(true);
      expect(result?.financial_health.data_availability.hasGoals).toBe(true);
    });

    it('should return null when both endpoints are unavailable', async () => {
      const mockGet = jest.fn().mockRejectedValue({ response: { status: 404 } });
      (apiService as any).api = { get: mockGet };
      (apiService as any).getDashboardInsights = jest.fn().mockRejectedValue({ response: { status: 404 } });

      const result = await apiService.getWeeklyHealthReport();

      expect(result).toBeNull();
    });

    it('should generate appropriate health items based on spending ratio', async () => {
      const mockDashboardResponse = {
        overview: {
          monthly_income: 4000,
          monthly_expenses: 4800, // Over budget scenario
          monthly_savings: -800,
          savings_rate: -20,
          active_recommendations: 5,
          active_goals: 2,
          active_budgets: 3,
        },
        spending_trend: null,
        top_categories: [],
        upcoming_bills: [],
      };

      const mockGet = jest.fn().mockRejectedValueOnce({ response: { status: 404 } });
      (apiService as any).api = { get: mockGet };
      (apiService as any).getDashboardInsights = jest.fn().mockResolvedValue(mockDashboardResponse);

      const result = await apiService.getWeeklyHealthReport();

      expect(result?.financial_health.issues.length).toBeGreaterThan(0);
      expect(result?.financial_health.issues[0].type).toBe('error');
      expect(result?.financial_health.issues[0].text).toContain('Over budget');
    });

    it('should handle network errors properly', async () => {
      const networkError = new Error('Network Error');
      const mockGet = jest.fn().mockRejectedValue(networkError);
      (apiService as any).api = { get: mockGet };

      await expect(apiService.getWeeklyHealthReport()).rejects.toThrow('Network Error');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const apiError = { response: { status: 500, data: { message: 'Internal Server Error' } } };
      const mockGet = jest.fn().mockRejectedValue(apiError);
      (apiService as any).api = { get: mockGet };

      await expect(apiService.getWeeklyHealthReport()).rejects.toEqual(apiError);
    });

    it('should handle malformed response data', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: null });
      (apiService as any).api = { get: mockGet };

      const result = await apiService.getWeeklyHealthReport();
      expect(result).toBeNull();
    });
  });
});