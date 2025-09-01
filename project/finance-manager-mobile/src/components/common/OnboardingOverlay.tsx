import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // ID of the element to highlight
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

interface OnboardingOverlayProps {
  isVisible: boolean;
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  isVisible,
  currentStep,
  totalSteps,
  steps,
  onNext,
  onSkip,
  onComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Auto-dismiss timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible) {
      timer = setTimeout(() => {
        onSkip(); // Auto-dismiss by skipping to next step
      }, 8000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, onSkip]);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, scaleAnim]);

  if (!isVisible || currentStep >= steps.length) {
    return null;
  }

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Always anchor the overlay to the bottom-center for thumb reach
  const getPositionStyles = () => {
    return {
      top: undefined,
      bottom: spacing.xl,
      left: spacing.xl,
      right: spacing.xl,
      width: undefined,
      height: 128,
    };
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Semi-transparent overlay - allows interaction */}
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1}
          onPress={() => {}} // Empty onPress to allow touch events to pass through
        />
        
        {/* Overlay */}
        <Animated.View
          style={[
            styles.quarterCircleContainer,
            getPositionStyles(),
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#4A90E2', '#9B59B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={currentStepData.position === 'bottom-center' ? styles.quarterCircle : styles.quarterCircle}
          >
            <View style={styles.content}>
              {/* Progress indicator */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Step {currentStep + 1} of {totalSteps}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${((currentStep + 1) / totalSteps) * 100}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Content */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>{currentStepData.title}</Text>
                <Text style={styles.description}>{currentStepData.description}</Text>
              </View>

              {/* Action buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={isLastStep ? onComplete : onNext}
                >
                  <Text style={styles.nextButtonText}>
                    {isLastStep ? 'Get Started' : 'Next'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  quarterCircleContainer: {
    position: 'absolute',
    zIndex: 1001,
  },
  quarterCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 88, // 110 * 0.8 = 88
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    padding: spacing.sm, // Reduced from spacing.md
    justifyContent: 'space-between',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressText: {
    color: colors.background,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  progressBar: {
    width: 120,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.background,
    borderRadius: 2,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.background,
    fontSize: 14, // Reduced from 16
    fontWeight: 'bold',
    marginBottom: spacing.xs, // Reduced from spacing.sm
    textAlign: 'center',
  },
  description: {
    color: colors.background,
    fontSize: 11, // Reduced from 13
    lineHeight: 16, // Reduced from 18
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm, // Reduced from spacing.md
  },
  skipButton: {
    paddingVertical: spacing.xs, // Reduced from spacing.sm
    paddingHorizontal: spacing.sm, // Reduced from spacing.md
  },
  skipButtonText: {
    color: colors.background,
    fontSize: 12, // Reduced from typography.body.fontSize
    opacity: 0.8,
  },
  nextButton: {
    backgroundColor: colors.background,
    paddingVertical: spacing.xs, // Reduced from spacing.sm
    paddingHorizontal: spacing.md, // Reduced from spacing.lg
    borderRadius: spacing.xs, // Reduced from spacing.sm
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonText: {
    color: colors.primary,
    fontSize: 12, // Reduced from typography.body.fontSize
    fontWeight: '600',
  },
});

export default OnboardingOverlay;
