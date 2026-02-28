import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BarChart } from '../BarChart';

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => ({
  BarChart: ({ data, title }: any) => <div testID="bar-chart">{title}</div>,
}));

describe('BarChart', () => {
  const mockData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        data: [1000, 2000, 1500, 3000],
        color: (opacity = 1) => `rgba(46, 125, 87, ${opacity})`,
      },
    ],
  };

  const defaultProps = {
    data: mockData,
    title: 'Test Bar Chart',
  };

  it('renders correctly with valid data', () => {
    const { getByText, getByTestId } = render(<BarChart {...defaultProps} />);
    
    expect(getByText('Test Bar Chart')).toBeTruthy();
    expect(getByTestId('bar-chart')).toBeTruthy();
  });

  it('shows loading state when isLoading is true', () => {
    const { getByText } = render(<BarChart {...defaultProps} isLoading={true} />);
    
    expect(getByText('Loading chart data...')).toBeTruthy();
  });

  it('shows empty state when data is empty', () => {
    const emptyData = {
      labels: [],
      datasets: [{ data: [] }],
    };
    
    const { getByText } = render(<BarChart data={emptyData} title="Empty Chart" />);
    
    expect(getByText('No Data Available')).toBeTruthy();
    expect(getByText('No data found for the selected period.')).toBeTruthy();
  });

  it('shows empty state when all data values are zero', () => {
    const zeroData = {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{ data: [0, 0, 0] }],
    };
    
    const { getByText } = render(<BarChart data={zeroData} title="Zero Chart" />);
    
    expect(getByText('No Data Available')).toBeTruthy();
  });

  it('calls onRefresh when refresh button is pressed', () => {
    const mockOnRefresh = jest.fn();
    const emptyData = {
      labels: [],
      datasets: [{ data: [] }],
    };
    
    const { getByText } = render(
      <BarChart data={emptyData} title="Empty Chart" onRefresh={mockOnRefresh} />
    );
    
    const refreshButton = getByText('Refresh');
    fireEvent.press(refreshButton);
    
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('displays time period subtitle when provided', () => {
    const { getByText } = render(
      <BarChart {...defaultProps} timePeriod="monthly" />
    );
    
    expect(getByText('Last 30 days')).toBeTruthy();
  });

  it('displays correct subtitle for different time periods', () => {
    const { rerender, getByText } = render(
      <BarChart {...defaultProps} timePeriod="weekly" />
    );
    expect(getByText('Last 7 days')).toBeTruthy();

    rerender(<BarChart {...defaultProps} timePeriod="6months" />);
    expect(getByText('Last 6 months')).toBeTruthy();

    rerender(<BarChart {...defaultProps} timePeriod="yearly" />);
    expect(getByText('Last 12 months')).toBeTruthy();
  });

  it('renders without title when not provided', () => {
    const { queryByText } = render(<BarChart data={mockData} />);
    
    expect(queryByText('Test Bar Chart')).toBeNull();
  });

  it('handles malformed data gracefully', () => {
    const malformedData = {
      labels: ['Jan', 'Feb'],
      datasets: [{ data: [null, undefined, 'invalid'] as any }],
    };
    
    const { getByText } = render(<BarChart data={malformedData} title="Malformed Chart" />);
    
    expect(getByText('No Data Available')).toBeTruthy();
  });
});