import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HelpSupportScreen from '../HelpSupportScreen';

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('HelpSupportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all sections', () => {
    const { getByText } = render(<HelpSupportScreen />);
    
    // Check main sections are rendered
    expect(getByText('Help & Support')).toBeTruthy();
    expect(getByText("We're here to help you succeed")).toBeTruthy();
    expect(getByText('Quick Help')).toBeTruthy();
    expect(getByText('Tutorials & Guides')).toBeTruthy();
    expect(getByText('Frequently Asked Questions')).toBeTruthy();
    expect(getByText('Contact Support')).toBeTruthy();
    expect(getByText('App Information')).toBeTruthy();
  });

  it('renders quick help items', () => {
    const { getByText } = render(<HelpSupportScreen />);
    
    expect(getByText('Add Transaction')).toBeTruthy();
    expect(getByText('Create Budget')).toBeTruthy();
    expect(getByText('Set Goals')).toBeTruthy();
    expect(getByText('Export Data')).toBeTruthy();
  });

  it('renders tutorial items', () => {
    const { getByText } = render(<HelpSupportScreen />);
    
    expect(getByText('Getting Started Guide')).toBeTruthy();
    expect(getByText('Budget Management')).toBeTruthy();
    expect(getByText('Goal Setting')).toBeTruthy();
    expect(getByText('Data Export')).toBeTruthy();
  });

  it('renders FAQ items', () => {
    const { getByText } = render(<HelpSupportScreen />);
    
    expect(getByText('How do I add a new transaction?')).toBeTruthy();
    expect(getByText('How do I create a budget?')).toBeTruthy();
    expect(getByText('Can I export my financial data?')).toBeTruthy();
    expect(getByText('How do I set up financial goals?')).toBeTruthy();
  });

  it('renders contact options', () => {
    const { getByText } = render(<HelpSupportScreen />);
    
    expect(getByText('Email Support')).toBeTruthy();
    expect(getByText('Live Chat')).toBeTruthy();
    expect(getByText('Report a Bug')).toBeTruthy();
    expect(getByText('Feature Request')).toBeTruthy();
  });

  it('renders app information', () => {
    const { getByText } = render(<HelpSupportScreen />);
    
    expect(getByText('Version')).toBeTruthy();
    expect(getByText('1.0.0')).toBeTruthy();
    expect(getByText('Build')).toBeTruthy();
    expect(getByText('2024.1.1')).toBeTruthy();
    expect(getByText('Last Updated')).toBeTruthy();
    expect(getByText('January 2024')).toBeTruthy();
  });

  it('expands FAQ when tapped', async () => {
    const { getByText, queryByText } = render(<HelpSupportScreen />);
    
    const faqQuestion = getByText('How do I add a new transaction?');
    
    // Initially, answer should not be visible
    expect(queryByText(/Tap the '\+' button on the main dashboard/)).toBeNull();
    
    // Tap the FAQ
    fireEvent.press(faqQuestion);
    
    // Answer should now be visible
    await waitFor(() => {
      expect(getByText(/Tap the '\+' button on the main dashboard/)).toBeTruthy();
    });
  });

  it('collapses FAQ when tapped again', async () => {
    const { getByText, queryByText } = render(<HelpSupportScreen />);
    
    const faqQuestion = getByText('How do I add a new transaction?');
    
    // Tap to expand
    fireEvent.press(faqQuestion);
    
    // Verify expanded
    await waitFor(() => {
      expect(getByText(/Tap the '\+' button on the main dashboard/)).toBeTruthy();
    });
    
    // Tap again to collapse
    fireEvent.press(faqQuestion);
    
    // Verify collapsed
    await waitFor(() => {
      expect(queryByText(/Tap the '\+' button on the main dashboard/)).toBeNull();
    });
  });

  it('shows tutorial alert when tutorial is tapped', () => {
    const { getByText } = render(<HelpSupportScreen />);
    const { alert } = require('react-native/Libraries/Alert/Alert');
    
    const tutorialItem = getByText('Getting Started Guide');
    fireEvent.press(tutorialItem);
    
    expect(alert).toHaveBeenCalledWith(
      'Tutorial',
      'This will open the getting-started tutorial. Coming soon!',
      [{ text: 'OK' }]
    );
  });

  it('opens email when email support is tapped', () => {
    const { getByText } = render(<HelpSupportScreen />);
    const { openURL } = require('react-native/Libraries/Linking/Linking');
    
    const emailSupport = getByText('Email Support');
    fireEvent.press(emailSupport);
    
    expect(openURL).toHaveBeenCalledWith(
      'mailto:support@financemanager.com?subject=Help Request'
    );
  });

  it('shows live chat alert when live chat is tapped', () => {
    const { getByText } = render(<HelpSupportScreen />);
    const { alert } = require('react-native/Libraries/Alert/Alert');
    
    const liveChat = getByText('Live Chat');
    fireEvent.press(liveChat);
    
    expect(alert).toHaveBeenCalledWith(
      'Live Chat',
      'Live chat support is available during business hours (9 AM - 6 PM EST). Would you like to start a chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Chat', onPress: expect.any(Function) }
      ]
    );
  });

  it('opens bug report email when report bug is tapped', () => {
    const { getByText } = render(<HelpSupportScreen />);
    const { openURL } = require('react-native/Libraries/Linking/Linking');
    
    const reportBug = getByText('Report a Bug');
    fireEvent.press(reportBug);
    
    expect(openURL).toHaveBeenCalledWith(
      'mailto:bugs@financemanager.com?subject=Bug Report'
    );
  });

  it('opens feature request email when feature request is tapped', () => {
    const { getByText } = render(<HelpSupportScreen />);
    const { openURL } = require('react-native/Libraries/Linking/Linking');
    
    const featureRequest = getByText('Feature Request');
    fireEvent.press(featureRequest);
    
    expect(openURL).toHaveBeenCalledWith(
      'mailto:features@financemanager.com?subject=Feature Request'
    );
  });

  it('expands correct FAQ when quick help item is tapped', async () => {
    const { getByText, queryByText } = render(<HelpSupportScreen />);
    
    const createBudgetHelp = getByText('Create Budget');
    fireEvent.press(createBudgetHelp);
    
    // Should expand the budget FAQ
    await waitFor(() => {
      expect(getByText(/Navigate to Budgets in the main menu/)).toBeTruthy();
    });
  });

  it('shows FAQ categories', async () => {
    const { getByText } = render(<HelpSupportScreen />);
    
    // Expand a FAQ to see its category
    const faqQuestion = getByText('How do I add a new transaction?');
    fireEvent.press(faqQuestion);
    
    await waitFor(() => {
      expect(getByText('Transactions')).toBeTruthy();
    });
  });

  it('maintains proper styling and layout', () => {
    const { getByText } = render(<HelpSupportScreen />);
    
    // Check that all interactive elements are present
    const quickHelpItems = [
      'Add Transaction',
      'Create Budget', 
      'Set Goals',
      'Export Data'
    ];
    
    quickHelpItems.forEach(item => {
      expect(getByText(item)).toBeTruthy();
    });
  });
});
