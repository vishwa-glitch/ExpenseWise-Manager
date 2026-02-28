import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { BudgetStatusSection } from './BudgetStatusSection';
import { WeeklyFinancialHealthSection } from './WeeklyFinancialHealthSection';
import { DashboardRefreshWrapper } from './DashboardRefreshWrapper';
import { colors, spacing } from '../../constants/colors';

interface EnhancedDashboardProps {
  onBudgetPress?: () => void;
  onWeeklyHealthPress?: () => void;
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  onBudgetPress,
  onWeeklyHealthPress,
}) => {
  return (
    <DashboardRefreshWrapper>
      <View style={styles.container}>
        <BudgetStatusSection onPress={onBudgetPress} />
        <WeeklyFinancialHealthSection onPress={onWeeklyHealthPress} />
      </View>
    </DashboardRefreshWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
  },
});

// Export enhanced components for individual use
export { BudgetStatusSection, WeeklyFinancialHealthSection, DashboardRefreshWrapper };