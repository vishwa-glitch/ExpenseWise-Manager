import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, spacing } from '../../constants/colors';

interface ProgressDonutProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  centerText?: string;
  centerSubtext?: string;
  title?: string;
}

export const ProgressDonut: React.FC<ProgressDonutProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = colors.primary,
  backgroundColor = colors.surface,
  centerText,
  centerSubtext,
  title,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={[styles.chartContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        
        {(centerText || centerSubtext) && (
          <View style={styles.centerContent}>
            {centerText && <Text style={styles.centerText}>{centerText}</Text>}
            {centerSubtext && <Text style={styles.centerSubtext}>{centerSubtext}</Text>}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  chartContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centerSubtext: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});