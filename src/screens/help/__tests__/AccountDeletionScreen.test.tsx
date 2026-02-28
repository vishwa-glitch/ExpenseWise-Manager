import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AccountDeletionScreen from '../AccountDeletionScreen';

// Mock the API service
jest.mock('../../../services/api', () => ({
  apiService: {
    getDeletionInfo: jest.fn(),
    deleteUserAccount: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('AccountDeletionScreen', () => {
  const mockApiService = require('../../../services/api').apiService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockApiService.getDeletionInfo.mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    const { getByText } = render(<AccountDeletionScreen />);
    
    expect(getByText('Loading account information...')).toBeTruthy();
  });

  it('renders deletion info when loaded', async () => {
    const mockDeletionInfo = {
      deletion_warning: {
        title: 'Permanent Account Deletion',
        message: 'This action will permanently delete your account and all associated data.',
        data_summary: {
          active_accounts: 3,
          total_transactions: 150,
          active_categories: 8,
          active_budgets: 2,
          active_goals: 1,
          total_uploads: 5,
          total_bills: 3,
          active_recommendations: 2,
          unread_notifications: 1,
        },
        confirmation_requirements: {
          phrase: 'DELETE MY ACCOUNT',
          password_required: true,
        },
        alternatives: [
          'Consider exporting your data before deletion',
          'You can temporarily deactivate your account instead',
        ],
      },
    };

    mockApiService.getDeletionInfo.mockResolvedValue(mockDeletionInfo);

    const { getByText } = render(<AccountDeletionScreen />);

    await waitFor(() => {
      expect(getByText('Delete Account')).toBeTruthy();
      expect(getByText('This action is permanent and cannot be undone')).toBeTruthy();
      expect(getByText('Permanent Account Deletion')).toBeTruthy();
      expect(getByText('Data That Will Be Deleted:')).toBeTruthy();
      expect(getByText('Active Accounts')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
      expect(getByText('Before You Delete:')).toBeTruthy();
      expect(getByText('Consider exporting your data before deletion')).toBeTruthy();
    });
  });

  it('shows error alert when deletion info fails to load', async () => {
    const { alert } = require('react-native/Libraries/Alert/Alert');
    mockApiService.getDeletionInfo.mockRejectedValue(new Error('Network error'));

    render(<AccountDeletionScreen />);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(
        'Error',
        'Failed to load account deletion information. Please try again.',
        [{ text: 'OK' }]
      );
    });
  });

  it('validates confirmation phrase', async () => {
    const mockDeletionInfo = {
      deletion_warning: {
        title: 'Permanent Account Deletion',
        message: 'This action will permanently delete your account and all associated data.',
        data_summary: {
          active_accounts: 1,
          total_transactions: 10,
          active_categories: 5,
          active_budgets: 1,
          active_goals: 0,
          total_uploads: 0,
          total_bills: 0,
          active_recommendations: 0,
          unread_notifications: 0,
        },
        confirmation_requirements: {
          phrase: 'DELETE MY ACCOUNT',
          password_required: true,
        },
        alternatives: [],
      },
    };

    mockApiService.getDeletionInfo.mockResolvedValue(mockDeletionInfo);
    const { alert } = require('react-native/Libraries/Alert/Alert');

    const { getByText, getByPlaceholderText } = render(<AccountDeletionScreen />);

    await waitFor(() => {
      expect(getByText('Delete Account')).toBeTruthy();
    });

    // Fill in wrong confirmation phrase
    const confirmationInput = getByPlaceholderText('DELETE MY ACCOUNT');
    fireEvent.changeText(confirmationInput, 'WRONG PHRASE');

    // Fill in password
    const passwordInput = getByPlaceholderText('Your password');
    fireEvent.changeText(passwordInput, 'password123');

    // Try to delete
    const deleteButton = getByText('Permanently Delete Account');
    fireEvent.press(deleteButton);

    expect(alert).toHaveBeenCalledWith(
      'Invalid Confirmation',
      'Please type "DELETE MY ACCOUNT" exactly as shown to confirm deletion.',
      [{ text: 'OK' }]
    );
  });

  it('validates password is required', async () => {
    const mockDeletionInfo = {
      deletion_warning: {
        title: 'Permanent Account Deletion',
        message: 'This action will permanently delete your account and all associated data.',
        data_summary: {
          active_accounts: 1,
          total_transactions: 10,
          active_categories: 5,
          active_budgets: 1,
          active_goals: 0,
          total_uploads: 0,
          total_bills: 0,
          active_recommendations: 0,
          unread_notifications: 0,
        },
        confirmation_requirements: {
          phrase: 'DELETE MY ACCOUNT',
          password_required: true,
        },
        alternatives: [],
      },
    };

    mockApiService.getDeletionInfo.mockResolvedValue(mockDeletionInfo);
    const { alert } = require('react-native/Libraries/Alert/Alert');

    const { getByText, getByPlaceholderText } = render(<AccountDeletionScreen />);

    await waitFor(() => {
      expect(getByText('Delete Account')).toBeTruthy();
    });

    // Fill in correct confirmation phrase but no password
    const confirmationInput = getByPlaceholderText('DELETE MY ACCOUNT');
    fireEvent.changeText(confirmationInput, 'DELETE MY ACCOUNT');

    // Try to delete
    const deleteButton = getByText('Permanently Delete Account');
    fireEvent.press(deleteButton);

    expect(alert).toHaveBeenCalledWith(
      'Password Required',
      'Please enter your current password to confirm account deletion.',
      [{ text: 'OK' }]
    );
  });

  it('shows final confirmation dialog before deletion', async () => {
    const mockDeletionInfo = {
      deletion_warning: {
        title: 'Permanent Account Deletion',
        message: 'This action will permanently delete your account and all associated data.',
        data_summary: {
          active_accounts: 1,
          total_transactions: 10,
          active_categories: 5,
          active_budgets: 1,
          active_goals: 0,
          total_uploads: 0,
          total_bills: 0,
          active_recommendations: 0,
          unread_notifications: 0,
        },
        confirmation_requirements: {
          phrase: 'DELETE MY ACCOUNT',
          password_required: true,
        },
        alternatives: [],
      },
    };

    mockApiService.getDeletionInfo.mockResolvedValue(mockDeletionInfo);
    const { alert } = require('react-native/Libraries/Alert/Alert');

    const { getByText, getByPlaceholderText } = render(<AccountDeletionScreen />);

    await waitFor(() => {
      expect(getByText('Delete Account')).toBeTruthy();
    });

    // Fill in correct confirmation phrase and password
    const confirmationInput = getByPlaceholderText('DELETE MY ACCOUNT');
    fireEvent.changeText(confirmationInput, 'DELETE MY ACCOUNT');

    const passwordInput = getByPlaceholderText('Your password');
    fireEvent.changeText(passwordInput, 'password123');

    // Try to delete
    const deleteButton = getByText('Permanently Delete Account');
    fireEvent.press(deleteButton);

    expect(alert).toHaveBeenCalledWith(
      'Permanent Account Deletion',
      'This action will permanently delete your account and all associated data. This action cannot be undone. Are you absolutely sure you want to proceed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: expect.any(Function),
        },
      ]
    );
  });

  it('handles successful account deletion', async () => {
    const mockDeletionInfo = {
      deletion_warning: {
        title: 'Permanent Account Deletion',
        message: 'This action will permanently delete your account and all associated data.',
        data_summary: {
          active_accounts: 1,
          total_transactions: 10,
          active_categories: 5,
          active_budgets: 1,
          active_goals: 0,
          total_uploads: 0,
          total_bills: 0,
          active_recommendations: 0,
          unread_notifications: 0,
        },
        confirmation_requirements: {
          phrase: 'DELETE MY ACCOUNT',
          password_required: true,
        },
        alternatives: [],
      },
    };

    mockApiService.getDeletionInfo.mockResolvedValue(mockDeletionInfo);
    mockApiService.deleteUserAccount.mockResolvedValue({
      success: true,
      message: 'Account deleted successfully',
    });
    mockApiService.logout.mockResolvedValue(undefined);

    const { alert } = require('react-native/Libraries/Alert/Alert');

    const { getByText, getByPlaceholderText } = render(<AccountDeletionScreen />);

    await waitFor(() => {
      expect(getByText('Delete Account')).toBeTruthy();
    });

    // Fill in correct confirmation phrase and password
    const confirmationInput = getByPlaceholderText('DELETE MY ACCOUNT');
    fireEvent.changeText(confirmationInput, 'DELETE MY ACCOUNT');

    const passwordInput = getByPlaceholderText('Your password');
    fireEvent.changeText(passwordInput, 'password123');

    // Mock the final confirmation dialog to proceed with deletion
    alert.mockImplementation((title, message, buttons) => {
      if (title === 'Permanent Account Deletion') {
        // Find and call the delete button's onPress
        const deleteButton = buttons.find((btn: any) => btn.text === 'Delete Account');
        if (deleteButton && deleteButton.onPress) {
          deleteButton.onPress();
        }
      }
    });

    // Try to delete
    const deleteButton = getByText('Permanently Delete Account');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(mockApiService.deleteUserAccount).toHaveBeenCalledWith(
        'DELETE MY ACCOUNT',
        'password123'
      );
    });

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(
        'Account Deleted',
        'Your account and all associated data have been permanently deleted. You will be logged out.',
        [{ text: 'OK', onPress: expect.any(Function) }]
      );
    });
  });

  it('handles deletion errors appropriately', async () => {
    const mockDeletionInfo = {
      deletion_warning: {
        title: 'Permanent Account Deletion',
        message: 'This action will permanently delete your account and all associated data.',
        data_summary: {
          active_accounts: 1,
          total_transactions: 10,
          active_categories: 5,
          active_budgets: 1,
          active_goals: 0,
          total_uploads: 0,
          total_bills: 0,
          active_recommendations: 0,
          unread_notifications: 0,
        },
        confirmation_requirements: {
          phrase: 'DELETE MY ACCOUNT',
          password_required: true,
        },
        alternatives: [],
      },
    };

    mockApiService.getDeletionInfo.mockResolvedValue(mockDeletionInfo);
    mockApiService.deleteUserAccount.mockRejectedValue({
      response: {
        status: 400,
        data: { error: 'Invalid confirmation phrase' },
      },
    });

    const { alert } = require('react-native/Libraries/Alert/Alert');

    const { getByText, getByPlaceholderText } = render(<AccountDeletionScreen />);

    await waitFor(() => {
      expect(getByText('Delete Account')).toBeTruthy();
    });

    // Fill in correct confirmation phrase and password
    const confirmationInput = getByPlaceholderText('DELETE MY ACCOUNT');
    fireEvent.changeText(confirmationInput, 'DELETE MY ACCOUNT');

    const passwordInput = getByPlaceholderText('Your password');
    fireEvent.changeText(passwordInput, 'password123');

    // Mock the final confirmation dialog to proceed with deletion
    alert.mockImplementation((title, message, buttons) => {
      if (title === 'Permanent Account Deletion') {
        const deleteButton = buttons.find((btn: any) => btn.text === 'Delete Account');
        if (deleteButton && deleteButton.onPress) {
          deleteButton.onPress();
        }
      }
    });

    // Try to delete
    const deleteButton = getByText('Permanently Delete Account');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(
        'Deletion Failed',
        'Invalid confirmation phrase. Please type "DELETE MY ACCOUNT" exactly.',
        [{ text: 'OK' }]
      );
    });
  });
});
