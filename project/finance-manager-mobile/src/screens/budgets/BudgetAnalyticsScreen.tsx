import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchWeeklyHealth } from '../../store/slices/analyticsSlice';
import { WeeklyFinancialHealthSection } from '../../components/dashboard/WeeklyFinancialHealthSection';

import { colors, typography, spacing } from '../../constants/colors';


interface BudgetAnalyticsScreenProps {
  navigation: any;
}

const BudgetAnalyticsScreen: React.FC<BudgetAnalyticsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useTypedSelector((state) => state.auth);
  const { profile } = useTypedSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch weekly health data for analytics
      dispatch(fetchWeeklyHealth());
    }
  }, [isAuthenticated, dispatch]);

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
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Budget Analytics</Text>
            <Text style={styles.subtitle}>Track your financial health and spending patterns</Text>
          </View>

          {/* Weekly Financial Health Section */}
          <WeeklyFinancialHealthSection 
            onPress={undefined}
          />
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
});

export default BudgetAnalyticsScreen;
