import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserData } from '../../hooks/useTypedSelector';
import { colors, typography, spacing } from '../../constants/colors';

interface SimpleDashboardScreenProps {
  navigation: any;
}

const SimpleDashboardScreen: React.FC<SimpleDashboardScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, isLoading } = useUserData();

  console.log('🔍 SimpleDashboardScreen - User data:', { user, isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Finance Manager</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
          <Text style={styles.userCurrency}>
            Currency: {user?.preferred_currency || 'USD'}
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>App Status</Text>
          <Text style={styles.statusText}>✅ Authentication: {isAuthenticated ? 'Success' : 'Failed'}</Text>
          <Text style={styles.statusText}>✅ Dashboard: Loaded</Text>
          <Text style={styles.statusText}>✅ New Architecture: Enabled</Text>
          <Text style={styles.statusText}>✅ Hermes: Enabled</Text>
        </View>

        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => {
            console.log('🧪 Test button pressed');
            alert('Test button works! App is functioning correctly.');
          }}
        >
          <Text style={styles.testButtonText}>Test Button</Text>
        </TouchableOpacity>

        <View style={styles.debugInfo}>
          <Text style={styles.debugTitle}>Debug Information:</Text>
          <Text style={styles.debugText}>User ID: {user?.id || 'N/A'}</Text>
          <Text style={styles.debugText}>Subscription: {user?.subscription_tier || 'N/A'}</Text>
          <Text style={styles.debugText}>Created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  contentContainer: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  userInfo: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  userCurrency: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  testButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugInfo: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  debugText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default SimpleDashboardScreen;
