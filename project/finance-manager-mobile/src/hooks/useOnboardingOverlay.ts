import { useTypedSelector } from './useTypedSelector';
import { useAppDispatch } from './useAppDispatch';
import { nextStep, completeOnboarding } from '../store/slices/onboardingSlice';
import { useNavigation } from '@react-navigation/native';

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
            // Navigate to Budget tab
            (navigation as any).navigate('Home', { screen: 'Budget' });
            break;
          case 'categories':
            (navigation as any).navigate('Home', { screen: 'More', params: { screen: 'Categories' } });
            break;
          case 'complete':
            (navigation as any).navigate('Home', { screen: 'Dashboard' });
            break;
        }
      }, 300);
    } else {
      dispatch(completeOnboarding());
      // Navigate back to dashboard when completing onboarding
      setTimeout(() => {
        (navigation as any).navigate('Home', { screen: 'Dashboard' });
      }, 300);
    }
  };

  const handleSkip = () => {
    // Skip the entire onboarding flow
    dispatch(completeOnboarding());
    // Optionally ensure user lands on a sensible screen
    (navigation as any).navigate('Home', { screen: 'Dashboard' });
  };

  const handleComplete = () => {
    dispatch(completeOnboarding());
    // Navigate back to dashboard when completing onboarding
    setTimeout(() => {
      (navigation as any).navigate('Home', { screen: 'Dashboard' });
    }, 300);
  };

  // Debug logging
  console.log('🎯 useOnboardingOverlay state:', {
    isOverlayVisible,
    isOnboardingComplete,
    currentStep,
    totalSteps,
    isVisible: isOverlayVisible && !isOnboardingComplete,
    currentStepId: onboardingSteps[currentStep]?.id,
  });

  return {
    isVisible: isOverlayVisible && !isOnboardingComplete,
    currentStep,
    totalSteps,
    steps: onboardingSteps,
    handleNext,
    handleSkip,
    handleComplete,
  };
};
