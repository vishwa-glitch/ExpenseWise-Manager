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
import { fetchBudgetAnalytics } from '../../store/slices/budgetAnalyticsSlice';

import { colors, typography, spacing } from '../../constants/colors';
import { SimplifiedBudgetAnalytics } from '../../components/budgets';

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
        dispatch(fetchBudgetAnalytics({ period: 'current_month', months: 1 })),
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
          <Text style={styles.title}>Budget Overview</Text>
          <Text style={styles.subtitle}>Simple insights into your budget performance</Text>
        </View>

        {/* Simplified Budget Analytics */}
        {budgetAnalytics?.analytics && (
          <SimplifiedBudgetAnalytics 
            analytics={budgetAnalytics.analytics}
          />
        )}

        {/* Loading States */}
        {budgetAnalytics?.analyticsLoading && !budgetAnalytics?.analytics && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading budget overview...</Text>
          </View>
        )}

        {/* Error States */}
        {budgetAnalytics?.analyticsError && !budgetAnalytics?.analytics && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load budget overview</Text>
            <Text style={styles.errorSubtext}>{budgetAnalytics.analyticsError}</Text>
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
