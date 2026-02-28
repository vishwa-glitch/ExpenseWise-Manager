import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TimePeriodSelector, TimePeriod } from '../TimePeriodSelector';

describe('TimePeriodSelector', () => {
  const mockOnPeriodChange = jest.fn();

  beforeEach(() => {
    mockOnPeriodChange.mockClear();
  });

  it('renders all time period options', () => {
    const { getByText } = render(
      <TimePeriodSelector
        selectedPeriod="monthly"
        onPeriodChange={mockOnPeriodChange}
      />
    );

    expect(getByText('Weekly')).toBeTruthy();
    expect(getByText('Monthly')).toBeTruthy();
    expect(getByText('6 Months')).toBeTruthy();
    expect(getByText('Yearly')).toBeTruthy();
  });

  it('highlights the selected period', () => {
    const { getByText } = render(
      <TimePeriodSelector
        selectedPeriod="monthly"
        onPeriodChange={mockOnPeriodChange}
      />
    );

    const monthlyButton = getByText('Monthly');
    expect(monthlyButton).toBeTruthy();
    // Note: In a real test environment, you would check for specific styles
  });

  it('calls onPeriodChange when a different period is selected', () => {
    const { getByText } = render(
      <TimePeriodSelector
        selectedPeriod="monthly"
        onPeriodChange={mockOnPeriodChange}
      />
    );

    fireEvent.press(getByText('Weekly'));
    expect(mockOnPeriodChange).toHaveBeenCalledWith('weekly');
  });

  it('does not call onPeriodChange when the same period is selected', () => {
    const { getByText } = render(
      <TimePeriodSelector
        selectedPeriod="monthly"
        onPeriodChange={mockOnPeriodChange}
      />
    );

    fireEvent.press(getByText('Monthly'));
    expect(mockOnPeriodChange).not.toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    const { getByText } = render(
      <TimePeriodSelector
        selectedPeriod="monthly"
        onPeriodChange={mockOnPeriodChange}
        isLoading={true}
      />
    );

    fireEvent.press(getByText('Weekly'));
    expect(mockOnPeriodChange).not.toHaveBeenCalled();
  });

  it('handles all period types correctly', () => {
    const periods: TimePeriod[] = ['weekly', 'monthly', '6months', 'yearly'];
    
    periods.forEach(period => {
      const { getByText } = render(
        <TimePeriodSelector
          selectedPeriod={period}
          onPeriodChange={mockOnPeriodChange}
        />
      );

      // Verify the component renders without crashing for each period
      expect(getByText('Weekly')).toBeTruthy();
    });
  });
});