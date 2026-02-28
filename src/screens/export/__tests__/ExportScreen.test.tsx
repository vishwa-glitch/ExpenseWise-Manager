import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ExportScreen from '../ExportScreen';
import authReducer from '../../../store/slices/authSlice';
import userReducer from '../../../store/slices/userSlice';
import uiReducer from '../../../store/slices/uiSlice';

// Mock the API service
jest.mock('../../../services/api', () => ({
  apiService: {
    exportTransactions: jest.fn(),
  },
}));

// Mock expo modules
jest.mock('expo-file-system', () => ({
  documentDirectory: '/test/directory/',
  writeAsStringAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(),
}));

// DateTimePicker is no longer used - using custom implementation

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      user: userReducer,
      ui: uiReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        ...initialState.auth,
      },
      user: {
        profile: {
          id: '1',
          email: 'test@example.com',
          subscription_tier: 'premium',
          stats: {
            monthly_exports: 0,
          },
        },
        ...initialState.user,
      },
      ui: {
        showPremiumModal: false,
        ...initialState.ui,
      },
    },
  });
};

describe('ExportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const store = createTestStore();
    
    const { getByText } = render(
      <Provider store={store}>
        <ExportScreen navigation={mockNavigation} />
      </Provider>
    );

    expect(getByText('Export Transactions')).toBeTruthy();
    expect(getByText('Export Format')).toBeTruthy();
    expect(getByText('Date Range')).toBeTruthy();
    expect(getByText('Export Summary')).toBeTruthy();
  });

  it('shows export limit info for free users', () => {
    const store = createTestStore({
      user: {
        profile: {
          id: '1',
          email: 'test@example.com',
          subscription_tier: 'free',
          stats: {
            monthly_exports: 1,
          },
        },
      },
    });
    
    const { getByText } = render(
      <Provider store={store}>
        <ExportScreen navigation={mockNavigation} />
      </Provider>
    );

    expect(getByText('0 of 1 monthly exports remaining')).toBeTruthy();
  });

  it('shows unlimited exports for premium users', () => {
    const store = createTestStore({
      user: {
        profile: {
          id: '1',
          email: 'test@example.com',
          subscription_tier: 'premium',
          stats: {
            monthly_exports: 5,
          },
        },
      },
    });
    
    const { getByText } = render(
      <Provider store={store}>
        <ExportScreen navigation={mockNavigation} />
      </Provider>
    );

    expect(getByText('Unlimited exports available')).toBeTruthy();
  });

  it('allows format selection', () => {
    const store = createTestStore();
    
    const { getByText } = render(
      <Provider store={store}>
        <ExportScreen navigation={mockNavigation} />
      </Provider>
    );

    const csvOption = getByText('CSV');
    fireEvent.press(csvOption);
    
    // Should show CSV as selected in summary
    expect(getByText('CSV')).toBeTruthy();
  });

  it('navigates back when back button is pressed', () => {
    const store = createTestStore();
    
    const { getByText } = render(
      <Provider store={store}>
        <ExportScreen navigation={mockNavigation} />
      </Provider>
    );

    const backButton = getByText('‹');
    fireEvent.press(backButton);
    
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
