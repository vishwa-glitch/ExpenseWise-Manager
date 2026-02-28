import { isGoalContribution, getGoalContributionDisplayName, getGoalContributionIcon, getGoalContributionColor } from './goalUtils';

describe('goalUtils', () => {
  describe('isGoalContribution', () => {
    it('should return true for transactions with goal-contribution tag', () => {
      const transaction = {
        id: '1',
        description: 'Some transaction',
        tags: ['goal-contribution'],
        category_name: 'Uncategorized'
      };
      
      expect(isGoalContribution(transaction)).toBe(true);
    });

    it('should return true for transactions with goal contribution in description', () => {
      const transaction = {
        id: '1',
        description: 'Goal contribution for vacation',
        category_name: 'Uncategorized'
      };
      
      expect(isGoalContribution(transaction)).toBe(true);
    });

    it('should return true for transactions with Goal Contribution category', () => {
      const transaction = {
        id: '1',
        description: 'Some transaction',
        category_name: 'Goal Contribution'
      };
      
      expect(isGoalContribution(transaction)).toBe(true);
    });

    it('should return false for regular transactions', () => {
      const transaction = {
        id: '1',
        description: 'Grocery shopping',
        category_name: 'Food & Dining'
      };
      
      expect(isGoalContribution(transaction)).toBe(false);
    });

    it('should return false for null/undefined transactions', () => {
      expect(isGoalContribution(null)).toBe(false);
      expect(isGoalContribution(undefined)).toBe(false);
    });
  });

  describe('getGoalContributionDisplayName', () => {
    it('should return "Goal Contribution" for goal contribution transactions', () => {
      const transaction = {
        id: '1',
        description: 'Goal contribution',
        tags: ['goal-contribution']
      };
      
      expect(getGoalContributionDisplayName(transaction)).toBe('Goal Contribution');
    });

    it('should return category name for regular transactions', () => {
      const transaction = {
        id: '1',
        description: 'Grocery shopping',
        category_name: 'Food & Dining'
      };
      
      expect(getGoalContributionDisplayName(transaction)).toBe('Food & Dining');
    });

    it('should return "Uncategorized" for transactions without category', () => {
      const transaction = {
        id: '1',
        description: 'Some transaction'
      };
      
      expect(getGoalContributionDisplayName(transaction)).toBe('Uncategorized');
    });
  });

  describe('getGoalContributionIcon', () => {
    it('should return the target emoji', () => {
      expect(getGoalContributionIcon()).toBe('🎯');
    });
  });

  describe('getGoalContributionColor', () => {
    it('should return the green color', () => {
      expect(getGoalContributionColor()).toBe('#4CAF50');
    });
  });
});

