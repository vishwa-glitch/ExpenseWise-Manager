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
import { fetchUserProfile, fetchSubscriptionStatus } from '../../store/slices/userSlice';
import { logout } from '../../store/slices/authSlice';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors, typography, spacing } from '../../constants/colors';
import { SUBSCRIPTION_TIERS } from '../../config/api';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const { profile, subscriptionStatus, isLoading } = useTypedSelector((state) => state.user);
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
      await Promise.all([
        dispatch(fetchUserProfile()),
        dispatch(fetchSubscriptionStatus()),
      ]);
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

  const handleUpgradeToPremium = () => {
    navigation.navigate('PremiumUpgrade');
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

  const getSubscriptionTierInfo = () => {
    const tier = profile?.subscription_tier || 'free';
    return tier === 'premium' ? SUBSCRIPTION_TIERS.PREMIUM : SUBSCRIPTION_TIERS.FREE;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.first_name?.charAt(0) || user?.first_name?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={styles.subscriptionBadge}>
          <Text style={styles.subscriptionBadgeText}>
            {profile?.subscription_tier === 'premium' ? '⭐' : '🆓'}
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
        <View style={styles.subscriptionContainer}>
          <Text style={styles.subscriptionTier}>
            {profile?.subscription_tier === 'premium' ? 'Premium Member' : 'Free Member'}
          </Text>
          {profile?.subscription_expires_at && (
            <Text style={styles.subscriptionExpiry}>
              Expires: {formatDate(profile.subscription_expires_at)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderAccountStats = () => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Account Statistics</Text>
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
          <Text style={styles.statNumber}>{profile?.stats?.custom_category_count || 0}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.stats?.active_goal_count || 0}</Text>
          <Text style={styles.statLabel}>Goals</Text>
        </View>
      </View>
    </View>
  );

  const renderSubscriptionFeatures = () => {
    const tierInfo = getSubscriptionTierInfo();
    const isPremium = profile?.subscription_tier === 'premium';

    return (
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>
          {isPremium ? 'Premium Features' : 'Your Plan Features'}
        </Text>
        <View style={styles.featuresList}>
          {tierInfo.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>
                {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.limitsContainer}>
          <Text style={styles.limitsTitle}>Plan Limits</Text>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Accounts:</Text>
            <Text style={styles.limitValue}>
              {tierInfo.accounts === -1 ? 'Unlimited' : tierInfo.accounts}
            </Text>
          </View>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Custom Categories:</Text>
            <Text style={styles.limitValue}>
              {tierInfo.custom_categories === -1 ? 'Unlimited' : tierInfo.custom_categories}
            </Text>
          </View>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Monthly Uploads:</Text>
            <Text style={styles.limitValue}>
              {tierInfo.monthly_uploads === -1 ? 'Unlimited' : tierInfo.monthly_uploads}
            </Text>
          </View>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Active Goals:</Text>
            <Text style={styles.limitValue}>
              {tierInfo.active_goals === -1 ? 'Unlimited' : tierInfo.active_goals}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderActions = () => (
    <View style={styles.actionsSection}>
      <Text style={styles.sectionTitle}>Account Actions</Text>
      
      <CustomButton
        title="Edit Profile"
        onPress={handleEditProfile}
        variant="outline"
        style={styles.actionButton}
      />

      {profile?.subscription_tier !== 'premium' && (
        <CustomButton
          title="Upgrade to Premium"
          onPress={handleUpgradeToPremium}
          variant="primary"
          style={styles.actionButton}
        />
      )}

      <CustomButton
        title="Logout"
        onPress={handleLogout}
        variant="danger"
        style={styles.actionButton}
      />
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
        {renderSubscriptionFeatures()}
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
    padding: spacing.lg,
  },
  profileHeader: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h1,
    color: colors.background,
    fontWeight: 'bold',
  },
  subscriptionBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  subscriptionBadgeText: {
    fontSize: 16,
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
    marginBottom: spacing.md,
  },
  subscriptionContainer: {
    alignItems: 'center',
  },
  subscriptionTier: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subscriptionExpiry: {
    ...typography.small,
    color: colors.textSecondary,
  },
  statsSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
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
  featuresSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featuresList: {
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    fontSize: 16,
    color: colors.primary,
    marginRight: spacing.md,
    fontWeight: 'bold',
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  limitsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
  },
  limitsTitle: {
    ...typography.caption,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  limitLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  limitValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  actionsSection: {
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
  actionButton: {
    marginBottom: spacing.md,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default ProfileScreen;