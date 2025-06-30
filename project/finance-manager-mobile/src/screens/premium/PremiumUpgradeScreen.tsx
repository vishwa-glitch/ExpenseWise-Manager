import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { upgradeToPremium } from '../../store/slices/userSlice';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { SUBSCRIPTION_TIERS } from '../../config/api';

interface PremiumUpgradeScreenProps {
  navigation: any;
}

const PremiumUpgradeScreen: React.FC<PremiumUpgradeScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { profile } = useTypedSelector((state) => state.user);

  const handleUpgrade = async () => {
    Alert.alert(
      'Upgrade to Premium',
      'This is a demo version. In a real app, this would redirect to payment processing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue Demo',
          onPress: async () => {
            try {
              await dispatch(upgradeToPremium()).unwrap();
              Alert.alert(
                'Success!',
                'Your account has been upgraded to Premium (demo mode).',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to upgrade account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const isPremium = profile?.subscription_tier === 'premium';

  const premiumFeatures = [
    {
      icon: '🏦',
      title: 'Unlimited Accounts',
      description: 'Add as many bank accounts, credit cards, and investment accounts as you need',
      free: '3 accounts',
      premium: 'Unlimited',
    },
    {
      icon: '🏷️',
      title: 'Custom Categories',
      description: 'Create unlimited custom categories to organize your transactions perfectly',
      free: '5 categories',
      premium: 'Unlimited',
    },
    {
      icon: '📄',
      title: 'Statement Import',
      description: 'Import bank statements and transaction files without monthly limits',
      free: '1 per month',
      premium: 'Unlimited',
    },
    {
      icon: '🎯',
      title: 'Financial Goals',
      description: 'Set and track unlimited financial goals with AI-powered insights',
      free: '1 active goal',
      premium: 'Unlimited goals',
    },
    {
      icon: '🤖',
      title: 'AI Goal Setting',
      description: 'Get personalized goal recommendations and smart savings strategies',
      free: 'Not available',
      premium: 'Full access',
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Detailed spending analysis, trends, and predictive insights',
      free: 'Basic reports',
      premium: 'Advanced analytics',
    },
    {
      icon: '📈',
      title: 'Export & Backup',
      description: 'Export unlimited transaction history with custom date ranges',
      free: '1 month history',
      premium: 'Unlimited history + custom ranges',
    },
    {
      icon: '🔔',
      title: 'Smart Alerts',
      description: 'AI-powered spending alerts and budget notifications',
      free: 'Basic alerts',
      premium: 'Smart alerts',
    },
    {
      icon: '🤝',
      title: 'Account Sharing',
      description: 'Share accounts with family members or financial advisors',
      free: 'Not available',
      premium: 'Full sharing',
    },
    {
      icon: '🎧',
      title: 'Priority Support',
      description: 'Get priority customer support and dedicated assistance',
      free: 'Community support',
      premium: 'Priority support',
    },
  ];

  const renderFeatureItem = (feature: any, index: number) => (
    <View key={index} style={styles.featureItem}>
      <View style={styles.featureHeader}>
        <Text style={styles.featureIcon}>{feature.icon}</Text>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureDescription}>{feature.description}</Text>
        </View>
      </View>
      <View style={styles.featureComparison}>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Free</Text>
          <Text style={styles.comparisonValue}>{feature.free}</Text>
        </View>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Premium</Text>
          <Text style={[styles.comparisonValue, styles.premiumValue]}>{feature.premium}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Upgrade</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Premium Header */}
        <View style={styles.premiumHeader}>
          <Text style={styles.premiumIcon}>⭐</Text>
          <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
          <Text style={styles.premiumSubtitle}>
            Unlock powerful features to take control of your finances
          </Text>
          
          {isPremium && (
            <View style={styles.currentPremiumBadge}>
              <Text style={styles.currentPremiumText}>✓ You're already Premium!</Text>
            </View>
          )}
        </View>

        {/* Pricing */}
        {!isPremium && (
          <View style={styles.pricingSection}>
            <View style={styles.pricingCard}>
              <Text style={styles.pricingTitle}>Premium Plan</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.currency}>₹</Text>
                <Text style={styles.price}>299</Text>
                <Text style={styles.period}>/month</Text>
              </View>
              <Text style={styles.pricingSubtext}>
                Cancel anytime • 7-day free trial
              </Text>
            </View>
          </View>
        )}

        {/* Features Comparison */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features Comparison</Text>
          {premiumFeatures.map(renderFeatureItem)}
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Why Upgrade?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>💡</Text>
              <Text style={styles.benefitText}>
                Get AI-powered insights to optimize your spending and reach your financial goals faster
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📊</Text>
              <Text style={styles.benefitText}>
                Export unlimited transaction history with custom date ranges for detailed analysis
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🔒</Text>
              <Text style={styles.benefitText}>
                Advanced security features and automatic backups to keep your data safe
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📱</Text>
              <Text style={styles.benefitText}>
                Seamless experience across all devices with priority customer support
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🚀</Text>
              <Text style={styles.benefitText}>
                Early access to new features and exclusive financial planning tools
              </Text>
            </View>
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.testimonialsSection}>
          <Text style={styles.sectionTitle}>What Our Users Say</Text>
          <View style={styles.testimonial}>
            <Text style={styles.testimonialText}>
              "Premium features helped me save ₹50,000 in just 6 months. The AI insights are incredible!"
            </Text>
            <Text style={styles.testimonialAuthor}>- Priya S., Mumbai</Text>
          </View>
          <View style={styles.testimonial}>
            <Text style={styles.testimonialText}>
              "Unlimited export history made tax filing so much easier. Worth every penny!"
            </Text>
            <Text style={styles.testimonialAuthor}>- Rahul K., Bangalore</Text>
          </View>
          <View style={styles.testimonial}>
            <Text style={styles.testimonialText}>
              "Account sharing with my spouse made our financial planning so much easier."
            </Text>
            <Text style={styles.testimonialAuthor}>- Anita M., Delhi</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Upgrade Button */}
      {!isPremium && (
        <View style={styles.footer}>
          <CustomButton
            title="Start 7-Day Free Trial"
            onPress={handleUpgrade}
            style={styles.upgradeButton}
          />
          <Text style={styles.footerText}>
            No commitment • Cancel anytime
          </Text>
        </View>
      )}
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  premiumHeader: {
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
  premiumIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  premiumTitle: {
    ...typography.h1,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  premiumSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  currentPremiumBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 20,
    marginTop: spacing.lg,
  },
  currentPremiumText: {
    ...typography.body,
    color: colors.success,
    fontWeight: 'bold',
  },
  pricingSection: {
    marginBottom: spacing.lg,
  },
  pricingCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  pricingTitle: {
    ...typography.h3,
    color: colors.background,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  currency: {
    ...typography.h2,
    color: colors.background,
    fontWeight: 'bold',
  },
  price: {
    ...typography.h1,
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 48,
  },
  period: {
    ...typography.body,
    color: colors.background,
    marginLeft: spacing.sm,
  },
  pricingSubtext: {
    ...typography.caption,
    color: colors.background,
    opacity: 0.9,
  },
  featuresSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  featureItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  featureDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  featureComparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  comparisonValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  premiumValue: {
    color: colors.primary,
  },
  benefitsSection: {
    marginBottom: spacing.lg,
  },
  benefitsList: {
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
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  benefitText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  testimonialsSection: {
    marginBottom: spacing.lg,
  },
  testimonial: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  testimonialText: {
    ...typography.body,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  testimonialAuthor: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  upgradeButton: {
    marginBottom: spacing.md,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default PremiumUpgradeScreen;