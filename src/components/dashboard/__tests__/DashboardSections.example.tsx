import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BudgetStatusSection } from '../BudgetStatusSection';
import { WeeklyFinancialHealthSection } from '../WeeklyFinancialHealthSection';
import { colors, spacing } from '../../../constants/colors';

// Example usage of the new dashboard sections
export const DashboardSectionsExample = () => {
  return (
    <View style={styles.container}>
      {/* Budget Status Section Example */}
      <BudgetStatusSection 
        onPress={() => console.log('Navigate to Budgets')}
      />

      {/* Weekly Financial Health Section Example */}
      <WeeklyFinancialHealthSection 
        onPress={() => console.log('Navigate to Analytics')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
});

// This demonstrates the expected layout:
/*
┌─ Budget Status (Full width) ────────────────────┐
│ $8,500 of $12,000                               │
│ [████████░░] 71% used • 9 days left            │
└─────────────────────────────────────────────────┘

┌─ Your Weekly Financial Health ────────────────────┐
│                                                   │
│ Overall Score: 7.2/10 ⭐⭐⭐⭐⭐⭐⭐☆☆☆           │
│                                                   │
│ ✅ Stayed within budget (5/7 days)               │
│ ✅ Contributed ₹2,000 to emergency fund          │
│ ⚠️  Overspent on entertainment by ₹600           │
│ ❌ Missed car payment savings goal               │
│                                                   │
│ This Week:     ₹6,100                            │
│ Budget:        ₹5,500 (₹600 over)                │
│ Last Week:     ₹5,200 (+17%)                     │
│ Monthly Avg:   ₹5,800 (+5%)                      │
│                                                   │
│ 💡 Next Week Goal: Keep under ₹5,500             │
│                                                   │
└───────────────────────────────────────────────────┘
*/