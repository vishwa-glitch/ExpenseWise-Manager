import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
  variant?: 'default' | 'error' | 'loading';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionTitle,
  onAction,
  variant = 'default',
}) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'error':
        return '⚠️';
      case 'loading':
        return '⏳';
      default:
        return '📊';
    }
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    switch (variant) {
      case 'error':
        baseStyle.push(styles.errorContainer);
        break;
      case 'loading':
        baseStyle.push(styles.loadingContainer);
        break;
      default:
        baseStyle.push(styles.defaultContainer);
    }
    
    return baseStyle;
  };

  return (
    <View style={getContainerStyle()}>
      <Text style={styles.icon}>
        {icon || getDefaultIcon()}
      </Text>
      
      <Text style={styles.title}>
        {title}
      </Text>
      
      <Text style={styles.message}>
        {message}
      </Text>
      
      {actionTitle && onAction && (
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onAction}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>
            {actionTitle}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Specific empty state components for common scenarios
export const ChartEmptyState: React.FC<{
  onRefresh?: () => void;
  type?: 'spending' | 'category' | 'general';
}> = ({ onRefresh, type = 'general' }) => {
  const getContent = () => {
    switch (type) {
      case 'spending':
        return {
          icon: '📈',
          title: 'No Spending Data',
          message: 'No spending data found for the selected period. Try selecting a different time range or add some transactions.',
        };
      case 'category':
        return {
          icon: '🏷️',
          title: 'No Category Data',
          message: 'No category breakdown available for the selected period. Add some categorized transactions to see insights.',
        };
      default:
        return {
          icon: '📊',
          title: 'No Data Available',
          message: 'No data found for the selected period. Try selecting a different time range.',
        };
    }
  };

  const content = getContent();

  return (
    <EmptyState
      icon={content.icon}
      title={content.title}
      message={content.message}
      actionTitle={onRefresh ? 'Refresh' : undefined}
      onAction={onRefresh}
    />
  );
};

export const ErrorEmptyState: React.FC<{
  onRetry?: () => void;
  error?: string;
}> = ({ onRetry, error }) => (
  <EmptyState
    variant="error"
    title="Failed to Load Data"
    message={error || 'An error occurred while loading the data. Please try again.'}
    actionTitle={onRetry ? 'Try Again' : undefined}
    onAction={onRetry}
  />
);

export const LoadingEmptyState: React.FC<{
  message?: string;
}> = ({ message = 'Loading data...' }) => (
  <EmptyState
    variant="loading"
    title="Loading"
    message={message}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    minHeight: 200,
  },
  defaultContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  errorContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error + '20',
  },
  loadingContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  },
});