import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchGoals } from '../../store/slices/goalsSlice';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { GoalProgressCard } from '../../components/goals/GoalProgressCard';
import { GoalAnalyticsSummary } from '../../components/goals/GoalAnalyticsSummary';
import { GoalInsights } from '../../components/goals/GoalInsights';
import { GoalContributionTimeline } from '../../components/goals/GoalContributionTimeline';
import { Goal } from '../../types/goals';

import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency } from '../../utils/currency';

interface GoalAnalyticsScreenProps {
  navigation: any;
}

type AnalyticsTab = 'overview' | 'insights' | 'timeline' | 'goals';

const { width: screenWidth } = Dimensions.get('window');

const GoalAnalyticsScreen: React.FC<GoalAnalyticsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');

  const { goals, isLoading } = useTypedSelector((state) => state.goals);
  const { isAuthenticated } = useTypedSelector((state) => state.auth);
  const { displayCurrency } = useTypedSelector((state) => state.user);
  const { profile } = useTypedSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!isAuthenticated) return;
    
    try {
      await dispatch(fetchGoals());
    } catch (error) {
      console.error('Error loading goals analytics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleGoalPress = (goalId: string) => {
    navigation.navigate('GoalDetail', { goalId });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'insights', label: 'Insights', icon: '💡' },
    { id: 'timeline', label: 'Timeline', icon: '📈' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <GoalAnalyticsSummary 
            goals={goals as Goal[]} 
            displayCurrency={displayCurrency} 
          />
        );
      case 'insights':
        return (
          <GoalInsights 
            goals={goals as Goal[]} 
            displayCurrency={displayCurrency}
            onGoalPress={handleGoalPress}
          />
        );
      case 'timeline':
        return (
          <GoalContributionTimeline 
            goals={goals as Goal[]} 
            displayCurrency={displayCurrency}
          />
        );
      case 'goals':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {goals.filter(goal => goal.status === 'active').map((goal) => (
              <GoalProgressCard
                key={goal.id}
                goal={goal as Goal}
                onPress={() => handleGoalPress(goal.id)}
                showDetails={true}
              />
            ))}
            {goals.filter(goal => goal.status === 'active').length === 0 && (
              <View style={styles.emptyGoals}>
                <Text style={styles.emptyGoalsIcon}>🎯</Text>
                <Text style={styles.emptyGoalsTitle}>No Active Goals</Text>
                <Text style={styles.emptyGoalsText}>
                  Create your first goal to start tracking your financial progress.
                </Text>
                <TouchableOpacity 
                  style={styles.createGoalButton}
                  onPress={() => navigation.navigate('CreateGoal')}
                >
                  <Text style={styles.createGoalButtonText}>Create Goal</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#2E7D57', '#1E5631']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Goal Analytics</Text>
          <Text style={styles.headerSubtitle}>
            {goals.length} {goals.length === 1 ? 'goal' : 'goals'} • {goals.filter(g => g.status === 'active').length} active
          </Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsValue}>
            {goals.length > 0 
              ? (goals.reduce((sum, goal) => sum + (goal.progress_percentage || 0), 0) / goals.length).toFixed(0)
              : 0}%
          </Text>
          <Text style={styles.headerStatsLabel}>Avg Progress</Text>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollView}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                styles.tabIcon,
                activeTab === tab.id && styles.activeTabIcon
              ]}>
                {tab.icon}
              </Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#4A90E2', '#2E5BBA']}
              style={styles.emptyStateGradient}
            >
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyTitle}>Start Your Financial Journey</Text>
              <Text style={styles.emptyMessage}>
                Create your first financial goal to unlock powerful analytics and insights that will help you achieve your dreams.
              </Text>
              <TouchableOpacity 
                style={styles.createGoalButton}
                onPress={() => navigation.navigate('CreateGoal')}
              >
                <Text style={styles.createGoalButtonText}>Create Your First Goal</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          renderTabContent()
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    paddingTop: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  backIcon: {
    fontSize: 24,
    color: colors.background,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.background,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.background + 'CC',
    fontWeight: '500',
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  headerStatsValue: {
    ...typography.h2,
    color: colors.background,
    fontWeight: 'bold',
  },
  headerStatsLabel: {
    ...typography.caption,
    color: colors.background + 'CC',
    fontSize: 10,
  },
  tabContainer: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabScrollView: {
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  activeTabIcon: {
    color: colors.background,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: colors.background,
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
  },
  emptyState: {
    margin: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyStateGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.background,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.body,
    color: colors.background + 'DD',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  emptyGoals: {
    backgroundColor: colors.card,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyGoalsIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyGoalsTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyGoalsText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  createGoalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createGoalButtonText: {
    ...typography.h4,
    color: colors.background,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GoalAnalyticsScreen;