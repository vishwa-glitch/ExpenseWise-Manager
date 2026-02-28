import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFontSettings } from '../../hooks/useFontSettings';
import { colors, typography, spacing } from '../../constants/colors';

/**
 * Example component demonstrating font settings usage
 */
const FontSettingsExample: React.FC = () => {
  const { applyFonts, createNumberStyleWithSettings, fontSettings } = useFontSettings();

  return (
    <View style={styles.container}>
      <Text style={applyFonts(styles.title)}>Font Settings Demo</Text>
      
      <View style={styles.section}>
        <Text style={applyFonts(styles.sectionTitle)}>Current Settings</Text>
        <Text style={applyFonts(styles.settingText)}>
          Font Size: {fontSettings.fontSize}
        </Text>
        <Text style={applyFonts(styles.settingText)}>
          Font Family: {fontSettings.fontFamily}
        </Text>
        <Text style={applyFonts(styles.settingText)}>
          Bold Numbers: {fontSettings.boldNumbers ? 'ON' : 'OFF'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={applyFonts(styles.sectionTitle)}>Sample Financial Data</Text>
        
        {/* Regular text */}
        <Text style={applyFonts(styles.label)}>Account Balance:</Text>
        
        {/* Number with potential bold styling */}
        <Text style={createNumberStyleWithSettings(styles.balance)}>
          $12,345.67
        </Text>
        
        {/* Regular text */}
        <Text style={applyFonts(styles.description)}>
          This balance reflects your current financial status with the selected font settings applied.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={applyFonts(styles.sectionTitle)}>Transaction Examples</Text>
        
        <View style={styles.transaction}>
          <Text style={applyFonts(styles.transactionLabel)}>Grocery Store</Text>
          <Text style={createNumberStyleWithSettings(styles.transactionAmount)}>
            -$89.45
          </Text>
        </View>
        
        <View style={styles.transaction}>
          <Text style={applyFonts(styles.transactionLabel)}>Salary Deposit</Text>
          <Text style={createNumberStyleWithSettings(styles.transactionAmount)}>
            +$3,500.00
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  settingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  balance: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  transactionAmount: {
    ...typography.body,
    fontWeight: '600',
  },
});

export default FontSettingsExample;
