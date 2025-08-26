import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface TutorialItem {
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

const HelpSupportScreen: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How do I add a new transaction?",
      answer: "Tap the '+' button on the main dashboard or go to Transactions > Add Transaction. Fill in the amount, category, date, and any notes, then save.",
      category: "Transactions"
    },
    {
      question: "How do I create a budget?",
      answer: "Navigate to Budgets in the main menu, tap 'Create Budget', select a category, set your spending limit, and choose the time period.",
      category: "Budgets"
    },
    {
      question: "Can I export my financial data?",
      answer: "Yes! Go to More > Export Data to download your transactions in Excel, CSV, or PDF format. Premium users get unlimited exports.",
      category: "Data Management"
    },
    {
      question: "How do I set up financial goals?",
      answer: "Go to Goals section, tap 'Create Goal', choose between saving, debt payoff, or custom goals, set your target amount and timeline.",
      category: "Goals"
    },
    {
      question: "Is my financial data secure?",
      answer: "Absolutely! We use bank-level encryption and never store your banking credentials. Your data is encrypted both in transit and at rest.",
      category: "Security"
    },
    {
      question: "How do I connect my bank account?",
      answer: "Go to Accounts > Add Account > Connect Bank. We use secure third-party services that are certified by major banks and financial institutions.",
      category: "Accounts"
    },
    {
      question: "What's the difference between free and premium?",
      answer: "Free users get basic features with limited exports. Premium includes unlimited exports, advanced analytics, priority support, and ad-free experience.",
      category: "Premium Features"
    },
    {
      question: "How do I change my currency?",
      answer: "Go to Profile > Settings > Currency to change your default currency. This affects how amounts are displayed throughout the app.",
      category: "Settings"
    }
  ];

  const tutorials: TutorialItem[] = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of using the app",
      icon: "🚀",
      action: () => showTutorial("getting-started")
    },
    {
      title: "Budget Management",
      description: "Master budgeting and spending tracking",
      icon: "📊",
      action: () => showTutorial("budgeting")
    },
    {
      title: "Goal Setting",
      description: "Set and achieve financial goals",
      icon: "🎯",
      action: () => showTutorial("goals")
    },
    {
      title: "Data Export",
      description: "Export and backup your data",
      icon: "📤",
      action: () => showTutorial("export")
    }
  ];

  const contactOptions = [
    {
      title: "Email Support",
      description: "Get help via email",
      icon: "📧",
      action: () => openEmail()
    },
    {
      title: "Live Chat",
      description: "Chat with our support team",
      icon: "💬",
      action: () => openLiveChat()
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

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const showTutorial = (tutorial: string) => {
    Alert.alert(
      "Tutorial",
      `This will open the ${tutorial} tutorial. Coming soon!`,
      [{ text: "OK" }]
    );
  };

  const openEmail = () => {
    Linking.openURL('mailto:support@financemanager.com?subject=Help Request');
  };

  const openLiveChat = () => {
    Alert.alert(
      "Live Chat",
      "Live chat support is available during business hours (9 AM - 6 PM EST). Would you like to start a chat?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Start Chat", onPress: () => Alert.alert("Chat", "Connecting to support agent...") }
      ]
    );
  };

  const reportBug = () => {
    Linking.openURL('mailto:bugs@financemanager.com?subject=Bug Report');
  };

  const requestFeature = () => {
    Linking.openURL('mailto:features@financemanager.com?subject=Feature Request');
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

  const renderTutorialItem = (tutorial: TutorialItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.tutorialItem}
      onPress={tutorial.action}
      activeOpacity={0.7}
    >
      <Text style={styles.tutorialIcon}>{tutorial.icon}</Text>
      <View style={styles.tutorialContent}>
        <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
        <Text style={styles.tutorialDescription}>{tutorial.description}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  const renderContactItem = (contact: any, index: number) => (
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
        {/* Quick Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          <View style={styles.quickHelpGrid}>
            <TouchableOpacity style={styles.quickHelpItem} onPress={() => setExpandedFAQ(0)}>
              <Text style={styles.quickHelpIcon}>💰</Text>
              <Text style={styles.quickHelpText}>Add Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickHelpItem} onPress={() => setExpandedFAQ(1)}>
              <Text style={styles.quickHelpIcon}>📊</Text>
              <Text style={styles.quickHelpText}>Create Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickHelpItem} onPress={() => setExpandedFAQ(3)}>
              <Text style={styles.quickHelpIcon}>🎯</Text>
              <Text style={styles.quickHelpText}>Set Goals</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickHelpItem} onPress={() => setExpandedFAQ(2)}>
              <Text style={styles.quickHelpIcon}>📤</Text>
              <Text style={styles.quickHelpText}>Export Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tutorials Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tutorials & Guides</Text>
          {tutorials.map(renderTutorialItem)}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map(renderFAQItem)}
        </View>

        {/* Contact Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          {contactOptions.map(renderContactItem)}
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
  quickHelpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickHelpItem: {
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
  quickHelpIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  quickHelpText: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  tutorialItem: {
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
  tutorialIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  tutorialContent: {
    flex: 1,
  },
  tutorialTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tutorialDescription: {
    ...typography.small,
    color: colors.textSecondary,
  },
  chevron: {
    ...typography.h3,
    color: colors.textSecondary,
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