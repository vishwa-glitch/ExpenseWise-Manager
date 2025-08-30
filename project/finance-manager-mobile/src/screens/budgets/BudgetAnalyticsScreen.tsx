import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchWeeklyHealth } from '../../store/slices/analyticsSlice';
import { fetchBudgetAnalytics, fetchBudgetVarianceReport } from '../../store/slices/budgetAnalyticsSlice';

import { colors, typography, spacing } from '../../constants/colors';
import {
  BudgetAnalyticsSummary,
  BudgetVarianceReport,
  BudgetProgressBars,
} from '../../components/budgets';

interface BudgetAnalyticsScreenProps {
  navigation: any;
}

const BudgetAnalyticsScreen: React.FC<BudgetAnalyticsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  
  const { isAuthenticated } = useTypedSelector((state) => state.auth);
  const { profile } = useTypedSelector((state) => state.user);
  const budgetAnalytics = useTypedSelector((state: any) => state.budgetAnalytics);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchWeeklyHealth()),
        dispatch(fetchBudgetAnalytics({ period: 'current_month', months: 6 })),
        dispatch(fetchBudgetVarianceReport({ 
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          includeInactive: false 
        }))
      ]);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBudgetPress = (budgetId: string) => {
    // Navigate to budget detail
    navigation.navigate('BudgetDetail', { budgetId });
  };

  const handleCategoryPress = (categoryId: string) => {
    // Navigate to category details or show category-specific analytics
    console.log('Category pressed:', categoryId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top }
        ]}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Budget Analytics</Text>
          <Text style={styles.subtitle}>Track your financial health and spending patterns</Text>
        </View>

        {/* Budget Analytics Summary */}
        {budgetAnalytics?.analytics && (
          <BudgetAnalyticsSummary 
            analytics={budgetAnalytics.analytics}
          />
        )}

        {/* Budget Progress Bars */}
        {budgetAnalytics?.analytics?.category_performance && (
          <BudgetProgressBars 
            categoryPerformance={budgetAnalytics.analytics.category_performance}
            onCategoryPress={handleCategoryPress}
          />
        )}

        {/* Budget Variance Report */}
        {budgetAnalytics?.varianceReport && (
          <BudgetVarianceReport 
            varianceReport={budgetAnalytics.varianceReport}
            onBudgetPress={handleBudgetPress}
          />
        )}

        {/* Loading States */}
        {(budgetAnalytics?.analyticsLoading || budgetAnalytics?.varianceReportLoading) && !budgetAnalytics?.analytics && !budgetAnalytics?.varianceReport && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading budget analytics...</Text>
          </View>
        )}

        {/* Error States */}
        {budgetAnalytics?.analyticsError && !budgetAnalytics?.analytics && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load budget analytics</Text>
            <Text style={styles.errorSubtext}>{budgetAnalytics.analyticsError}</Text>
          </View>
        )}

        {budgetAnalytics?.varianceReportError && !budgetAnalytics?.varianceReport && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load variance report</Text>
            <Text style={styles.errorSubtext}>{budgetAnalytics.varianceReportError}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  errorSubtext: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

export default BudgetAnalyticsScreen;
