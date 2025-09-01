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
      description: 'Tap any date to see daily transactions.',
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
      id: 'goals',
      title: 'Financial Goals',
      description: 'Set goals and watch your progress grow!',
      position: 'top-right',
    },
    {
      id: 'categories',
      title: 'Custom Categories',
      description: 'Create categories like "Netflix" or "Coffee".',
      position: 'top-right',
      targetElement: 'addCategoryButton',
    },
    {
      id: 'complete',
      title: 'All Set!',
      description: 'You\'re ready to manage your finances.',
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
            // Navigate to Transactions and then programmatically switch to Calendar tab
            (navigation as any).navigate('Home', { screen: 'Transactions' });
            // We'll handle the tab switch in the TransactionsNavigator
            break;
          case 'budgets':
            // Navigate to Budget tab
            (navigation as any).navigate('Home', { screen: 'Budget' });
            break;
          case 'goals':
            // Goals navigation removed for now - functionality kept for future use
            (navigation as any).navigate('Home', { screen: 'Dashboard' });
            break;
          case 'categories':
            (navigation as any).navigate('Home', { screen: 'More' });
            break;
          case 'complete':
            (navigation as any).navigate('Home', { screen: 'Dashboard' });
            break;
        }
      }, 300);
    } else {
      dispatch(completeOnboarding());
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
  };

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
