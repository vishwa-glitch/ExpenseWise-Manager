import React from 'react';
import { useTypedSelector } from './useTypedSelector';
import { useAppDispatch } from './useAppDispatch';
import { nextStep, completeOnboarding } from '../store/slices/onboardingSlice';
import { useNavigation } from '@react-navigation/native';
import { resetMainNavigationState } from '../utils/navigationUtils';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export const useOnboardingOverlay = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { currentStep, totalSteps, isOverlayVisible, isOnboardingComplete } = useTypedSelector(
    (state) => state.onboarding
  );

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome!',
      description: 'Tap "Add Account" to get started.',
      position: 'bottom-center',
      targetElement: 'addAccountButton',
    },
    {
      id: 'accounts',
      title: 'Add Your Account',
      description: 'Fill in your account details and tap "Create Account".',
      position: 'top-right',
    },
    {
      id: 'transactions',
      title: 'Track Spending',
      description: 'Use the + button to add transactions.',
      position: 'top-right',
      targetElement: 'addTransactionButton',
    },
    {
      id: 'calendar',
      title: 'Calendar View',
      description: 'Swipe left or tap Calendar to see your transactions by date.',
      position: 'top-right',
    },
    {
      id: 'budgets',
      title: 'Set Budgets',
      description: 'Tap + to create your first budget.',
      position: 'top-right',
      targetElement: 'addBudgetButton',
    },
    {
      id: 'categories',
      title: 'Custom Categories',
      description: 'You can make custom categories to organize your spending better.',
      position: 'top-right',
      targetElement: 'addCategoryButton',
    },
    {
      id: 'goals',
      title: 'Set Financial Goals',
      description: 'Create savings goals to track your progress towards financial milestones.',
      position: 'top-right',
      targetElement: 'addGoalButton',
    },
    {
      id: 'complete',
      title: 'All Set!',
      description: 'Now, let\'s get your finances in shape 💪💰',
      position: 'top-right',
    },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      dispatch(nextStep());
      
      // Navigate to the appropriate screen based on the next step
      const nextStepIndex = currentStep + 1;
      const nextStepData = onboardingSteps[nextStepIndex];
      
      // Add a small delay for smooth transition
      setTimeout(() => {
        switch (nextStepData.id) {
          case 'accounts':
            (navigation as any).navigate('Accounts', { screen: 'AddEditAccount' });
            break;
          case 'transactions':
            (navigation as any).navigate('Home', { screen: 'Transactions' });
            break;
          case 'calendar':
            // Navigate to Transactions and switch to Calendar tab
            (navigation as any).navigate('Home', { 
              screen: 'Transactions', 
              params: { 
                screen: 'TransactionsMain',
                params: { initialTab: 'calendar' }
              }
            });
            break;
          case 'budgets':
            // Navigate to GoalsBudget tab with budget selected
            (navigation as any).navigate('Home', { 
              screen: 'GoalsBudget', 
              params: { 
                screen: 'GoalsBudgetMain',
                params: { initialTab: 'budget' }
              }
            });
            break;
          case 'categories':
            (navigation as any).navigate('Home', { screen: 'More', params: { screen: 'Categories' } });
            break;
          case 'goals':
            // Navigate to GoalsBudget tab with goals selected
            (navigation as any).navigate('Home', { 
              screen: 'GoalsBudget', 
              params: { 
                screen: 'GoalsBudgetMain',
                params: { initialTab: 'goals' }
              }
            });
            break;
          case 'complete':
            (navigation as any).navigate('Home', { screen: 'Dashboard' });
            break;
        }
      }, 300);
    } else {
      dispatch(completeOnboarding());
      // Simply navigate to dashboard without aggressive navigation reset
      setTimeout(() => {
        (navigation as any).navigate('Home', { screen: 'Dashboard' });
      }, 300);
    }
  };

  const handleSkip = () => {
    // Skip the entire onboarding flow
    dispatch(completeOnboarding());
    // Navigate to dashboard and reset More tab navigation
    (navigation as any).navigate('Home', { screen: 'Dashboard' });
    
    // Reset More tab navigation state after a short delay
    setTimeout(() => {
      try {
        (navigation as any).navigate('Home', {
          screen: 'More',
          params: { screen: 'MoreMain' },
          initial: false,
        });
        // Navigate back to dashboard
        setTimeout(() => {
          (navigation as any).navigate('Home', { screen: 'Dashboard' });
        }, 100);
      } catch (error) {
        console.warn('⚠️ Could not reset More tab navigation:', error);
      }
    }, 500);
  };

  const handleComplete = () => {
    console.log('🎯 Onboarding overlay handleComplete called');
    dispatch(completeOnboarding());
    console.log('🎯 completeOnboarding dispatched - overlay should hide and notification screen should show');
    // Navigate to dashboard and reset More tab navigation to prevent stuck state
    setTimeout(() => {
      // First navigate to dashboard
      (navigation as any).navigate('Home', { screen: 'Dashboard' });
      
      // Then reset More tab navigation state to ensure it shows MoreMain
      setTimeout(() => {
        try {
          (navigation as any).navigate('Home', {
            screen: 'More',
            params: { screen: 'MoreMain' },
            initial: false,
          });
          // Navigate back to dashboard after resetting More tab
          setTimeout(() => {
            (navigation as any).navigate('Home', { screen: 'Dashboard' });
          }, 100);
        } catch (error) {
          console.warn('⚠️ Could not reset More tab navigation:', error);
        }
      }, 200);
    }, 300);
  };

  // Reduced debug logging to prevent performance issues
  if (!isOnboardingComplete && isOverlayVisible) {
    console.log('🎯 Onboarding active - step:', currentStep + 1, 'of', totalSteps);
  }

  // Remove the problematic useEffect that was causing continuous re-rendering

  return {
    isVisible: isOverlayVisible,
    currentStep,
    totalSteps,
    steps: onboardingSteps,
    handleNext,
    handleSkip,
    handleComplete,
  };
};
