import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface BudgetsScreenProps {
  navigation: any;
}

const BudgetsScreen: React.FC<BudgetsScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budgets</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonIcon}>📊</Text>
          <Text style={styles.comingSoonTitle}>Budgets Coming Soon</Text>
          <Text style={styles.comingSoonDescription}>
            Set spending limits, track progress, and get alerts when you're approaching your budget limits.
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Category-based budgets</Text>
            <Text style={styles.featureItem}>• Monthly and custom periods</Text>
            <Text style={styles.featureItem}>• Progress tracking</Text>
            <Text style={styles.featureItem}>• Smart alerts</Text>
          </View>
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
  comingSoon: {
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
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  comingSoonTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  comingSoonDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  featureList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
  },
});

export default BudgetsScreen;