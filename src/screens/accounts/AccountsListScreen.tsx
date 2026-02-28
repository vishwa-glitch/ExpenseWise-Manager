import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchAccounts } from '../../store/slices/accountsSlice';
import { fetchUserProfile } from '../../store/slices/userSlice';

import { AccountCard, BalanceCard, LoadingSpinner } from '../../components/common';
import { colors, typography, spacing } from '../../constants/colors';



interface AccountsListScreenProps {
  navigation: any;
}

const AccountsListScreen: React.FC<AccountsListScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const { accounts, isLoading } = useTypedSelector((state) => state.accounts);
  const { profile, displayCurrency } = useTypedSelector((state) => state.user);
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

  const getActiveAccounts = () => {
    return accounts.filter(account => account.is_active);
  };

  const handleAddAccount = () => {
    navigation.navigate('AddEditAccount');
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
        currency={displayCurrency}
        subtitle={`Across ${getActiveAccounts().length} active accounts`}
      />
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Accounts</Text>
        <Text style={styles.accountCount}>
          {accounts.length}
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
        <View style={styles.menuButton} />
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
        style={styles.fab}
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