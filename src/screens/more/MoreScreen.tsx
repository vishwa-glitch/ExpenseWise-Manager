import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector, useUserData } from '../../hooks/useTypedSelector';
import { logout } from '../../store/slices/authSlice';
import { colors, typography, spacing } from '../../constants/colors';


interface MoreScreenProps {
  navigation: any;
}

const MoreScreen: React.FC<MoreScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useUserData();

  const menuItems = [
    {
      title: 'Categories',
      icon: '🏷️',
      screen: 'Categories',
      description: 'Manage transaction categories',
    },
    {
      title: 'Export Data',
      icon: '📤',
      screen: 'Export', 
      description: 'Export transactions to Excel, CSV, or PDF',
    },
    {
      title: 'Notifications',
      icon: '🔔',
      screen: 'NotificationSettings',
      description: 'Manage notification preferences',
    },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
  };

  const contactOptions = [
    {
      title: "Email Support",
      description: "Get help via email",
      icon: "📧",
      action: () => openEmail()
    },
    {
      title: "Telegram Support",
      description: "Chat with us on Telegram",
      icon: "telegram",
      action: () => openTelegram()
    },
    {
      title: "Report a Bug",
      description: "Help us improve the app",
      icon: "🐛",
      action: () => reportBug()
    },
    {
      title: "Feature Request",
      description: "Suggest new features",
      icon: "💡",
      action: () => requestFeature()
    }
  ];

  const openEmail = () => {
    Linking.openURL('mailto:wealthwise523@gmail.com?subject=Help Request');
  };

  const openTelegram = () => {
    Linking.openURL('https://t.me/WealthWiseSuppo');
  };

  const reportBug = () => {
    Linking.openURL('mailto:wealthwise523@gmail.com?subject=Bug Report');
  };

  const requestFeature = () => {
    Linking.openURL('mailto:wealthwise523@gmail.com?subject=Feature Request');
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
        <View style={styles.menuButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileContent}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.first_name?.charAt(0) || 'U'}
                  </Text>
                </View>

              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.first_name} {user?.last_name}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email}
                </Text>

              </View>
            </View>
            <View style={styles.profileArrow}>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>
        </View>



        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Customer Support */}
        <View style={styles.customerSupportSection}>
          <Text style={styles.sectionTitle}>Customer Support</Text>
          {contactOptions.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={contact.action}
              activeOpacity={0.7}
            >
              {contact.icon === "telegram" ? (
                <Image 
                  source={require('../../../assets/telegram-logo.png')} 
                  style={styles.telegramIcon} 
                />
              ) : (
                <Text style={styles.contactIcon}>{contact.icon}</Text>
              )}
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>{contact.title}</Text>
                <Text style={styles.contactDescription}>{contact.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 19, // Add extra top padding for camera notch
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg, // Increased vertical padding
    paddingTop: spacing.xl, // Extra top padding for header
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
    backgroundColor: colors.card,
    margin: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary + '20',
    // Add a subtle gradient effect
    position: 'relative',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    ...typography.h2,
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 24,
  },
  subscriptionBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  subscriptionBadgeText: {
    fontSize: 14,
  },
  userDetails: {
    flex: 1,
    marginRight: spacing.sm,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    fontSize: 18,
    lineHeight: 22,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontSize: 13,
    lineHeight: 16,
  },
  subscriptionInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  subscriptionTier: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  premiumStatus: {
    ...typography.small,
    color: colors.success,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  profileArrow: {
    padding: spacing.sm,
  },
  arrowIcon: {
    ...typography.h3,
    color: colors.textSecondary,
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
  customerSupportSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  contactItem: {
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
  contactIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  telegramIcon: {
    width: 20,
    height: 20,
    marginRight: spacing.md,
    resizeMode: 'contain',
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  contactDescription: {
    ...typography.small,
    color: colors.textSecondary,
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