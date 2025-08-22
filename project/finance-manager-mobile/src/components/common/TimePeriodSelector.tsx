import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';
import { buttonStyles, textStyles, accessibilityHelpers } from '../../utils/styleUtils';

export type TimePeriod = 'weekly' | 'monthly' | '6months' | 'yearly';

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  isLoading?: boolean;
}

interface PeriodOption {
  key: TimePeriod;
  label: string;
  shortLabel: string;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { key: 'weekly', label: 'Weekly', shortLabel: '1W' },
  { key: 'monthly', label: 'Monthly', shortLabel: '1M' },
  { key: '6months', label: '6 Months', shortLabel: '6M' },
  { key: 'yearly', label: 'Yearly', shortLabel: '1Y' },
];

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  isLoading = false,
}) => {
  const handlePeriodPress = (period: TimePeriod) => {
    if (!isLoading && period !== selectedPeriod) {
      onPeriodChange(period);
    }
  };

  const renderPeriodButton = (option: PeriodOption) => {
    const isSelected = option.key === selectedPeriod;
    const isDisabled = isLoading;
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      if (!isDisabled) {
        Animated.spring(scaleValue, {
          toValue: 0.95,
          useNativeDriver: true,
        }).start();
      }
    };

    const handlePressOut = () => {
      if (!isDisabled) {
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    };

    return (
      <TouchableOpacity
        key={option.key}
        style={[
          styles.periodButton,
          isSelected && styles.selectedButton,
          isDisabled && styles.disabledButton,
        ]}
        onPress={() => handlePeriodPress(option.key)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={isDisabled}
      >
        <Animated.View 
          style={[
            styles.buttonContent,
            { transform: [{ scale: scaleValue }] }
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              isSelected && styles.selectedButtonText,
              isDisabled && styles.disabledButtonText,
            ]}
          >
            {option.label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {PERIOD_OPTIONS.map(renderPeriodButton)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  periodButton: {
    ...buttonStyles.outline,
    borderRadius: 20,
    marginRight: spacing.sm,
    minWidth: 80,
    minHeight: 36,
    paddingVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    ...accessibilityHelpers.minTouchTarget,
  },
  selectedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  selectedButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
});