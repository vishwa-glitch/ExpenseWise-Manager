import {
  calculateNextBudgetPeriod,
  shouldRenewBudget,
  isBudgetCurrentlyActive,
  getDefaultBudgetDates,
  calculateRemainingDays,
  validateBudgetDates,
} from '../budgetUtils';

describe('Budget Utils', () => {
  describe('calculateNextBudgetPeriod', () => {
    it('should calculate next monthly period correctly', () => {
      const currentStart = '2024-01-01';
      const currentEnd = '2024-01-31';
      
      const result = calculateNextBudgetPeriod(currentStart, currentEnd, 'monthly');
      
      expect(result).toEqual({
        start_date: '2024-02-01',
        end_date: '2024-02-29', // Leap year
      });
    });

    it('should calculate next weekly period correctly', () => {
      const currentStart = '2024-01-01';
      const currentEnd = '2024-01-07';
      
      const result = calculateNextBudgetPeriod(currentStart, currentEnd, 'weekly');
      
      expect(result).toEqual({
        start_date: '2024-01-08',
        end_date: '2024-01-14',
      });
    });

    it('should calculate next yearly period correctly', () => {
      const currentStart = '2024-01-01';
      const currentEnd = '2024-12-31';
      
      const result = calculateNextBudgetPeriod(currentStart, currentEnd, 'yearly');
      
      expect(result).toEqual({
        start_date: '2025-01-01',
        end_date: '2025-12-31',
      });
    });

    it('should return null for custom periods', () => {
      const result = calculateNextBudgetPeriod('2024-01-01', '2024-06-30', 'custom');
      expect(result).toBeNull();
    });
  });

  describe('shouldRenewBudget', () => {
    it('should return true when budget end date has passed', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const endDate = yesterday.toISOString().split('T')[0];
      
      const result = shouldRenewBudget(endDate, 'monthly');
      expect(result).toBe(true);
    });

    it('should return false when budget end date is in the future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endDate = tomorrow.toISOString().split('T')[0];
      
      const result = shouldRenewBudget(endDate, 'monthly');
      expect(result).toBe(false);
    });

    it('should return false for custom periods', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const endDate = yesterday.toISOString().split('T')[0];
      
      const result = shouldRenewBudget(endDate, 'custom');
      expect(result).toBe(false);
    });
  });

  describe('isBudgetCurrentlyActive', () => {
    it('should return true for budget within date range', () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 1);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 1);
      
      const result = isBudgetCurrentlyActive(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      expect(result).toBe(true);
    });

    it('should return false for budget outside date range', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);
      const dayBeforeYesterday = new Date();
      dayBeforeYesterday.setDate(yesterday.getDate() - 1);
      
      const result = isBudgetCurrentlyActive(
        dayBeforeYesterday.toISOString().split('T')[0],
        yesterday.toISOString().split('T')[0]
      );
      
      expect(result).toBe(false);
    });
  });

  describe('getDefaultBudgetDates', () => {
    it('should return correct monthly dates', () => {
      const result = getDefaultBudgetDates('monthly');
      
      expect(result).toBeDefined();
      expect(result?.start_date).toMatch(/^\d{4}-\d{2}-01$/);
      expect(result?.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return correct weekly dates', () => {
      const result = getDefaultBudgetDates('weekly');
      
      expect(result).toBeDefined();
      expect(result?.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result?.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return null for custom periods', () => {
      const result = getDefaultBudgetDates('custom');
      expect(result).toBeNull();
    });
  });

  describe('calculateRemainingDays', () => {
    it('should calculate remaining days correctly', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endDate = tomorrow.toISOString().split('T')[0];
      
      const result = calculateRemainingDays(endDate);
      expect(result).toBe(1);
    });

    it('should return 0 for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const endDate = yesterday.toISOString().split('T')[0];
      
      const result = calculateRemainingDays(endDate);
      expect(result).toBe(0);
    });
  });

  describe('validateBudgetDates', () => {
    it('should validate correct monthly dates', () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      
      const result = validateBudgetDates(startDate, endDate, 'monthly');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid date ranges', () => {
      const startDate = '2024-01-31';
      const endDate = '2024-01-01';
      
      const result = validateBudgetDates(startDate, endDate, 'monthly');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('End date must be after start date');
    });

    it('should validate custom periods with any length', () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const result = validateBudgetDates(startDate, endDate, 'custom');
      expect(result.isValid).toBe(true);
    });
  });
});
