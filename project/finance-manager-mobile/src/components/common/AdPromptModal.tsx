import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/colors';

interface AdPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onWatchAd: () => Promise<boolean>;
  onUpgrade: () => void;
  onExportAfterAd: () => void;
  isLoadingAd: boolean;
  exportOptions?: Array<{
    type: 'watch_ad' | 'upgrade';
    title: string;
    description: string;
    reward?: string;
    price?: string;
  }>;
}

const AdPromptModal: React.FC<AdPromptModalProps> = ({
  visible,
  onClose,
  onWatchAd,
  onUpgrade,
  onExportAfterAd,
  isLoadingAd,
  exportOptions = [],
}) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const handleWatchAd = async () => {
    setIsWatchingAd(true);
    try {
      const success = await onWatchAd();
      if (success) {
        onClose();
        Alert.alert(
          'Export Unlocked! 🎉',
          'You\'ve earned 1 additional export. Starting export now...',
          [{ 
            text: 'OK', 
            onPress: () => onExportAfterAd()
          }]
        );
      } else {
        Alert.alert(
          'Ad Not Available',
          'The ad is not ready yet. Please try again in a moment or upgrade to Premium for unlimited exports.',
          [
            { text: 'Try Again', onPress: () => setIsWatchingAd(false) },
            { text: 'Upgrade', onPress: onUpgrade },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load the ad. Please try again or upgrade to Premium.',
        [
          { text: 'Try Again', onPress: () => setIsWatchingAd(false) },
          { text: 'Upgrade', onPress: onUpgrade },
        ]
      );
    } finally {
      setIsWatchingAd(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>📊 Export Limit Reached</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.message}>
              {exportOptions.length > 0 
                ? 'You\'ve reached your export limit. Choose an option below:'
                : 'You\'ve used your export limit. Watch a short ad to get 1 additional export, or upgrade to Premium for unlimited exports.'
              }
            </Text>

            {exportOptions.length > 0 ? (
              <View style={styles.optionsContainer}>
                {exportOptions.map((option, index) => (
                  <View key={index} style={styles.optionItem}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>🎁 What you'll get:</Text>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>1 additional export</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>Same export quality</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>No waiting time</Text>
                </View>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.watchAdButton,
                  (isWatchingAd || isLoadingAd) && styles.buttonDisabled
                ]}
                onPress={handleWatchAd}
                disabled={isWatchingAd || isLoadingAd}
              >
                {isWatchingAd ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Text style={styles.watchAdButtonText}>
                    {isLoadingAd ? 'Loading Ad...' : '🎬 Watch Ad & Export'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={onUpgrade}
              >
                <Text style={styles.upgradeButtonText}>💎 Upgrade to Premium</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.lg,
  },
  message: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  benefitsContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  optionsContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  optionItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  benefitsTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  benefitIcon: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  benefitText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
  },
  buttonContainer: {
    gap: spacing.sm,
  },
  watchAdButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  watchAdButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

export default AdPromptModal;
