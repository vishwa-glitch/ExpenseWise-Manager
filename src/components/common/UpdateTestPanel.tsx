import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAppUpdate } from '../../hooks/useAppUpdate';
import { appUpdateService } from '../../services/appUpdateService';
import { colors } from '../../constants/colors';

/**
 * Development-only component for testing app update functionality
 * Remove this component before production deployment
 */
const UpdateTestPanel: React.FC = () => {
  const { isUpdateRequired, updateInfo, isLoading } = useAppUpdate();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (__DEV__ === false) {
    return null;
  }

  const handleForceUpdateCheck = async () => {
    try {
      await appUpdateService.forceCheckForUpdates();
      Alert.alert('Update Check', 'Update check completed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to check for updates');
    }
  };

  const handleSimulateUpdate = () => {
    Alert.alert(
      'Simulate Update',
      'To test the update flow:\n\n1. Go to appUpdateConfig.ts\n2. Set MOCK_LATEST_VERSION to a higher version\n3. Set TESTING.ENABLED to true\n4. Restart the app',
      [{ text: 'OK' }]
    );
  };

  const handleOpenPlayStore = async () => {
    try {
      await appUpdateService.openPlayStoreForUpdate();
    } catch (error) {
      Alert.alert('Error', 'Failed to open Play Store');
    }
  };

  if (!isVisible) {
    return (
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.toggleButtonText}>🔧 Test Updates</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Update Test Panel</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setIsVisible(false)}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <Text style={styles.statusText}>
            Update Required: {isUpdateRequired ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.statusText}>
            Loading: {isLoading ? 'Yes' : 'No'}
          </Text>
        </View>

        {updateInfo && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Update Info</Text>
            <Text style={styles.infoText}>
              Current: {updateInfo.currentVersion}
            </Text>
            <Text style={styles.infoText}>
              Latest: {updateInfo.latestVersion}
            </Text>
            <Text style={styles.infoText}>
              Required: {updateInfo.isUpdateRequired ? 'Yes' : 'No'}
            </Text>
          </View>
        )}

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Test Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleForceUpdateCheck}
          >
            <Text style={styles.actionButtonText}>Force Update Check</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSimulateUpdate}
          >
            <Text style={styles.actionButtonText}>How to Simulate Update</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOpenPlayStore}
          >
            <Text style={styles.actionButtonText}>Test Play Store Open</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpText}>
            💡 This panel is only visible in development mode.
            Remove it before production deployment.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  toggleButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 999,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    gap: 16,
  },
  statusSection: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoSection: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  actionsSection: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  helpSection: {
    backgroundColor: colors.info,
    padding: 12,
    borderRadius: 8,
  },
  helpText: {
    fontSize: 11,
    color: 'white',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default UpdateTestPanel;
