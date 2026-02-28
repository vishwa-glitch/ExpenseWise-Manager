import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingScreen1 from '../OnboardingScreen1';
import OnboardingScreen2 from '../OnboardingScreen2';
import OnboardingScreen3 from '../OnboardingScreen3';

describe('Onboarding Screens', () => {
  describe('OnboardingScreen1', () => {
    it('renders correctly with proper content', () => {
      const mockOnNext = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByText } = render(
        <OnboardingScreen1 onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      expect(getByText('Welcome to Your Money. Crystal Clear.')).toBeTruthy();
      expect(getByText('All your accounts, budgets, and goals in one clean view. Let\'s get started!')).toBeTruthy();
      expect(getByText('Next')).toBeTruthy();
      expect(getByText('Skip')).toBeTruthy();
    });

    it('calls onNext when Next button is pressed', () => {
      const mockOnNext = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByText } = render(
        <OnboardingScreen1 onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      fireEvent.press(getByText('Next'));
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('calls onSkip when Skip button is pressed', () => {
      const mockOnNext = jest.fn();
      const mockOnSkip = jest.fn();

      const { getByText } = render(
        <OnboardingScreen1 onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      fireEvent.press(getByText('Skip'));
      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });
  });

  describe('OnboardingScreen2', () => {
    it('renders correctly with proper content', () => {
      const mockOnNext = jest.fn();
      const mockOnSkip = jest.fn();
      const mockOnBack = jest.fn();

      const { getByText } = render(
        <OnboardingScreen2 onNext={mockOnNext} onSkip={mockOnSkip} onBack={mockOnBack} />
      );

      expect(getByText('Every Transaction, Right Where It Belongs.')).toBeTruthy();
      expect(getByText('Smart categorization and a sleek calendar view keep your finances organized.')).toBeTruthy();
      expect(getByText('Next')).toBeTruthy();
      expect(getByText('Back')).toBeTruthy();
      expect(getByText('Skip')).toBeTruthy();
    });
  });

  describe('OnboardingScreen3', () => {
    it('renders correctly with proper content', () => {
      const mockOnGetStarted = jest.fn();
      const mockOnSkip = jest.fn();
      const mockOnBack = jest.fn();

      const { getByText } = render(
        <OnboardingScreen3 onGetStarted={mockOnGetStarted} onSkip={mockOnSkip} onBack={mockOnBack} />
      );

      expect(getByText('Your Data, Your Way.')).toBeTruthy();
      expect(getByText('Export reports in Excel, PDF, or CSV and stay in total control.')).toBeTruthy();
      expect(getByText('Continue to App')).toBeTruthy();
      expect(getByText('Back')).toBeTruthy();
      expect(getByText('Skip')).toBeTruthy();
    });

    it('calls onGetStarted when Get Started button is pressed', () => {
      const mockOnGetStarted = jest.fn();
      const mockOnSkip = jest.fn();
      const mockOnBack = jest.fn();

      const { getByText } = render(
        <OnboardingScreen3 onGetStarted={mockOnGetStarted} onSkip={mockOnSkip} onBack={mockOnBack} />
      );

      fireEvent.press(getByText('Continue to App'));
      expect(mockOnGetStarted).toHaveBeenCalledTimes(1);
    });
  });
});