import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { showPremiumModal } from '../../store/slices/uiSlice';
import { colors, typography, spacing } from '../../constants/colors';
import { SUBSCRIPTION_TIERS } from '../../config/api';
import { apiService } from '../../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { 
  getMimeType, 
  saveAndShareBlob, 
  validateExportBlob, 
  generateExportFileName 
} from '../../utils/exportUtils';

interface ExportSectionProps {
  navigation: any;
  title?: string;
  showTitle?: boolean;
  style?: any;
  isCompact?: boolean; // New prop for smaller size
}

const ExportSection: React.FC<ExportSectionProps> = ({
  navigation,
  title = 'Export Data',
  showTitle = true,
  style,
  isCompact = false, // Default to false
}) => {
  const dispatch = useAppDispatch();
  const { profile } = useTypedSelector((state) => state.user);
  const { transactions } = useTypedSelector((state) => state.transactions);
  const [isExporting, setIsExporting] = useState(false);

  const canExport = (): boolean => {
    if (!profile) return false;
    
    // TEMPORARY: All users can export for app launch
    return true;
  };

  const getExportLimitInfo = (): string => {
    if (!profile) return '';
    
    // TEMPORARY: All users have unlimited exports for app launch
    return 'Unlimited exports';
  };

  const handleQuickExport = async (format: 'excel' | 'csv' | 'pdf') => {
    // Check if there are transactions to export
    if (!transactions || transactions.length === 0) {
      Alert.alert(
        'No Transactions to Export',
        'You don\'t have any transactions yet. Add some transactions first to export your financial data.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add Transaction', 
            onPress: () => navigation.navigate('AddEditTransaction')
          }
        ]
      );
      return;
    }

    if (!canExport()) {
      if (profile?.subscription_tier === 'free') {
        Alert.alert(
          'Export Limit Reached',
          'You have reached your monthly export limit. Upgrade to Premium for unlimited exports.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => dispatch(showPremiumModal()) }
          ]
        );
      }
      return;
    }

    setIsExporting(true);
    
    try {
      // Get current month data
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = now;
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Get the export data
      const exportData = await apiService.exportTransactions(
        format,
        startDateStr,
        endDateStr
      );

      console.log('📄 Export data received:', {
        type: typeof exportData,
        isUndefined: exportData === undefined,
        isNull: exportData === null,
        isBlob: exportData instanceof Blob,
        size: exportData instanceof Blob ? exportData.size : 'unknown',
      });

      // Validate the export data
      validateExportBlob(exportData);

      // Generate filename
      const fileName = generateExportFileName(format, startDateStr, endDateStr);
      
      // Save and share the blob
      await saveAndShareBlob(exportData, fileName, {
        format,
        mimeType: getMimeType(format),
        dialogTitle: `Export Transactions (${format.toUpperCase()})`,
      });

    } catch (error: any) {
      console.error('Export error:', error);
      
      // Handle export limit reached (403)
      if (error.response?.status === 403) {
        const errorData = error.response.data;
        const currentUsage = errorData.current_usage || 0;
        const limit = errorData.limit || 1;
        const resetDate = errorData.reset_date;
        
        let message = `You have used ${currentUsage} of ${limit} monthly exports.`;
        if (resetDate) {
          const resetDateObj = new Date(resetDate);
          const daysUntilReset = Math.ceil((resetDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilReset > 0) {
            message += `\n\nYour limit will reset on ${resetDateObj.toLocaleDateString()} (in ${daysUntilReset} days).`;
          } else {
            message += `\n\nYour limit will reset soon.`;
          }
        }
        message += `\n\nUpgrade to Premium for unlimited exports.`;
        
        Alert.alert(
          'Export Limit Reached',
          message,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => dispatch(showPremiumModal()) }
          ]
        );
        return;
      }
      
      // Handle specific backend database error
      if (error.response?.status === 500) {
        Alert.alert(
          'Export Temporarily Unavailable',
          'The export feature is currently being set up. Please try again in a few minutes or contact support if the issue persists.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      Alert.alert(
        'Export Failed',
        error.message || 'Failed to export transactions. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };



  const handleNavigateToExport = () => {
    navigation.navigate('Export');
  };

  return (
    <View style={[
      styles.container, 
      style,
      isCompact && styles.compactContainer
    ]}>
      {showTitle && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={handleNavigateToExport}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.limitInfo}>
          <Text style={styles.limitText}>{getExportLimitInfo()}</Text>
        </View>

        {isExporting ? (
          <View style={styles.exportingContainer}>
            <Text style={styles.exportingText}>Exporting...</Text>
          </View>
        ) : (
          <View style={styles.exportOptions}>
            <TouchableOpacity
              style={[styles.exportOption, isExporting && styles.exportOptionDisabled]}
              onPress={() => handleQuickExport('excel')}
              disabled={isExporting || !canExport()}
            >
              <Text style={styles.exportIcon}>📊</Text>
              <Text style={styles.exportLabel}>Excel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportOption, isExporting && styles.exportOptionDisabled]}
              onPress={() => handleQuickExport('csv')}
              disabled={isExporting || !canExport()}
            >
              <Text style={styles.exportIcon}>📄</Text>
              <Text style={styles.exportLabel}>CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportOption, isExporting && styles.exportOptionDisabled]}
              onPress={() => handleQuickExport('pdf')}
              disabled={isExporting || !canExport()}
            >
              <Text style={styles.exportIcon}>📋</Text>
              <Text style={styles.exportLabel}>PDF</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  compactContainer: {
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  viewAllButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  viewAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    gap: spacing.sm,
  },
  limitInfo: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 6,
  },
  limitText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  exportOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.sm,
  },
  exportOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportOptionDisabled: {
    opacity: 0.5,
  },
  exportIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  exportLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  upgradePrompt: {
    backgroundColor: colors.primary + '10',
    padding: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  upgradeText: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  noTransactionsContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noTransactionsIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  noTransactionsTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noTransactionsMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  addTransactionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addTransactionText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
    textAlign: 'center',
  },
  exportingContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ExportSection;
