import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { logout } from '../../store/slices/authSlice';
import { colors, typography, spacing } from '../../constants/colors';

interface MoreScreenProps {
  navigation: any;
}

const MoreScreen: React.FC<MoreScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useTypedSelector((state) => state.auth);

  const menuItems = [
    {
      title: 'Categories',
      icon: '🏷️',
      screen: 'Categories',
      description: 'Manage transaction categories',
    },
    {
      title: 'Budgets',
      icon: '📊',
      screen: 'Budgets',
      description: 'Set and track budgets',
    },
    {
      title: 'Bills & Reminders',
      icon: '📅',
      screen: 'Bills',
      description: 'Manage recurring bills',
    },
    {
      title: 'Analytics',
      icon: '📈',
      screen: 'Analytics',
      description: 'Detailed financial insights',
    },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
  };

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={styles.menuItem}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuDescription}>{item.description}</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>More</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Text style={styles.menuButtonIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.first_name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.subscriptionTier}>
                {user?.subscription_tier === 'premium' ? '⭐ Premium' : '🆓 Free'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.editProfileText}>View Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() =>
                navigation.navigate('Transactions', {
                  screen: 'AddEditTransaction',
                })
              }
            >
              <Text style={styles.quickActionIcon}>💰</Text>
              <Text style={styles.quickActionText}>Add Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() =>
                navigation.navigate('Goals', {
                  screen: 'AddManualGoal',
                })
              }
            >
              <Text style={styles.quickActionIcon}>🎯</Text>
              <Text style={styles.quickActionText}>Create Goal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() =>
                navigation.navigate('Accounts', {
                  screen: 'AddEditAccount',
                })
              }
            >
              <Text style={styles.quickActionIcon}>🏦</Text>
              <Text style={styles.quickActionText}>Add Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('StatementImport')}
            >
              <Text style={styles.quickActionIcon}>📄</Text>
              <Text style={styles.quickActionText}>Import</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
            <Text style={styles.settingsText}>App Settings</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <Text style={styles.settingsIcon}>❓</Text>
            <Text style={styles.settingsText}>Help & Support</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingsItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <Text style={styles.settingsIcon}>🚪</Text>
            <Text style={[styles.settingsText, styles.logoutText]}>Logout</Text>
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
  header: {
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
  menuButtonIcon: {
    fontSize: 24,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h2,
    color: colors.background,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  subscriptionTier: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  editProfileButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  editProfileText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  menuDescription: {
    ...typography.small,
    color: colors.textSecondary,
  },
  chevron: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  quickActionsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  quickActionText: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  settingsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  settingsText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  logoutItem: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  logoutText: {
    color: colors.error,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default MoreScreen;