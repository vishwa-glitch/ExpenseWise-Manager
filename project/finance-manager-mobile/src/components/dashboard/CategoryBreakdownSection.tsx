import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { SectionHeader } from '../common/SectionHeader';
import { PieChart } from '../charts/PieChart';
import { FadeInView } from '../common/FadeInView';
import { ChartLoadingSkeleton } from '../common/LoadingSkeleton';
import { colors, typography, spacing } from '../../constants/colors';
import { fetchCategoryBreakdown } from '../../store/slices/analyticsSlice';
import { formatCurrency } from '../../utils/currency';

interface CategoryBreakdownSectionProps {
  dashboardInsights: any;
  isLoading: boolean;
  onRefresh: () => void;
}

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export const CategoryBreakdownSection: React.FC<CategoryBreakdownSectionProps> = ({
  dashboardInsights,
  isLoading,
  onRefresh,
}) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const { categoryBreakdown } = useTypedSelector((state) => state.analytics);
  const { displayCurrency } = useTypedSelector((state) => state.user);

  // Fetch category breakdown data when component mounts
  useEffect(() => {
    const loadCategoryBreakdown = async () => {
      try {
        // Get current date range for the last 30 days
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        await dispatch(fetchCategoryBreakdown({ startDate, endDate })).unwrap();
      } catch (error) {
        console.error('❌ Failed to load category breakdown:', error);
        // Don't show error to user, just log it
      }
    };
    
    loadCategoryBreakdown();
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    onRefresh();
    setRefreshing(false);
  };

  const getCategoryBreakdownData = (): CategoryData[] => {
    try {
      // Check if we have dashboard insights with categories
      if (dashboardInsights?.top_categories && Array.isArray(dashboardInsights.top_categories)) {
        const validCategories = dashboardInsights.top_categories.filter(
          (category: any) => category && typeof category.amount === 'number' && category.amount > 0
        );
        
        if (validCategories.length > 0) {
          return validCategories.map((category: any, index: number) => ({
            name: category?.name || 'Unknown',
            amount: category?.amount || 0,
            color: colors.categories[index % colors.categories.length],
            legendFontColor: colors.text,
            legendFontSize: 12,
          }));
        }
      }
      
      // Check if we have category breakdown data
      if (categoryBreakdown && Array.isArray(categoryBreakdown)) {
        const validCategories = categoryBreakdown.filter(
          (category: any) => category && typeof category.amount === 'number' && category.amount > 0
        );
        
        if (validCategories.length > 0) {
          return validCategories.map((category: any, index: number) => ({
            name: category?.name || 'Unknown',
            amount: category?.amount || 0,
            color: colors.categories[index % colors.categories.length],
            legendFontColor: colors.text,
            legendFontSize: 12,
          }));
        }
      }
      
      // Check if categoryBreakdown is an object with breakdown property
      if (categoryBreakdown && typeof categoryBreakdown === 'object' && !Array.isArray(categoryBreakdown) && (categoryBreakdown as any).breakdown) {
        const breakdownArray = Array.isArray((categoryBreakdown as any).breakdown) ? (categoryBreakdown as any).breakdown : [];
        const validCategories = breakdownArray.filter(
          (category: any) => category && typeof category.amount === 'number' && category.amount > 0
        );
        
        if (validCategories.length > 0) {
          return validCategories.map((category: any, index: number) => ({
            name: category?.name || 'Unknown',
            amount: category?.amount || 0,
            color: colors.categories[index % colors.categories.length],
            legendFontColor: colors.text,
            legendFontSize: 12,
          }));
        }
      }
      
      // Check if dashboardInsights has categories in a different structure
      if (dashboardInsights?.categories && Array.isArray(dashboardInsights.categories)) {
        const validCategories = dashboardInsights.categories.filter(
          (category: any) => category && typeof category.amount === 'number' && category.amount > 0
        );
        
        if (validCategories.length > 0) {
          return validCategories.map((category: any, index: number) => ({
            name: category?.name || 'Unknown',
            amount: category?.amount || 0,
            color: colors.categories[index % colors.categories.length],
            legendFontColor: colors.text,
            legendFontSize: 12,
          }));
        }
      }
      
      // Return empty array if no real data available
      return [];
    } catch (error) {
      console.error('Error processing category breakdown data:', error);
      return [];
    }
  };



  const categoryData = getCategoryBreakdownData();
  const hasCategoryData = categoryData.length > 0;
  const totalAmount = categoryData.reduce((sum, category) => sum + category.amount, 0);

  const renderCategoryContent = () => {
    if (isLoading && !hasCategoryData) {
      return (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIndicator}>
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
          <ChartLoadingSkeleton type="pie" />
        </View>
      );
    }

    if (!hasCategoryData && !isLoading) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No Category Data Available</Text>
          <Text style={styles.emptyMessage}>
            Category breakdown data is not available. This could be because:{'\n'}
            • No transactions have been added yet{'\n'}
            • The analytics service is not available{'\n'}
            • There are no categorized transactions in the selected period
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Refresh Data</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FadeInView>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Spending</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(totalAmount, displayCurrency)}
          </Text>
        </View>
        
        <PieChart
          data={categoryData}
          title="Category Breakdown"
          isLoading={isLoading}
          showPercentages={true}
          displayCurrency={displayCurrency}
        />
        
        <View style={styles.categoryList}>
          {categoryData.map((category, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.categoryItem}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${category.name} category, spent ${formatCurrency(category.amount, displayCurrency)}, ${((category.amount / totalAmount) * 100).toFixed(1)} percent of total spending`}
              accessibilityHint="Tap to view category details"
            >
              <View style={styles.categoryLeft}>
                <View 
                  style={[
                    styles.categoryColorIndicator, 
                    { backgroundColor: category.color }
                  ]} 
                />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <View style={styles.categoryRight}>
                <Text style={styles.categoryAmount}>
                  {formatCurrency(category.amount, displayCurrency)}
                </Text>
                <Text style={styles.categoryPercentage}>
                  {((category.amount / totalAmount) * 100).toFixed(1)}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </FadeInView>
    );
  };

  return (
    <View style={styles.section}>
      <SectionHeader 
        title="Category Breakdown"
        subtitle="This month's spending"
        rightComponent={
          <TouchableOpacity 
            onPress={handleRefresh} 
            style={styles.refreshButton}
            accessibilityRole="button"
            accessibilityLabel="Refresh category breakdown data"
            accessibilityHint="Tap to reload the latest spending data"
          >
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        }
      />
      <View style={styles.content}>
        {renderCategoryContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  refreshButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  refreshIcon: {
    fontSize: 16,
  },
  loadingContainer: {
    paddingVertical: spacing.md,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  categoryList: {
    marginTop: spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.xs,
    minHeight: 44, // Accessibility touch target
    flexWrap: 'wrap', // Allow wrapping on small screens
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  categoryPercentage: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});