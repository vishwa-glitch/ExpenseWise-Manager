import React from 'react';
import { render, screen } from '@testing-library/react-native';
import BudgetAnalyticsSummary from '../BudgetAnalyticsSummary';

const mockAnalytics = {
  summary: {
    total_budgets: 5,
    active_budgets: 4,
    total_budget_amount: 2500.00,
    total_spent_amount: 1800.50,
    total_remaining_amount: 699.50,
    avg_alert_threshold: 0.8
  },
  category_performance: [],
  monthly_trends: [],
  efficiency_metrics: {
    overall_efficiency: 72.0,
    budgets_on_track: 3,
    budgets_at_risk: 1,
    budgets_over_limit: 0,
    avg_variance_percentage: -15.2
  },
  period: "current_month",
  analysis_date: "2024-12-20T10:30:00.000Z"
};

describe('BudgetAnalyticsSummary', () => {
  it('renders budget overview title', () => {
    render(<BudgetAnalyticsSummary analytics={mockAnalytics} />);
    expect(screen.getByText('Budget Overview')).toBeTruthy();
  });

  it('displays total budget amount', () => {
    render(<BudgetAnalyticsSummary analytics={mockAnalytics} />);
    expect(screen.getByText('$2,500')).toBeTruthy();
  });

  it('displays total spent amount', () => {
    render(<BudgetAnalyticsSummary analytics={mockAnalytics} />);
    expect(screen.getByText('$1,801')).toBeTruthy();
  });

  it('displays remaining amount', () => {
    render(<BudgetAnalyticsSummary analytics={mockAnalytics} />);
    expect(screen.getByText('$700')).toBeTruthy();
  });

  it('displays efficiency percentage', () => {
    render(<BudgetAnalyticsSummary analytics={mockAnalytics} />);
    expect(screen.getByText('72.0%')).toBeTruthy();
  });

  it('displays active budgets count', () => {
    render(<BudgetAnalyticsSummary analytics={mockAnalytics} />);
    expect(screen.getByText('4 active budgets')).toBeTruthy();
  });

  it('displays status summary', () => {
    render(<BudgetAnalyticsSummary analytics={mockAnalytics} />);
    expect(screen.getByText('3 On Track')).toBeTruthy();
    expect(screen.getByText('1 At Risk')).toBeTruthy();
    expect(screen.getByText('0 Over Limit')).toBeTruthy();
  });
});
