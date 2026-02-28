// Simplified subscription utilities - no restrictions
// All features are available to all users

export const FREE_TIER_LIMITS = {
  CUSTOM_CATEGORIES: -1,
  ACTIVE_GOALS: -1,
  ACCOUNTS: -1,
  MONTHLY_UPLOADS: -1,
  MONTHLY_EXPORTS: -1,
} as const;

export const PREMIUM_FEATURES = {
  UNLIMITED_ACCOUNTS: 'unlimited_accounts',
  UNLIMITED_CATEGORIES: 'unlimited_categories',
  UNLIMITED_STATEMENT_IMPORTS: 'unlimited_statement_imports',
  UNLIMITED_GOALS: 'unlimited_goals',
  AI_GOAL_SETTING: 'ai_goal_setting',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  PREDICTIVE_ALERTS: 'predictive_alerts',
  ACCOUNT_SHARING: 'account_sharing',
  EXCEL_EXPORT: 'excel_export',
  UNLIMITED_EXPORT_HISTORY: 'unlimited_export_history',
  CUSTOM_DATE_RANGE_EXPORT: 'custom_date_range_export',
  PRIORITY_SUPPORT: 'priority_support',
  ADVANCED_AI_CATEGORIZATION: 'advanced_ai_categorization',
} as const;

export interface UserStats {
  total_transactions: number;
  total_accounts: number;
  total_categories: number;
  total_goals: number;
}

export interface UserProfile {
  subscription_tier: 'free' | 'premium';
  stats: UserStats;
}

// All functions return true/false to indicate no restrictions
export const checkFreeTierLimit = (): boolean => false;
export const canAccessPremiumFeature = (): boolean => true;
export const showPremiumFeatureAlert = () => {};
export const showPremiumUpgradeAlert = () => {};
export const checkCategoryCreationLimit = (): boolean => false;
export const checkGoalCreationLimit = (): boolean => false;
export const checkAccountCreationLimit = (): boolean => false;
export const checkStatementUploadLimit = (): boolean => false;
export const checkExportLimit = (): boolean => false;
export const getSubscriptionTierDisplayName = (): string => 'Active Member';
export const getSubscriptionTierBadge = (): string => '✨';
export const isPremiumUser = (): boolean => true;

// Add missing functions that are being imported
export const getUserStats = (): UserStats => ({
  total_transactions: 0,
  total_accounts: 0,
  total_categories: 0,
  total_goals: 0
});

export const getUserProfile = (): UserProfile => ({
  subscription_tier: 'premium',
  stats: getUserStats()
});
