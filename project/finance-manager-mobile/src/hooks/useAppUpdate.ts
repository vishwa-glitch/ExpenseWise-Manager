import { useEffect, useState } from 'react';
import { useTypedSelector } from './useTypedSelector';
import { appUpdateService } from '../services/appUpdateService';
import { appUpdateConfig } from '../config/appUpdateConfig';
import { AppState, AppStateStatus } from 'react-native';

export const useAppUpdate = () => {
  const { isUpdateRequired, updateInfo, isLoading } = useTypedSelector(
    (state) => state.appUpdate
  );
  const [isChecking, setIsChecking] = useState(false);
  const [hasCheckedOnStart, setHasCheckedOnStart] = useState(false);

  useEffect(() => {
    // Only check for updates once on app start if enabled in config
    if (appUpdateConfig.CHECK_ON_APP_START && !hasCheckedOnStart) {
      setHasCheckedOnStart(true);
      checkForUpdates();
    }

    // Set up app state change listener to check for updates when app comes to foreground
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [hasCheckedOnStart]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && appUpdateConfig.CHECK_ON_APP_FOREGROUND) {
      // App has come to foreground, check for updates
      checkForUpdates();
    }
  };

  const checkForUpdates = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      await appUpdateService.checkForUpdates();
    } catch (error) {
      console.warn('⚠️ Error checking for updates (non-critical):', error);
      // Don't crash the app - this is a non-critical service
    } finally {
      setIsChecking(false);
    }
  };

  const forceCheckForUpdates = async () => {
    setIsChecking(true);
    try {
      await appUpdateService.forceCheckForUpdates();
    } catch (error) {
      console.error('Error forcing update check:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isUpdateRequired,
    updateInfo,
    isLoading: isLoading || isChecking,
    checkForUpdates,
    forceCheckForUpdates,
  };
};
