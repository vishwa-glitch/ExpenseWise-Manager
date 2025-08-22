import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface GoalProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  style?: any;
}

export const GoalProgressBar: React.FC<GoalProgressBarProps> = ({
  progress,
  height = 12,
  showPercentage = true,
  color = colors.primary,
  backgroundColor = colors.surface,
  style,
}) => {
  // Ensure progress is between 0 and 100
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  
  // Determine color based on progress
  const getColorByProgress = () => {
    if (safeProgress >= 100) return colors.success;
    if (safeProgress >= 75) return colors.primary;
    if (safeProgress >= 50) return colors.warning;
    return colors.accent;
  };

  const progressColor = color || getColorByProgress();

  return (
    <View style={[styles.container, style]}>
      <View 
        style={[
          styles.progressBar, 
          { 
            height, 
            backgroundColor 
          }
        ]}
      >
        <View 
          style={[
            styles.progress, 
            { 
              width: `${safeProgress}%`,
              height,
              backgroundColor: progressColor
            }
          ]}
        />
      </View>
      
      {showPercentage && (
        <Text style={styles.percentage}>
          {safeProgress.toFixed(1)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 6,
  },
  percentage: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginLeft: spacing.md,
    minWidth: 50,
    textAlign: 'right',
  },
});