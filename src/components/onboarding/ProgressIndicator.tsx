import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/colors';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            index === currentStep && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default ProgressIndicator;
