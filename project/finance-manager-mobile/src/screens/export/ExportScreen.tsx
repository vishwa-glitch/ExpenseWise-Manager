import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchUserProfile } from '../../store/slices/userSlice';

import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';

import { apiService } from '../../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { 
  getMimeType, 
  saveAndShareBlob, 
  validateExportBlob, 
  generateExportFileName 
} from '../../utils/exportUtils';
// useExportLimits hook removed - simplified export functionality
// AdPromptModal component removed - no ad functionality needed

interface ExportScreenProps {
  navigation: any;
}

type ExportFormat = 'excel' | 'csv' | 'pdf';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

const ExportScreen: React.FC<ExportScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { profile } = useTypedSelector((state) => state.user);
  const { transactions } = useTypedSelector((state) => state.transactions);
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    endDate: new Date(), // Today
  });
  // showAdModal state removed - no ad functionality needed
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(true);

  // Simplified export functionality - no limits or ads
  const canExport = true; // All users can export
  const getExportLimitInfo = () => 'Unlimited exports available';

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      await dispatch(fetchUserProfile());
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const showDatePickerModal = (isStartDate: boolean) => {
    setIsSelectingStartDate(isStartDate);
    setShowDatePicker(true);
  };

  const handleDateChange = (date: Date) => {
    if (isSelectingStartDate) {
      setDateRange(prev => ({ ...prev, startDate: date }));
    } else {
      setDateRange(prev => ({ ...prev, endDate: date }));
    }
    setShowDatePicker(false);
  };

  const handleDateInputChange = (dateString: string, isStartDate: boolean) => {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      if (isStartDate) {
        setDateRange(prev => ({ ...prev, startDate: date }));
      } else {
        setDateRange(prev => ({ ...prev, endDate: date }));
      }
    }
  };

  const validateDateRange = (): boolean => {
    if (dateRange.startDate > dateRange.endDate) {
      Alert.alert(
        'Invalid Date Range',
        'Start date cannot be after end date. Please select a valid date range.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };



  const performExport = async (unlockToken?: string) => {
    setIsLoading(true);
    
    try {
      const startDate = formatDate(dateRange.startDate);
      const endDate = formatDate(dateRange.endDate);
      
      console.log('📄 Starting export with params:', {
        format: selectedFormat,
        startDate,
        endDate,
        unlockToken: unlockToken ? 'present' : 'none',
      });

      // TEMPORARY: All users can export during launch period
      const exportData = await apiService.exportTransactions(
        selectedFormat,
        startDate,
        endDate
      );

      console.log('📄 Export data received:', {
        type: typeof exportData,
        isUndefined: exportData === undefined,
        isNull: exportData === null,
        isBlob: exportData instanceof Blob,
        size: exportData instanceof Blob ? exportData.size : 'unknown',
        unlockToken: unlockToken ? 'used' : 'none',
      });

      // Validate the export data
      validateExportBlob(exportData);

      // Generate filename
      const fileName = generateExportFileName(selectedFormat, startDate, endDate);
      
      // Save and share the blob
      await saveAndShareBlob(exportData, fileName, {
        format: selectedFormat,
        mimeType: getMimeType(selectedFormat),
        dialogTitle: `Export Transactions (${selectedFormat.toUpperCase()})`,
      });

      // Export completed successfully

    } catch (error: any) {
      console.error('Export error:', error);
      
      // Handle export limit reached (403) - show graceful error instead
      if (error.response?.status === 403) {
        Alert.alert(
          'Export Feature Coming Soon',
          'The export feature is currently being set up. You\'ll be able to export your transactions soon!',
          [{ text: 'OK' }]
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
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
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

    // Validate date range before proceeding
    if (!validateDateRange()) {
      return;
    }

    // TEMPORARY: All users can export during launch period
    await performExport();
  };

  const handleExportAfterAd = async () => {
    // TEMPORARY: All users can export during launch period
    await performExport();
  };



  const getFormatIcon = (format: ExportFormat): string => {
    switch (format) {
      case 'excel':
        return '📊';
      case 'csv':
        return '📄';
      case 'pdf':
        return '📋';
      default:
        return '📁';
    }
  };

  const getFormatDescription = (format: ExportFormat): string => {
    switch (format) {
      case 'excel':
        return 'Excel spreadsheet with formatting and charts';
      case 'csv':
        return 'Simple comma-separated values file';
      case 'pdf':
        return 'Professional PDF report with styling';
      default:
        return '';
    }
  };

  const renderFormatOption = (format: ExportFormat) => (
    <TouchableOpacity
      key={format}
      style={[
        styles.formatOption,
        selectedFormat === format && styles.formatOptionSelected
      ]}
      onPress={() => setSelectedFormat(format)}
    >
      <Text style={styles.formatIcon}>{getFormatIcon(format)}</Text>
      <View style={styles.formatInfo}>
        <Text style={[
          styles.formatTitle,
          selectedFormat === format && styles.formatTitleSelected
        ]}>
          {format.toUpperCase()}
        </Text>
        <Text style={[
          styles.formatDescription,
          selectedFormat === format && styles.formatDescriptionSelected
        ]}>
          {getFormatDescription(format)}
        </Text>
      </View>
      {selectedFormat === format && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedIndicatorText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Export Transactions</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* No Transactions State */}
        {(!transactions || transactions.length === 0) ? (
          <View style={styles.noTransactionsContainer}>
            <Text style={styles.noTransactionsIcon}>📋</Text>
            <Text style={styles.noTransactionsTitle}>No Transactions to Export</Text>
            <Text style={styles.noTransactionsMessage}>
              You don't have any transactions yet. Add some transactions first to export your financial data.
            </Text>
            <TouchableOpacity
              style={styles.addTransactionButton}
              onPress={() => navigation.navigate('AddEditTransaction')}
            >
              <Text style={styles.addTransactionText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Export Limit Info */}
            <View style={styles.limitInfoContainer}>
              <Text style={styles.limitInfoText}>{getExportLimitInfo()}</Text>
            </View>

        {/* Format Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Format</Text>
          <View style={styles.formatOptions}>
            {(['excel', 'csv', 'pdf'] as ExportFormat[]).map(renderFormatOption)}
          </View>
        </View>

        {/* Date Range Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => showDatePickerModal(true)}
            >
              <Text style={styles.dateLabel}>Start Date</Text>
              <Text style={styles.dateValue}>
                {formatDisplayDate(dateRange.startDate)}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.dateSeparator}>
              <Text style={styles.dateSeparatorText}>to</Text>
            </View>
            
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => showDatePickerModal(false)}
            >
              <Text style={styles.dateLabel}>End Date</Text>
              <Text style={styles.dateValue}>
                {formatDisplayDate(dateRange.endDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Export Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Format:</Text>
              <Text style={styles.summaryValue}>{selectedFormat.toUpperCase()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Period:</Text>
              <Text style={styles.summaryValue}>
                {formatDisplayDate(dateRange.startDate)} - {formatDisplayDate(dateRange.endDate)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>File Name:</Text>
              <Text style={styles.summaryValue}>
                transactions_{formatDate(dateRange.startDate)}_to_{formatDate(dateRange.endDate)}.{selectedFormat}
              </Text>
            </View>
          </View>
        </View>

        {/* Export Button */}
        <View style={styles.exportButtonContainer}>
          <CustomButton
            title={isLoading ? 'Exporting...' : 'Export Transactions'}
            onPress={handleExport}
            disabled={isLoading || !canExport}
            style={{
              ...styles.exportButton,
              ...(canExport ? {} : styles.exportButtonDisabled)
            }}
            textStyle={styles.exportButtonText}
          />
        </View>

        {/* Remove premium upgrade prompt - all users have unlimited exports during launch */}
          </>
        )}
      </ScrollView>

      {isLoading && <LoadingSpinner />}

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>
                Select {isSelectingStartDate ? 'Start' : 'End'} Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateInputLabel}>
                {isSelectingStartDate ? 'Start Date' : 'End Date'} (YYYY-MM-DD)
              </Text>
              <TextInput
                style={styles.dateTextInput}
                placeholder="2024-01-01"
                value={isSelectingStartDate 
                  ? formatDate(dateRange.startDate) 
                  : formatDate(dateRange.endDate)
                }
                onChangeText={(text) => handleDateInputChange(text, isSelectingStartDate)}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.quickDateButtons}>
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const today = new Date();
                  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  handleDateChange(isSelectingStartDate ? startOfMonth : today);
                }}
              >
                <Text style={styles.quickDateButtonText}>This Month</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const today = new Date();
                  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                  handleDateChange(isSelectingStartDate ? lastMonth : endOfLastMonth);
                }}
              >
                <Text style={styles.quickDateButtonText}>Last Month</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const today = new Date();
                  const startOfYear = new Date(today.getFullYear(), 0, 1);
                  handleDateChange(isSelectingStartDate ? startOfYear : today);
                }}
              >
                <Text style={styles.quickDateButtonText}>This Year</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ad Prompt Modal removed - no ad functionality needed */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 50 : 23, // Add extra top padding for camera notch
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg, // Increased vertical padding
    paddingTop: spacing.xl, // Extra top padding for header
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
  },
  screenTitle: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  limitInfoContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginVertical: spacing.md,
  },
  limitInfoText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  formatOptions: {
    gap: spacing.sm,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  formatOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  formatIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  formatInfo: {
    flex: 1,
  },
  formatTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  formatTitleSelected: {
    color: colors.primary,
  },
  formatDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formatDescriptionSelected: {
    color: colors.primary + 'CC',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateInput: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dateValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  dateSeparator: {
    paddingHorizontal: spacing.sm,
  },
  dateSeparatorText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  exportButtonContainer: {
    marginVertical: spacing.lg,
  },
  exportButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  exportButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  exportButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
    textAlign: 'center',
  },
  premiumPrompt: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  premiumPromptTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  premiumPromptText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  upgradeButtonText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  },
  noTransactionsContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noTransactionsIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  noTransactionsTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  noTransactionsMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  addTransactionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addTransactionText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Date Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    margin: spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  datePickerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  dateInputContainer: {
    marginBottom: spacing.lg,
  },
  dateInputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  dateTextInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  quickDateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickDateButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickDateButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
});

export default ExportScreen;
