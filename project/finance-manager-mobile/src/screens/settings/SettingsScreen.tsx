import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import {
  setFontSize,
  setFontFamily,
  setBoldNumbers,
} from '../../store/slices/uiSlice';
import { colors, typography, spacing } from '../../constants/colors';
import { ScreenContainer, ScreenHeader } from '../../components/common';
import { useFontSettings } from '../../hooks/useFontSettings';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { fontSize, fontFamily, boldNumbers } = useTypedSelector((state) => state.ui);
  const { applyFonts, createNumberStyleWithSettings } = useFontSettings();

  const fontSizes = [
    { label: 'Small', value: 'small' as const },
    { label: 'Medium', value: 'medium' as const },
    { label: 'Large', value: 'large' as const },
  ];

  const fontFamilies = [
    { label: 'System', value: 'system' as const },
    { label: 'Serif', value: 'serif' as const },
    { label: 'Monospace', value: 'monospace' as const },
  ];

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    dispatch(setFontSize(size));
  };

  const handleFontFamilyChange = (family: 'system' | 'serif' | 'monospace') => {
    dispatch(setFontFamily(family));
  };

  const handleBoldNumbersToggle = (value: boolean) => {
    dispatch(setBoldNumbers(value));
  };

  const renderSettingItem = (
    title: string,
    subtitle?: string,
    rightComponent?: React.ReactNode
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent && <View style={styles.settingRight}>{rightComponent}</View>}
    </View>
  );

  const renderDropdown = (
    options: Array<{ label: string; value: string }>,
    currentValue: string,
    onSelect: (value: any) => void
  ) => (
    <View style={styles.dropdownContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.dropdownOption,
            currentValue === option.value && styles.dropdownOptionSelected,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              styles.dropdownOptionText,
              currentValue === option.value && styles.dropdownOptionTextSelected,
            ]}
          >
            {option.label}
          </Text>
          {currentValue === option.value && (
            <Text style={styles.dropdownCheckmark}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );


  return (
    <ScreenContainer>
      <ScreenHeader
        title="Settings"
        leftComponent={
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonIcon}>‹</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView}>
        {/* Font & Size Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Font & Size</Text>
          
          {/* Font Size */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingGroupTitle}>Font Size</Text>
            {renderDropdown(
              fontSizes,
              fontSize,
              handleFontSizeChange
            )}
          </View>

          {/* Font Family */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingGroupTitle}>Font Family</Text>
            {renderDropdown(
              fontFamilies,
              fontFamily,
              handleFontFamilyChange
            )}
          </View>

          {/* Bold Numbers */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingGroupTitle}>Bold Numbers</Text>
            {renderSettingItem(
              'Make numbers bold throughout the app',
              'Enhances readability of financial figures',
              <Switch
                value={boldNumbers}
                onValueChange={handleBoldNumbersToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            )}
          </View>
        </View>

        {/* Preview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewContainer}>
            <Text style={applyFonts(styles.previewTitle)}>Sample Text</Text>
            <Text style={createNumberStyleWithSettings(styles.previewBalance)}>$1,234.56</Text>
            <Text style={applyFonts(styles.previewDescription)}>
              This is how your text will appear with the current settings.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: spacing.sm,
  },
  backButtonIcon: {
    fontSize: 24,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
    fontWeight: 'bold',
  },
  settingGroup: {
    marginBottom: spacing.lg,
  },
  settingGroupTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  settingSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  settingRight: {
    marginLeft: spacing.md,
  },
  dropdownContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownOptionSelected: {
    backgroundColor: colors.primary,
  },
  dropdownOptionText: {
    ...typography.body,
    color: colors.text,
  },
  dropdownOptionTextSelected: {
    color: colors.background,
    fontWeight: '600',
  },
  dropdownCheckmark: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  previewBalance: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  previewDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default SettingsScreen;