import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../constants/colors';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const HelpSupportScreen: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const navigation = useNavigation();

  const faqs: FAQItem[] = [
    {
      question: "How do I create my first account?",
      answer: "To create your first account, go to the Accounts section in the main menu and tap 'Add Account'. You can either manually add an account by entering the account details, or connect your bank account securely through our encrypted connection. For manual accounts, simply enter the account name, type (checking, savings, credit card, etc.), and initial balance.",
      category: "Accounts"
    },
    {
      question: "How do custom categories work?",
      answer: "Custom categories allow you to organize your transactions exactly how you want. Go to Categories in the main menu and tap 'Create Category'. You can choose an icon, name, and color for your category. These custom categories will appear alongside the default ones when you add transactions, helping you track spending patterns that matter to you.",
      category: "Categories"
    },
    {
      question: "How do I create a budget?",
      answer: "Navigate to Budgets in the main menu and tap 'Create Budget'. Select a category (either default or custom), set your spending limit, and choose the time period (monthly, weekly, or custom). You can also set up recurring budgets that automatically reset each period. The app will track your spending and show your progress visually.",
      category: "Budgets"
    },
    {
      question: "What happens when I exceed my budget?",
      answer: "When you exceed your budget, you'll receive a notification alerting you. The budget progress bar will turn red, and you can see exactly how much you've overspent. You can either adjust your budget for the current period or use this as motivation to stay within budget next time. Premium users get detailed insights on overspending patterns.",
      category: "Budgets"
    },
    {
      question: "How secure is my financial data?",
      answer: "Your financial data is protected with bank-level security. We use 256-bit AES encryption for data at rest and TLS 1.3 for data in transit. We never store your banking credentials - they're handled securely by our certified third-party partners. Your data is backed up securely and you can export or delete it anytime. We also use biometric authentication for additional security.",
      category: "Security"
    },
    {
      question: "Do you sell my financial data?",
      answer: "No, we never sell your financial data. Your privacy is our top priority. We only use your data to provide you with the financial management services you've requested, such as transaction categorization, budget tracking, and financial insights. We don't share your personal or financial information with third parties for marketing or advertising purposes.",
      category: "Privacy"
    },
    {
      question: "How do I delete my account?",
      answer: "You can delete your account by going to Help & Support > Delete Account. This will permanently remove your account and all associated data including transactions, budgets, goals, and settings. Before deleting, consider exporting your data. The deletion process requires typing a confirmation phrase and entering your password for security.",
      category: "Account"
    }
  ];



  const helpOptions = [
    {
      title: "Delete Account",
      description: "Permanently delete your account and data",
      icon: "🗑️",
      action: () => navigateToAccountDeletion()
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };



  const navigateToAccountDeletion = () => {
    navigation.navigate('AccountDeletion' as never);
  };

  const renderFAQItem = (faq: FAQItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.faqItem}
      onPress={() => toggleFAQ(index)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Text style={styles.faqIcon}>
          {expandedFAQ === index ? '−' : '+'}
        </Text>
      </View>
      {expandedFAQ === index && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
          <View style={styles.faqCategory}>
            <Text style={styles.faqCategoryText}>{faq.category}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHelpItem = (contact: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.contactItem}
      onPress={contact.action}
      activeOpacity={0.7}
    >
      <Text style={styles.contactIcon}>{contact.icon}</Text>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{contact.title}</Text>
        <Text style={styles.contactDescription}>{contact.description}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <Text style={styles.headerSubtitle}>We're here to help you succeed</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map(renderFAQItem)}
        </View>


        {/* Help Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help Options</Text>
          {helpOptions.map(renderHelpItem)}
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.appInfoCard}>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Version</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Build</Text>
              <Text style={styles.appInfoValue}>2024.1.1</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Last Updated</Text>
              <Text style={styles.appInfoValue}>January 2024</Text>
            </View>
          </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  faqItem: {
    backgroundColor: colors.card,
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
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  faqQuestion: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.md,
  },
  faqIcon: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  faqAnswer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  faqAnswerText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  faqCategory: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  faqCategoryText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
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
  chevron: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  appInfoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  appInfoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  appInfoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default HelpSupportScreen;