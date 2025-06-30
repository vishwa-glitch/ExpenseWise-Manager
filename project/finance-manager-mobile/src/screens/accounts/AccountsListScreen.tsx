import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchAccounts } from '../../store/slices/accountsSlice';
import { fetchUserProfile } from '../../store/slices/userSlice';
import { showPremiumModal } from '../../store/slices/uiSlice';
import { AccountCard } from '../../components/common/AccountCard';
import { BalanceCard } from '../../components/common/BalanceCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';
import { SUBSCRIPTION_TIERS } from '../../config/api';
import { getDefaultCurrency } from '../../utils/currency';

interface AccountsListScreenProps {
  navigation: any;
}

const AccountsListScreen: React.FC<AccountsListScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const { accounts, isLoading } = useTypedSelector((state) => state.accounts);
  const { profile } = useTypedSelector((state) => state.user);
  const { isAuthenticated } = useTypedSelector((state) => state.auth);

  useEffect(() => {
    // Only load data when user is authenticated
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    // Double-check authentication before making API calls
    if (!isAuthenticated) {
      console.log('🚫 Skipping accounts data load - user not authenticated');
      return;
    }

    try {
      console.log('🏦 Loading accounts data for authenticated user');
      await Promise.all([
        dispatch(fetchAccounts()),
        dispatch(fetchUserProfile()),
      ]);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const onRefresh = async () => {
    if (!isAuthenticated) {
      console.log('🚫 Skipping refresh - user not authenticated');
      return;
    }

    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const getPrimaryCurrency = () => {
    // Use the currency from the first account, or default to USD
    if (accounts.length > 0 && accounts[0].currency) {
      return accounts[0].currency;
    }
    return getDefaultCurrency();
  };

  const getActiveAccounts = () => {
    return accounts.filter(account => account.is_active);
  };

  const canAddAccount = () => {
    if (!profile) return false;
    
    const isFreeTier = profile.subscription_tier === 'free';
    const accountLimit = SUBSCRIPTION_TIERS.FREE.accounts;
    
    return !isFreeTier || accounts.length < accountLimit;
  };

  const handleAddAccount = () => {
    if (canAddAccount()) {
      navigation.navigate('AddEditAccount');
    } else {
      Alert.alert(
        'Account Limit Reached',
        `Free tier allows up to ${SUBSCRIPTION_TIERS.FREE.accounts} accounts. Upgrade to Premium for unlimited accounts.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => dispatch(showPremiumModal()),
          },
        ]
      );
    }
  };

  const handleAccountPress = (account: any) => {
    navigation.navigate('AccountDetail', { accountId: account.id });
  };

  const renderAccountItem = ({ item }: { item: any }) => (
    <AccountCard
      account={item}
      onPress={() => handleAccountPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <BalanceCard
        title="Total Balance"
        balance={calculateTotalBalance()}
        currency={getPrimaryCurrency()}
        subtitle={`Across ${getActiveAccounts().length} active accounts`}
      />
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Accounts</Text>
        <Text style={styles.accountCount}>
          {accounts.length} {profile?.subscription_tier === 'free' ? `/ ${SUBSCRIPTION_TIERS.FREE.accounts}` : ''}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🏦</Text>
      <Text style={styles.emptyTitle}>No Accounts Yet</Text>
      <Text style={styles.emptyMessage}>
        Add your first account to start tracking your finances
      </Text>
      <TouchableOpacity
        style={styles.addFirstAccountButton}
        onPress={handleAddAccount}
      >
        <Text style={styles.addFirstAccountText}>Add Your First Account</Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading spinner if not authenticated or if loading and no accounts
  if (!isAuthenticated || (isLoading && accounts.length === 0)) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Accounts</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={accounts}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          !canAddAccount() && styles.fabDisabled,
        ]}
        onPress={handleAddAccount}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  screenTitle: {
    ...typography.h2,
    color: colors.text,
  },
  menuButton: {
    padding: spacing.sm,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.text,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  accountCount: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  addFirstAccountButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addFirstAccountText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  fabIcon: {
    fontSize: 24,
    color: colors.background,
    fontWeight: 'bold',
  },
});

export default AccountsListScreen;