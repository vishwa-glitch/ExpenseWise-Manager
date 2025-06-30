import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { bulkImportTransactions, exportTransactions } from '../../store/slices/transactionsSlice';
import { fetchAccounts } from '../../store/slices/accountsSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { fetchUserProfile } from '../../store/slices/userSlice';
import { showPremiumModal } from '../../store/slices/uiSlice';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';
import { formatCurrency, getDefaultCurrency } from '../../utils/currency';
import { SUBSCRIPTION_TIERS } from '../../config/api';

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  merchant?: string;
  account_id?: string;
  category_id?: string;
}

interface ImportPreview {
  transactions: ParsedTransaction[];
  summary: {
    total: number;
    income: number;
    expenses: number;
    valid: number;
    invalid: number;
  };
}

const StatementImportScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { accounts } = useTypedSelector((state) => state.accounts);
  const { categories } = useTypedSelector((state) => state.categories);
  const { profile } = useTypedSelector((state) => state.user);
  const { isAuthenticated } = useTypedSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  
  // Export date range states
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchAccounts()),
        dispatch(fetchCategories()),
        dispatch(fetchUserProfile()),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Helper functions for date calculations
  const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getLastMonthDates = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    return {
      startDate: getDateString(startDate),
      endDate: getDateString(endDate),
    };
  };

  const getLastSixMonthsDates = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    return {
      startDate: getDateString(startDate),
      endDate: getDateString(endDate),
    };
  };

  const getLastYearDates = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    return {
      startDate: getDateString(startDate),
      endDate: getDateString(endDate),
    };
  };

  // Check if user is premium
  const isPremiumUser = () => {
    return profile?.subscription_tier === 'premium';
  };

  // Check if export operation is allowed for free users
  const isExportAllowed = () => {
    if (isPremiumUser()) {
      return true; // Premium users can export anything
    }

    // Free users can only export without custom date range (defaults to 1 month)
    return !isCustomDateRange && !exportStartDate && !exportEndDate;
  };

  const parseCSVContent = (content: string): ParsedTransaction[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const transactions: ParsedTransaction[] = [];

    // Find column indices
    const dateIndex = headers.findIndex(h => 
      h.includes('date') || h.includes('transaction_date') || h.includes('posted_date')
    );
    const descriptionIndex = headers.findIndex(h => 
      h.includes('description') || h.includes('memo') || h.includes('details')
    );
    const amountIndex = headers.findIndex(h => 
      h.includes('amount') || h.includes('value') || h.includes('transaction_amount')
    );
    const typeIndex = headers.findIndex(h => 
      h.includes('type') || h.includes('transaction_type') || h.includes('debit_credit')
    );
    const categoryIndex = headers.findIndex(h => 
      h.includes('category') || h.includes('classification')
    );
    const merchantIndex = headers.findIndex(h => 
      h.includes('merchant') || h.includes('payee') || h.includes('vendor')
    );

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length < Math.max(dateIndex, descriptionIndex, amountIndex) + 1) {
        continue; // Skip invalid rows
      }

      try {
        const dateStr = values[dateIndex] || '';
        const description = values[descriptionIndex] || 'Imported Transaction';
        const amountStr = values[amountIndex] || '0';
        const typeStr = values[typeIndex] || '';
        const category = values[categoryIndex] || '';
        const merchant = values[merchantIndex] || '';

        // Parse amount
        const amount = Math.abs(parseFloat(amountStr.replace(/[^0-9.-]/g, '')));
        if (isNaN(amount) || amount === 0) continue;

        // Determine transaction type
        let type: 'income' | 'expense' = 'expense';
        if (typeStr.toLowerCase().includes('credit') || 
            typeStr.toLowerCase().includes('deposit') ||
            typeStr.toLowerCase().includes('income') ||
            amountStr.includes('+')) {
          type = 'income';
        }

        // Parse date
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) continue;

        // Find matching category
        const matchingCategory = categories.find(cat => 
          cat.name.toLowerCase().includes(category.toLowerCase()) ||
          category.toLowerCase().includes(cat.name.toLowerCase())
        );

        transactions.push({
          date: date.toISOString().split('T')[0],
          description,
          amount,
          type,
          category,
          merchant: merchant || undefined,
          category_id: matchingCategory?.id,
        });
      } catch (error) {
        console.warn('Error parsing transaction row:', error);
        continue;
      }
    }

    return transactions;
  };

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        
        // Read file content
        const response = await fetch(file.uri);
        const content = await response.text();
        
        // Parse CSV content
        const parsedTransactions = parseCSVContent(content);
        
        if (parsedTransactions.length === 0) {
          Alert.alert(
            'Invalid File',
            'No valid transactions found in the file. Please check the format and try again.'
          );
          return;
        }

        // Create preview
        const income = parsedTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = parsedTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        const preview: ImportPreview = {
          transactions: parsedTransactions,
          summary: {
            total: parsedTransactions.length,
            income,
            expenses,
            valid: parsedTransactions.length,
            invalid: 0,
          },
        };

        setImportPreview(preview);
        setShowImportModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read the selected file. Please try again.');
    }
  };

  const handleImport = async () => {
    if (!importPreview || !selectedAccount) {
      Alert.alert('Error', 'Please select an account and ensure transactions are loaded.');
      return;
    }

    setIsLoading(true);
    try {
      // Add account_id to all transactions
      const transactionsToImport = importPreview.transactions.map(t => ({
        ...t,
        account_id: selectedAccount,
        // Use first category if no specific category found
        category_id: t.category_id || (categories.length > 0 ? categories[0].id : undefined),
      }));

      await dispatch(bulkImportTransactions(transactionsToImport)).unwrap();
      
      Alert.alert(
        'Import Successful',
        `Successfully imported ${transactionsToImport.length} transactions.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowImportModal(false);
              setImportPreview(null);
              setSelectedFile(null);
              setSelectedAccount('');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Import Failed', error.message || 'Failed to import transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickExportOption = (option: 'lastMonth' | 'lastSixMonths' | 'lastYear') => {
    if (!isPremiumUser() && option !== 'lastMonth') {
      // Free users trying to export more than 1 month - redirect to premium
      Alert.alert(
        'Premium Feature',
        `Exporting ${option === 'lastSixMonths' ? '6 months' : '1 year'} of data is a Premium feature. Free users can export up to 1 month of transaction history.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade to Premium',
            onPress: () => {
              setShowExportModal(false);
              dispatch(showPremiumModal());
            },
          },
        ]
      );
      return;
    }

    let dates;
    switch (option) {
      case 'lastMonth':
        dates = getLastMonthDates();
        break;
      case 'lastSixMonths':
        dates = getLastSixMonthsDates();
        break;
      case 'lastYear':
        dates = getLastYearDates();
        break;
    }

    setExportStartDate(dates.startDate);
    setExportEndDate(dates.endDate);
    setIsCustomDateRange(false); // Mark as quick option, not custom
  };

  const handleCustomDateChange = () => {
    if (!isPremiumUser()) {
      Alert.alert(
        'Premium Feature',
        'Custom date range export is a Premium feature. Free users can export up to 1 month of recent transaction history.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade to Premium',
            onPress: () => {
              setShowExportModal(false);
              dispatch(showPremiumModal());
            },
          },
        ]
      );
      return;
    }
    setIsCustomDateRange(true);
  };

  const handleExport = async () => {
    if (!isExportAllowed()) {
      Alert.alert(
        'Premium Feature Required',
        'Custom date range export is a Premium feature. Free users can export up to 1 month of recent transaction history.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade to Premium',
            onPress: () => {
              setShowExportModal(false);
              dispatch(showPremiumModal());
            },
          },
        ]
      );
      return;
    }

    if (!exportFormat) {
      Alert.alert('Error', 'Please select an export format.');
      return;
    }

    setIsLoading(true);
    try {
      let startDate = exportStartDate;
      let endDate = exportEndDate;

      // For free users, if no dates are set, default to last month
      if (!isPremiumUser() && !startDate && !endDate) {
        const lastMonthDates = getLastMonthDates();
        startDate = lastMonthDates.startDate;
        endDate = lastMonthDates.endDate;
      }

      await dispatch(exportTransactions({ 
        format: exportFormat, 
        startDate: startDate || undefined, 
        endDate: endDate || undefined 
      })).unwrap();
      
      Alert.alert(
        'Export Successful',
        'Your transactions have been exported successfully.'
      );
      setShowExportModal(false);
    } catch (error: any) {
      Alert.alert('Export Failed', error.message || 'Failed to export transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTransactionPreview = ({ item, index }: { item: ParsedTransaction; index: number }) => (
    <View style={styles.transactionPreviewItem}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={[
          styles.transactionAmount,
          { color: item.type === 'income' ? colors.income : colors.expense }
        ]}>
          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, getDefaultCurrency())}
        </Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDate}>{item.date}</Text>
        <Text style={styles.transactionType}>{item.type}</Text>
        {item.category && <Text style={styles.transactionCategory}>{item.category}</Text>}
        {item.merchant && <Text style={styles.transactionMerchant}>{item.merchant}</Text>}
      </View>
    </View>
  );

  const renderImportModal = () => (
    <Modal
      visible={showImportModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowImportModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Import Preview</Text>
          
          {importPreview && (
            <>
              {/* Summary */}
              <View style={styles.importSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Transactions:</Text>
                  <Text style={styles.summaryValue}>{importPreview.summary.total}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Income:</Text>
                  <Text style={[styles.summaryValue, { color: colors.income }]}>
                    {formatCurrency(importPreview.summary.income, getDefaultCurrency())}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Expenses:</Text>
                  <Text style={[styles.summaryValue, { color: colors.expense }]}>
                    {formatCurrency(importPreview.summary.expenses, getDefaultCurrency())}
                  </Text>
                </View>
              </View>

              {/* Account Selection */}
              <View style={styles.accountSelection}>
                <Text style={styles.accountSelectionLabel}>Select Account:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountOption,
                        selectedAccount === account.id && styles.accountOptionSelected,
                      ]}
                      onPress={() => setSelectedAccount(account.id)}
                    >
                      <Text style={styles.accountOptionText}>{account.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Transaction Preview */}
              <Text style={styles.previewTitle}>Transaction Preview (First 5):</Text>
              <FlatList
                data={importPreview.transactions.slice(0, 5)}
                renderItem={renderTransactionPreview}
                keyExtractor={(item, index) => index.toString()}
                style={styles.transactionsList}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}

          <View style={styles.modalActions}>
            <CustomButton
              title="Cancel"
              onPress={() => setShowImportModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <CustomButton
              title="Import"
              onPress={handleImport}
              loading={isLoading}
              disabled={!selectedAccount}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderExportModal = () => (
    <Modal
      visible={showExportModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowExportModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Export Transactions</Text>
          
          {/* Subscription Info */}
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionTier}>
              {isPremiumUser() ? '⭐ Premium User' : '🆓 Free User'}
            </Text>
            {!isPremiumUser() && (
              <Text style={styles.subscriptionLimitation}>
                Free users can export up to 1 month of transaction history. 
                For unlimited export history and custom date ranges, upgrade to Premium.
              </Text>
            )}
          </View>

          {/* Format Selection */}
          <View style={styles.formatSelection}>
            <Text style={styles.formatLabel}>Export Format:</Text>
            <View style={styles.formatOptions}>
              {['csv', 'excel'].map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.formatOption,
                    exportFormat === format && styles.formatOptionSelected,
                  ]}
                  onPress={() => setExportFormat(format)}
                >
                  <Text style={[
                    styles.formatOptionText,
                    exportFormat === format && styles.formatOptionTextSelected,
                  ]}>
                    {format.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Export Options */}
          <View style={styles.quickExportSection}>
            <Text style={styles.quickExportLabel}>Quick Export Options:</Text>
            <View style={styles.quickExportButtons}>
              <TouchableOpacity
                style={[
                  styles.quickExportButton,
                  !exportStartDate && !exportEndDate && !isCustomDateRange && styles.quickExportButtonSelected
                ]}
                onPress={() => {
                  setExportStartDate('');
                  setExportEndDate('');
                  setIsCustomDateRange(false);
                }}
              >
                <Text style={styles.quickExportButtonText}>
                  {isPremiumUser() ? 'All Data' : 'Last Month (Default)'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickExportButton}
                onPress={() => handleQuickExportOption('lastMonth')}
              >
                <Text style={styles.quickExportButtonText}>Last Month</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.quickExportButton,
                  !isPremiumUser() && styles.quickExportButtonDisabled
                ]}
                onPress={() => handleQuickExportOption('lastSixMonths')}
                disabled={!isPremiumUser()}
              >
                <Text style={[
                  styles.quickExportButtonText,
                  !isPremiumUser() && styles.quickExportButtonTextDisabled
                ]}>
                  Last 6 Months {!isPremiumUser() && '(Premium)'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.quickExportButton,
                  !isPremiumUser() && styles.quickExportButtonDisabled
                ]}
                onPress={() => handleQuickExportOption('lastYear')}
                disabled={!isPremiumUser()}
              >
                <Text style={[
                  styles.quickExportButtonText,
                  !isPremiumUser() && styles.quickExportButtonTextDisabled
                ]}>
                  Last Year {!isPremiumUser() && '(Premium)'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Custom Date Range - Premium Only */}
          {isPremiumUser() && (
            <View style={styles.dateRangeSection}>
              <View style={styles.dateRangeHeader}>
                <Text style={styles.dateRangeLabel}>Custom Date Range:</Text>
                <TouchableOpacity
                  style={styles.customDateToggle}
                  onPress={() => setIsCustomDateRange(!isCustomDateRange)}
                >
                  <Text style={styles.customDateToggleText}>
                    {isCustomDateRange ? 'Disable Custom' : 'Enable Custom'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {isCustomDateRange && (
                <View style={styles.dateInputs}>
                  <CustomTextInput
                    label="Start Date"
                    value={exportStartDate}
                    onChangeText={(value) => {
                      setExportStartDate(value);
                      handleCustomDateChange();
                    }}
                    placeholder="YYYY-MM-DD"
                    style={styles.dateInput}
                  />
                  <CustomTextInput
                    label="End Date"
                    value={exportEndDate}
                    onChangeText={(value) => {
                      setExportEndDate(value);
                      handleCustomDateChange();
                    }}
                    placeholder="YYYY-MM-DD"
                    style={styles.dateInput}
                  />
                </View>
              )}
            </View>
          )}

          {/* Current Selection Display */}
          {(exportStartDate || exportEndDate) && (
            <View style={styles.selectionDisplay}>
              <Text style={styles.selectionLabel}>Selected Range:</Text>
              <Text style={styles.selectionValue}>
                {exportStartDate || 'Beginning'} to {exportEndDate || 'Today'}
              </Text>
            </View>
          )}

          <View style={styles.modalActions}>
            <CustomButton
              title="Cancel"
              onPress={() => setShowExportModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <CustomButton
              title="Export"
              onPress={handleExport}
              loading={isLoading}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Import Section */}
        <View style={styles.section}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📄</Text>
            <Text style={styles.featureTitle}>Bulk Import</Text>
            <Text style={styles.featureDescription}>
              Import transactions from CSV files, bank statements, and other financial documents to automatically populate your transaction history.
            </Text>
            
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>• CSV file import</Text>
              <Text style={styles.featureItem}>• Auto-categorization</Text>
              <Text style={styles.featureItem}>• Transaction preview</Text>
              <Text style={styles.featureItem}>• Duplicate detection</Text>
              <Text style={styles.featureItem}>• Account assignment</Text>
            </View>

            <CustomButton
              title="Select File to Import"
              onPress={handleFileSelect}
              variant="primary"
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Export Section */}
        <View style={styles.section}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Export Transactions</Text>
            <Text style={styles.featureDescription}>
              Export your transaction data in various formats for backup, analysis, or sharing with financial advisors and tax professionals.
            </Text>
            
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>• Excel/CSV export</Text>
              <Text style={styles.featureItem}>
                • {isPremiumUser() ? 'Unlimited' : '1 month'} export history
              </Text>
              <Text style={styles.featureItem}>
                • {isPremiumUser() ? 'Custom' : 'Fixed'} date range filtering
              </Text>
              <Text style={styles.featureItem}>• Category-wise export</Text>
              <Text style={styles.featureItem}>• Custom formatting</Text>
            </View>

            {/* Subscription-based messaging */}
            {!isPremiumUser() && (
              <View style={styles.limitationNotice}>
                <Text style={styles.limitationIcon}>ℹ️</Text>
                <Text style={styles.limitationText}>
                  Free users can export up to 1 month of transaction history. 
                  Upgrade to Premium for unlimited export history and custom date ranges.
                </Text>
              </View>
            )}

            <CustomButton
              title="Export Transactions"
              onPress={() => setShowExportModal(true)}
              variant="secondary"
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* CSV Format Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CSV Format Guide</Text>
          <View style={styles.formatGuide}>
            <Text style={styles.guideTitle}>Required Columns:</Text>
            <Text style={styles.guideItem}>• Date (YYYY-MM-DD format)</Text>
            <Text style={styles.guideItem}>• Description or Memo</Text>
            <Text style={styles.guideItem}>• Amount (positive numbers)</Text>
            
            <Text style={styles.guideTitle}>Optional Columns:</Text>
            <Text style={styles.guideItem}>• Type (income/expense/credit/debit)</Text>
            <Text style={styles.guideItem}>• Category</Text>
            <Text style={styles.guideItem}>• Merchant or Payee</Text>
            
            <Text style={styles.guideNote}>
              💡 The system will automatically detect column names and map them appropriately.
            </Text>
          </View>
        </View>

        {/* Supported Formats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported Formats</Text>
          <View style={styles.formatsGrid}>
            <View style={styles.formatItem}>
              <Text style={styles.formatIcon}>📄</Text>
              <Text style={styles.formatName}>CSV</Text>
              <Text style={styles.formatDescription}>Comma-separated values</Text>
            </View>
            <View style={styles.formatItem}>
              <Text style={styles.formatIcon}>📊</Text>
              <Text style={styles.formatName}>Excel</Text>
              <Text style={styles.formatDescription}>Microsoft Excel files</Text>
            </View>
            <View style={styles.formatItem}>
              <Text style={styles.formatIcon}>💾</Text>
              <Text style={styles.formatName}>TXT</Text>
              <Text style={styles.formatDescription}>Plain text files</Text>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Better Import</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                Ensure your CSV files have columns for date, amount, description, and category
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>🔍</Text>
              <Text style={styles.tipText}>
                Review imported transactions before finalizing to ensure accuracy
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>🏷️</Text>
              <Text style={styles.tipText}>
                Set up categories beforehand for better auto-categorization
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>📅</Text>
              <Text style={styles.tipText}>
                Use consistent date formats (YYYY-MM-DD recommended)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      {renderImportModal()}
      {renderExportModal()}
    </View>
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
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
    fontWeight: 'bold',
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  featureTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  featureDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: spacing.xl,
  },
  featureItem: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
  },
  limitationNotice: {
    flexDirection: 'row',
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignSelf: 'stretch',
  },
  limitationIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  limitationText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
  actionButton: {
    minWidth: 200,
  },
  formatGuide: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  guideTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  guideItem: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
    paddingLeft: spacing.md,
  },
  guideNote: {
    ...typography.caption,
    color: colors.primary,
    fontStyle: 'italic',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  formatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  formatItem: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formatIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  formatName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  formatDescription: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  tipText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.xl,
    width: '95%',
    maxHeight: '90%',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subscriptionInfo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  subscriptionTier: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subscriptionLimitation: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  importSummary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
  },
  accountSelection: {
    marginBottom: spacing.lg,
  },
  accountSelectionLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  accountOption: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  accountOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  accountOptionText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  previewTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  transactionsList: {
    maxHeight: 200,
    marginBottom: spacing.lg,
  },
  transactionPreviewItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  transactionDescription: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.md,
  },
  transactionAmount: {
    ...typography.body,
    fontWeight: 'bold',
  },
  transactionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  transactionDate: {
    ...typography.small,
    color: colors.textSecondary,
  },
  transactionType: {
    ...typography.small,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  transactionCategory: {
    ...typography.small,
    color: colors.primary,
  },
  transactionMerchant: {
    ...typography.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  formatSelection: {
    marginBottom: spacing.lg,
  },
  formatLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  formatOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  formatOption: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  formatOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  formatOptionText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  formatOptionTextSelected: {
    color: colors.primary,
  },
  quickExportSection: {
    marginBottom: spacing.lg,
  },
  quickExportLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  quickExportButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickExportButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: '48%',
  },
  quickExportButtonSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  quickExportButtonDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  quickExportButtonText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickExportButtonTextDisabled: {
    color: colors.textSecondary,
  },
  dateRangeSection: {
    marginBottom: spacing.lg,
  },
  dateRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateRangeLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  customDateToggle: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  customDateToggleText: {
    ...typography.small,
    color: colors.background,
    fontWeight: 'bold',
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  selectionDisplay: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  selectionLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  selectionValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default StatementImportScreen;