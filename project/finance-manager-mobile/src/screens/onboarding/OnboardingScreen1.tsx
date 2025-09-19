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

interface OnboardingScreen1Props {
  onNext: () => void;
}

const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({ onNext }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Large illustration area */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.placeholderText}>💰</Text>
          </View>
        </View>

        {/* Bottom section with text and navigation */}
        <View style={styles.bottomSection}>
          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.headline}>
              Welcome to{'\n'}
              your <Text style={styles.highlightText}>world</Text> of{'\n'}
              <Text style={styles.highlightText}>financial growth</Text>
            </Text>
            <Text style={styles.subline}>
              Take control of your finances with smart tracking and insightful analytics.
            </Text>
          </View>

          {/* Navigation section */}
          <View style={styles.navigationContainer}>
            {/* Progress indicators */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressDot, styles.activeDot]} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
            </View>

            {/* Arrow button */}
            <TouchableOpacity style={styles.arrowButton} onPress={onNext}>
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
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  illustrationPlaceholder: {
    width: width * 0.7,
    height: height * 0.4,
    backgroundColor: colors.surface,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 100,
  },
  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  textContainer: {
    marginBottom: spacing.xl,
  },
  headline: {
    ...typography.h1,
    fontSize: 32,
    color: colors.text,
    textAlign: 'left',
    lineHeight: 40,
    fontWeight: '300',
  },
  highlightText: {
    color: colors.primary,
    fontWeight: '600',
  },
  subline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'left',
    lineHeight: 24,
    fontSize: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    marginRight: spacing.sm,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  arrow: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen1;