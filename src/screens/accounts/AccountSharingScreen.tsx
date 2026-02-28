import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface AccountSharingScreenProps {
  navigation: any;
  route: any;
}

const AccountSharingScreen: React.FC<AccountSharingScreenProps> = ({ navigation, route }) => {
  const { accountId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Sharing</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.premiumFeature}>
          <Text style={styles.premiumIcon}>⭐</Text>
          <Text style={styles.premiumTitle}>Premium Feature</Text>
          <Text style={styles.premiumDescription}>
            Account sharing is available for Premium subscribers. Share your accounts with family members or financial advisors with customizable permissions.
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Share with multiple users</Text>
            <Text style={styles.featureItem}>• Customizable permissions</Text>
            <Text style={styles.featureItem}>• Real-time sync</Text>
            <Text style={styles.featureItem}>• Activity tracking</Text>
          </View>

          <Text style={styles.availableText}>Feature Available</Text>
        </View>
      </View>
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
    ...typography.h3,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  premiumFeature: {
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
  premiumIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  premiumTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  premiumDescription: {
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
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 200,
  },
  upgradeButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
    textAlign: 'center',
  },
  availableText: {
    ...typography.body,
    color: colors.success,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AccountSharingScreen;