import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { nextStep, hideOverlay, skipOnboarding } from '../../store/slices/onboardingSlice';
import { colors, typography, spacing } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    title: 'Welcome! 👋',
    description: 'Let\'s take a quick tour of your new finance manager. This will only take a minute!',
    position: 'center',
  },
  {
    title: 'Dashboard 🏡',
    description: 'Your financial overview at a glance. See your balance, recent transactions, and spending insights.',
    position: 'bottom',
  },
  {
    title: 'Add Accounts 💳',
    description: 'Track multiple accounts like checking, savings, credit cards, and more.',
    position: 'top',
  },
  {
    title: 'Track Transactions 📄',
    description: 'Record your income and expenses. Categorize them to understand your spending habits.',
    position: 'bottom',
  },
  {
    title: 'Set Budgets 🎯',
    description: 'Create budgets for different categories and track your progress throughout the month.',
    position: 'bottom',
  },
  {
    title: 'Create Goals 🌟',
    description: 'Set savings goals and watch your progress. Stay motivated to reach your financial targets!',
    position: 'bottom',
  },
  {
    title: 'View Analytics 📊',
    description: 'Get insights into your spending patterns with beautiful charts and reports.',
    position: 'bottom',
  },
  {
    title: 'You\'re All Set! 🎉',
    description: 'Start managing your finances like a pro. You can always access help from the More menu.',
    position: 'center',
  },
];

const OnboardingOverlay: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOverlayVisible, currentStep, totalSteps } = useTypedSelector(
    (state) => state.onboarding
  );

  const currentStepData = ONBOARDING_STEPS[currentStep] || ONBOARDING_STEPS[0];
  const isLastStep = currentStep >= totalSteps - 1;

  // Debug logging
  useEffect(() => {
    console.log('🎯 OnboardingOverlay state:', {
      isOverlayVisible,
      currentStep,
      totalSteps,
    });
  }, [isOverlayVisible, currentStep, totalSteps]);

  const handleNext = () => {
    if (isLastStep) {
      dispatch(skipOnboarding());
    } else {
      dispatch(nextStep());
    }
  };

  const handleSkip = () => {
    dispatch(skipOnboarding());
  };

  if (!isOverlayVisible) {
    return null;
  }

  return (
    <Modal
      visible={isOverlayVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.backdrop} />
        
        <View style={[
          styles.tooltipContainer,
          currentStepData.position === 'center' && styles.tooltipCenter,
          currentStepData.position === 'top' && styles.tooltipTop,
          currentStepData.position === 'bottom' && styles.tooltipBottom,
        ]}>
          <View style={styles.tooltip}>
            <View style={styles.header}>
              <Text style={styles.stepIndicator}>
                Step {currentStep + 1} of {totalSteps}
              </Text>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>

            <View style={styles.footer}>
              <View style={styles.progressDots}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentStep && styles.dotActive,
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
                  {isLastStep ? 'Get Started' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  tooltipContainer: {
    width: width - spacing.xl * 2,
    maxWidth: 400,
  },
  tooltipCenter: {
    justifyContent: 'center',
  },
  tooltipTop: {
    position: 'absolute',
    top: 100,
  },
  tooltipBottom: {
    position: 'absolute',
    bottom: 120,
  },
  tooltip: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepIndicator: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  skipButton: {
    padding: spacing.xs,
  },
  skipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 14,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
    fontSize: 24,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  nextButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OnboardingOverlay;
