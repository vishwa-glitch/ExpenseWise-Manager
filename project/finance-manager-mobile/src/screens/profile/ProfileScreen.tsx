import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { fetchUserProfile } from '../../store/slices/userSlice';
import { logout } from '../../store/slices/authSlice';
import { CustomButton, LoadingSpinner, FeaturesList } from '../../components/common';
import { colors, typography, spacing } from '../../constants/colors';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const { profile, isLoading } = useTypedSelector((state) => state.user);
  const { user, isAuthenticated } = useTypedSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData();
    }
  }, [isAuthenticated]);

  const loadProfileData = async () => {
    if (!isAuthenticated) {
      console.log('🚫 Skipping profile data load - user not authenticated');
      return;
    }

    try {
      console.log('👤 Loading profile data for authenticated user');
      await dispatch(fetchUserProfile());
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const onRefresh = async () => {
    if (!isAuthenticated) {
      console.log('🚫 Skipping refresh - user not authenticated');
      return;
    }

    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };





  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logout());
          },
        },
      ]
    );
  };





  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.first_name?.charAt(0) || user?.first_name?.charAt(0) || 'U'}
          </Text>
        </View>

      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {profile?.first_name || user?.first_name} {profile?.last_name || user?.last_name}
        </Text>
        <Text style={styles.userEmail}>
          {profile?.email || user?.email}
        </Text>

      </View>
    </View>
  );

  const renderAccountStats = () => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Account Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.stats?.account_count || 0}</Text>
          <Text style={styles.statLabel}>Accounts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.stats?.transaction_count || 0}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.stats?.active_goal_count || 0}</Text>
          <Text style={styles.statLabel}>Goals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.stats?.custom_category_count || 0}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>
    </View>
  );

  const renderFeaturesInfo = () => {
    return (
      <View style={styles.subscriptionSection}>
        <FeaturesList />
      </View>
    );
  };

  const renderActions = () => (
    <View style={styles.actionsSection}>
      <Text style={styles.sectionTitle}>Actions</Text>
      
      <TouchableOpacity
        style={styles.actionItem}
        onPress={handleEditProfile}
      >
        <Text style={styles.actionIcon}>✏️</Text>
        <Text style={styles.actionText}>Edit Profile</Text>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>





      <TouchableOpacity
        style={[styles.actionItem, styles.logoutItem]}
        onPress={handleLogout}
      >
        <Text style={styles.actionIcon}>🚪</Text>
        <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated || (isLoading && !profile)) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}
        {renderAccountStats()}
        {renderFeaturesInfo()}
        {renderActions()}

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
  backButton: {
    padding: spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  editButton: {
    padding: spacing.sm,
  },
  editIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  profileHeader: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h1,
    color: colors.background,
    fontWeight: 'bold',
  },

  userInfo: {
    alignItems: 'center',
  },
  userName: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  memberStatus: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  statusMessage: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  statsSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  subscriptionSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  actionsSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 24,
  },
  actionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  actionArrow: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: colors.error,
  },
  bottomSpacing: {
    height: spacing.md,
  },
});

export default ProfileScreen;