import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { appUpdateService } from '../../services/appUpdateService';
import { colors } from '../../constants/colors';
import { appUpdateConfig } from '../../config/appUpdateConfig';

const { width, height } = Dimensions.get('window');

interface AppUpdateOverlayProps {
  visible: boolean;
}

const AppUpdateOverlay: React.FC<AppUpdateOverlayProps> = ({ visible }) => {
  const { updateInfo } = useTypedSelector((state) => state.appUpdate);

  if (!visible || !updateInfo) {
    return null;
  }

  const handleUpdateNow = async () => {
    try {
      await appUpdateService.openPlayStoreForUpdate();
    } catch (error) {
      console.error('Error opening Play Store:', error);
      Alert.alert(
        'Update Required',
        'Please manually open the Play Store and search for "Finance Manager" to update the app.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLater = async () => {
    if (updateInfo.isUpdateRequired && !updateInfo.forceUpdate) {
      // This is an optional update - allow dismiss
      await appUpdateService.dismissUpdate();
    } else {
      // This is a force update - show alert
      Alert.alert(
        'Update Required',
        'This app requires the latest version to function properly. Please update to continue.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* App Icon Placeholder */}
          <View style={styles.appIconContainer}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>💵</Text>
            </View>
          </View>

          {/* Update Required Text */}
          <Text style={[styles.title, updateInfo.forceUpdate && styles.forceUpdateTitle]}>
            {updateInfo.forceUpdate ? '🔄 Update Required' : '📱 Update Available'}
          </Text>
          <Text style={[styles.subtitle, updateInfo.forceUpdate && styles.forceUpdateSubtitle]}>
            {updateInfo.forceUpdate 
              ? 'A new version of Finance Manager is required to continue'
              : 'A new version of Finance Manager is available'
            }
          </Text>
          
          {/* Force Update Warning */}
          {updateInfo.forceUpdate && (
            <View style={styles.forceUpdateWarning}>
              <Text style={styles.forceUpdateWarningText}>
                ⚠️ This update is mandatory and cannot be postponed
              </Text>
            </View>
          )}

          {/* Version Info */}
          {appUpdateConfig.UI.SHOW_VERSION_INFO && (
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>
                Current Version: {updateInfo.currentVersion}
              </Text>
              <Text style={styles.versionText}>
                Latest Version: {updateInfo.latestVersion}
              </Text>
            </View>
          )}

          {/* Release Notes */}
          {appUpdateConfig.UI.SHOW_RELEASE_NOTES && updateInfo.releaseNotes && (
            <View style={styles.releaseNotesContainer}>
              <Text style={styles.releaseNotesTitle}>What's New:</Text>
              <Text style={styles.releaseNotesText}>
                {updateInfo.releaseNotes}
              </Text>
            </View>
          )}

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.updateButton, updateInfo.forceUpdate && styles.forceUpdateButton]}
            onPress={handleUpdateNow}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={updateInfo.forceUpdate ? ['#e74c3c', '#c0392b'] : [colors.primary, colors.primaryDark]}
              style={styles.updateButtonGradient}
            >
              <Text style={styles.updateButtonText}>
                {updateInfo.forceUpdate ? 'Update Now' : 'Update'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Later Button (Only for non-force updates) */}
          {appUpdateConfig.UI.SHOW_REMIND_LATER_BUTTON && !updateInfo.forceUpdate && (
            <TouchableOpacity
              style={styles.laterButton}
              onPress={handleLater}
              activeOpacity={0.6}
            >
              <Text style={styles.laterButtonText}>Remind Me Later</Text>
            </TouchableOpacity>
          )}

          {/* Info Text */}
          <Text style={styles.infoText}>
            {updateInfo.forceUpdate 
              ? 'This app requires the latest version to function properly'
              : 'Update to get the latest features and improvements'
            }
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  appIconContainer: {
    marginBottom: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appIconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  forceUpdateTitle: {
    color: '#e74c3c', // Red color for force updates
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  forceUpdateSubtitle: {
    color: '#e74c3c', // Red color for force updates
    fontWeight: '600',
  },
  forceUpdateWarning: {
    backgroundColor: '#fdf2f2',
    borderColor: '#e74c3c',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  forceUpdateWarningText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  versionContainer: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 5,
  },
  releaseNotesContainer: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    width: '100%',
  },
  releaseNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  releaseNotesText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  updateButton: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  forceUpdateButton: {
    shadowColor: '#e74c3c',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  updateButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  laterButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  laterButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default AppUpdateOverlay;
