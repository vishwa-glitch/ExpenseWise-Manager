import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface TransactionLoadingStateProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  isInline?: boolean;
}

const TransactionLoadingState: React.FC<TransactionLoadingStateProps> = ({
  message = 'Loading transactions...',
  showProgress = false,
  progress = 0,
  isInline = false,
}) => {
  if (isInline) {
    return (
      <View style={styles.inlineContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.inlineMessage}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>{message}</Text>
        
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(progress, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
  },
  loadingContent: {
    alignItems: 'center',
    maxWidth: 280,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 24,
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  inlineMessage: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});

export default TransactionLoadingState;