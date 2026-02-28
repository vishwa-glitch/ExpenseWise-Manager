import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface FilterValidationFeedbackProps {
  validation: ValidationResult;
  onDismissWarning?: (index: number) => void;
  showDismissButton?: boolean;
}

const FilterValidationFeedback: React.FC<FilterValidationFeedbackProps> = ({
  validation,
  onDismissWarning,
  showDismissButton = true,
}) => {
  if (validation.isValid && validation.warnings.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Errors */}
      {validation.errors.map((error, index) => (
        <View key={`error-${index}`} style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ))}

      {/* Warnings */}
      {validation.warnings.map((warning, index) => (
        <View key={`warning-${index}`} style={styles.warningContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>{warning}</Text>
          {showDismissButton && onDismissWarning && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => onDismissWarning(index)}
            >
              <Text style={styles.dismissButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.error + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    flex: 1,
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  warningText: {
    ...typography.small,
    color: colors.warning,
    flex: 1,
    lineHeight: 20,
  },
  dismissButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  dismissButtonText: {
    ...typography.small,
    color: colors.warning,
    fontWeight: 'bold',
  },
});

export default FilterValidationFeedback;