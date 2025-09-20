import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

const FeaturesList: React.FC = () => {
  const features = [
    { text: 'Unlimited Accounts', icon: '🏦' },
    { text: 'Unlimited Financial Goals', icon: '🎯' },
    { text: 'Excel & PDF Export', icon: '📄' },
    { text: 'Budget Tracking & Management', icon: '💰' },
    { text: 'Multi-Currency Support', icon: '💱' },
    { text: 'Real-time Sync Across Devices', icon: '☁️' },
    { text: 'Advanced Analytics & Insights', icon: '📊' },
    { text: 'Secure Data Encryption', icon: '🔒' },
    { text: 'More features coming soon...', icon: '🚀', isComingSoon: true },
  ];

  const renderFeature = (feature: { text: string; icon: string; isComingSoon?: boolean }, index: number) => (
    <View key={index} style={[styles.featureRow, feature.isComingSoon && styles.comingSoonRow]}>
      <Text style={styles.featureIcon}>{feature.icon}</Text>
      <Text style={[styles.featureText, feature.isComingSoon && styles.comingSoonText]}>{feature.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Available Features</Text>
      <View style={styles.featuresContainer}>
        {features.map(renderFeature)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    width: 20,
    textAlign: 'center',
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  comingSoonRow: {
    opacity: 0.7,
  },
  comingSoonText: {
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
});

export default FeaturesList;
