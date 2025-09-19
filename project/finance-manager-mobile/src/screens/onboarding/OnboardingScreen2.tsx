import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

interface OnboardingScreen2Props {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({ onNext, onSkip, onBack }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Skip button */}
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Placeholder for illustration - you'll add this later */}
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.placeholderText}>📊</Text>
          </View>

          <Text style={styles.headline}>Every Transaction, Right Where It Belongs.</Text>
          <Text style={styles.subline}>
            Smart categorization and a sleek calendar view keep your finances organized.
          </Text>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          {/* Progress indicators */}
          <View style={styles.progressContainer}>
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.activeDot]} />
            <View style={styles.progressDot} />
          </View>

          {/* Navigation buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.arrow}>←</Text>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={onNext}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  skipText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  illustrationPlaceholder: {
    width: width * 0.6,
    height: height * 0.3,
    backgroundColor: colors.surface,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  placeholderText: {
    fontSize: 80,
  },
  headline: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  bottomSection: {
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  backButton: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  backButtonText: {
    ...typography.button,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  nextButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  nextButtonText: {
    ...typography.button,
    color: colors.white,
    marginRight: spacing.sm,
  },
  arrow: {
    ...typography.button,
    color: colors.white,
  },
});

export default OnboardingScreen2;