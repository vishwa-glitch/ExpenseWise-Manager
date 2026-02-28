import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors, typography, spacing } from '../../constants/colors';
import { apiService } from '../../services/api';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { forceLogout } from '../../store/slices/authSlice';
import { clearAllAppData, debugAuthState } from '../../utils/authUtils';

interface DeletionInfo {
  deletion_warning: {
    title: string;
    message: string;
    data_summary: {
      active_accounts: number;
      total_transactions: number;
      active_categories: number;
      active_budgets: number;
      active_goals: number;
      total_uploads: number;
      total_bills: number;
      active_recommendations: number;
      unread_notifications: number;
    };
    confirmation_requirements: {
      phrase: string;
      password_required: boolean;
    };
    alternatives: string[];
  };
}

const AccountDeletionScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [deletionInfo, setDeletionInfo] = useState<DeletionInfo | null>(null);
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);

  useEffect(() => {
    loadDeletionInfo();
  }, []);

  const loadDeletionInfo = async () => {
    try {
      setIsLoadingInfo(true);
      const data = await apiService.getDeletionInfo();
      setDeletionInfo(data);
    } catch (error: any) {
      console.error('Failed to load deletion info:', error);
      Alert.alert(
        'Error',
        'Failed to load account deletion information. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Validate confirmation phrase
    if (confirmationPhrase !== 'DELETE MY ACCOUNT') {
      Alert.alert(
        'Invalid Confirmation',
        'Please type "DELETE MY ACCOUNT" exactly as shown to confirm deletion.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate password
    if (!password.trim()) {
      Alert.alert(
        'Password Required',
        'Please enter your current password to confirm account deletion.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Final confirmation dialog
    Alert.alert(
      'Permanent Account Deletion',
      'This action will permanently delete your account and all associated data. This action cannot be undone. Are you absolutely sure you want to proceed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: performAccountDeletion,
        },
      ]
    );
  };

  const performAccountDeletion = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiService.deleteUserAccount(confirmationPhrase, password);

      // Clear all app data including tokens, persisted state, and Redux store
      await clearAllAppData();
      
      // Debug: Check state after clearing data
      console.log('🔍 Debugging state after account deletion...');
      await debugAuthState();

      Alert.alert(
        'Account Deleted',
        'Your account and all associated data have been permanently deleted. You will be logged out.',
        [
          {
            text: 'OK',
            onPress: async () => {
              // Force logout to ensure navigation to auth screen
              console.log('🔍 Debugging state before force logout...');
              await debugAuthState();
              
              dispatch(forceLogout());
              
              // Debug: Check state after force logout
              setTimeout(async () => {
                console.log('🔍 Debugging state after force logout...');
                await debugAuthState();
              }, 1000);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Account deletion failed:', error);
      
      let errorMessage = 'Failed to delete account. Please try again.';
      
      if (error.response?.status === 400) {
        if (error.response.data?.error?.includes('confirmation phrase')) {
          errorMessage = 'Invalid confirmation phrase. Please type "DELETE MY ACCOUNT" exactly.';
        } else if (error.response.data?.error?.includes('password')) {
          errorMessage = 'Invalid password. Please enter your current password correctly.';
        } else {
          errorMessage = error.response.data?.error || errorMessage;
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again and try.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to perform this action.';
      }
      
      Alert.alert('Deletion Failed', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDataSummary = () => {
    if (!deletionInfo?.deletion_warning.data_summary) return null;

    const summary = deletionInfo.deletion_warning.data_summary;
    const summaryItems = [
      { label: 'Active Accounts', value: summary.active_accounts },
      { label: 'Total Transactions', value: summary.total_transactions },
      { label: 'Active Categories', value: summary.active_categories },
      { label: 'Active Budgets', value: summary.active_budgets },
      { label: 'Active Goals', value: summary.active_goals },
      { label: 'Statement Uploads', value: summary.total_uploads },
      { label: 'Bill Reminders', value: summary.total_bills },
      { label: 'AI Recommendations', value: summary.active_recommendations },
      { label: 'Unread Notifications', value: summary.unread_notifications },
    ];

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Data That Will Be Deleted:</Text>
        {summaryItems.map((item, index) => (
          <View key={index} style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <Text style={styles.summaryValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderAlternatives = () => {
    if (!deletionInfo?.deletion_warning.alternatives) return null;

    return (
      <View style={styles.alternativesContainer}>
        <Text style={styles.alternativesTitle}>Before You Delete:</Text>
        {deletionInfo.deletion_warning.alternatives.map((alternative, index) => (
          <View key={index} style={styles.alternativeItem}>
            <Text style={styles.alternativeBullet}>•</Text>
            <Text style={styles.alternativeText}>{alternative}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (isLoadingInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading account information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <Text style={styles.headerSubtitle}>
          This action is permanent and cannot be undone
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Warning Section */}
        <View style={styles.warningSection}>
          <View style={styles.warningIcon}>
            <Text style={styles.warningIconText}>⚠️</Text>
          </View>
          <Text style={styles.warningTitle}>
            {deletionInfo?.deletion_warning.title || 'Permanent Account Deletion'}
          </Text>
          <Text style={styles.warningMessage}>
            {deletionInfo?.deletion_warning.message || 
              'This action will permanently delete your account and all associated data. This action cannot be undone.'}
          </Text>
        </View>

        {/* Data Summary */}
        {renderDataSummary()}

        {/* Alternatives */}
        {renderAlternatives()}

        {/* Confirmation Form */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Confirm Deletion</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Type "{deletionInfo?.deletion_warning.confirmation_requirements.phrase || 'DELETE MY ACCOUNT'}" to confirm:
            </Text>
            <TextInput
              style={styles.textInput}
              value={confirmationPhrase}
              onChangeText={setConfirmationPhrase}
              placeholder="DELETE MY ACCOUNT"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter your current password:</Text>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
          </View>
        </View>

        {/* Delete Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.deleteButton,
              (!confirmationPhrase || !password.trim() || isLoading) && styles.deleteButtonDisabled
            ]}
            onPress={handleDeleteAccount}
            disabled={!confirmationPhrase || !password.trim() || isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>Permanently Delete Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  warningSection: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningIcon: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  warningIconText: {
    fontSize: 32,
  },
  warningTitle: {
    ...typography.h3,
    color: '#856404',
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  warningMessage: {
    ...typography.body,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 22,
  },
  summaryContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  alternativesContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  alternativesTitle: {
    ...typography.h3,
    color: '#155724',
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  alternativeItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  alternativeBullet: {
    ...typography.body,
    color: '#155724',
    marginRight: spacing.sm,
    fontWeight: 'bold',
  },
  alternativeText: {
    ...typography.body,
    color: '#155724',
    flex: 1,
    lineHeight: 22,
  },
  formSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  formTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  buttonContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
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
  deleteButtonDisabled: {
    backgroundColor: '#6C757D',
    shadowOpacity: 0,
    elevation: 0,
  },
  deleteButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default AccountDeletionScreen;
