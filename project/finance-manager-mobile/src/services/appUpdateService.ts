import { Platform, Linking, Alert } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { setUpdateRequired, setUpdateInfo } from '../store/slices/appUpdateSlice';
import { appUpdateConfig } from '../config/appUpdateConfig';

// Helper function for timeout in React Native
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });

  const fetchPromise = fetch(url, options);
  return Promise.race([fetchPromise, timeoutPromise]);
};

export interface AppUpdateInfo {
  currentVersion: string;
  latestVersion: string;
  isUpdateRequired: boolean;
  forceUpdate: boolean;
  updateUrl: string;
  releaseNotes?: string;
}

class AppUpdateService {
  private static instance: AppUpdateService;
  private updateCheckInterval: NodeJS.Timeout | null = null;
  private readonly PLAY_STORE_URL = appUpdateConfig.PLAY_STORE_URL;
  private readonly APP_BUNDLE_ID = appUpdateConfig.APP_BUNDLE_ID;
  private readonly REMIND_LATER_STORAGE_KEY = 'app_update_remind_later_timestamp';
  private readonly REMIND_LATER_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private constructor() {
    this.initialize();
  }

  public static getInstance(): AppUpdateService {
    if (!AppUpdateService.instance) {
      AppUpdateService.instance = new AppUpdateService();
    }
    return AppUpdateService.instance;
  }

  private async initialize() {
    // Check for updates on app start
    await this.checkForUpdates();
    
    // Set up periodic update checks based on configuration
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, appUpdateConfig.UPDATE_CHECK_INTERVAL);
  }

  /**
   * Check for app updates by comparing current version with latest available version
   */
  public async checkForUpdates(ignoreCooldown: boolean = false): Promise<AppUpdateInfo | null> {
    try {
      if (Platform.OS !== 'android') {
        console.log('📱 App update check only supported on Android');
        return null;
      }

      // Check if user recently dismissed an update (within 24 hours)
      // Skip cooldown check if ignoreCooldown is true
      if (!ignoreCooldown) {
        const shouldSkipCheck = await this.shouldSkipUpdateCheck();
        if (shouldSkipCheck) {
          console.log('📱 Skipping update check - user recently dismissed update');
          return null;
        }
      }

      const currentVersion = Constants.expoConfig?.version || '1.0.0';
      console.log('📱 Current app version:', currentVersion);

      // Get version information from backend API with error handling
      let versionData;
      try {
        versionData = await this.getVersionDataFromBackend();
      } catch (apiError) {
        console.warn('⚠️ Backend API unavailable, skipping update check:', apiError.message);
        // Don't crash the app - just skip the update check
        return null;
      }
      
      if (!versionData) {
        console.log('📱 Could not fetch version data from backend');
        return null;
      }

      const { latestVersion, forceUpdate, releaseNotes, updateUrl, updateAvailable } = versionData;
      
      // Use backend's updateAvailable flag instead of local version comparison
      const isUpdateRequired = updateAvailable || false;
      
      const updateInfo: AppUpdateInfo = {
        currentVersion,
        latestVersion,
        isUpdateRequired: isUpdateRequired,
        forceUpdate: forceUpdate,
        updateUrl: updateUrl || (this.PLAY_STORE_URL + this.APP_BUNDLE_ID),
        releaseNotes: releaseNotes || 'Bug fixes and performance improvements'
      };

      console.log('📱 Update check result:', updateInfo);

      // If this is a force update, clear any existing remind later cooldown
      if (forceUpdate && isUpdateRequired) {
        console.log('📱 Force update detected - clearing remind later cooldown');
        await AsyncStorage.removeItem(this.REMIND_LATER_STORAGE_KEY);
      }

      // Update the store safely
      try {
        store.dispatch(setUpdateInfo(updateInfo));
        store.dispatch(setUpdateRequired(isUpdateRequired));
      } catch (storeError) {
        console.warn('⚠️ Error updating store:', storeError.message);
        // Don't crash - just log the error
      }

      return updateInfo;
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
      // Ensure we don't crash the app - return null and continue
      return null;
    }
  }

  /**
   * Get version data from backend API
   */
  private async getVersionDataFromBackend(): Promise<any | null> {
    try {
      if (appUpdateConfig.TESTING.ENABLED) {
        // Return mock data for testing
        return {
          latestVersion: appUpdateConfig.TESTING.MOCK_LATEST_VERSION,
          forceUpdate: appUpdateConfig.TESTING.MOCK_UPDATE_REQUIRED,
          releaseNotes: 'Test update - Bug fixes and performance improvements',
          updateUrl: this.PLAY_STORE_URL + this.APP_BUNDLE_ID
        };
      }

      // Call the backend API to get version data
      const currentVersion = Constants.expoConfig?.version || '1.0.0';
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      
      const url = `${appUpdateConfig.BACKEND_API.VERSION_CHECK_ENDPOINT}?platform=${platform}&current_version=${currentVersion}`;
      
      console.log('📱 Checking for updates at:', url);
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, appUpdateConfig.BACKEND_API.TIMEOUT);
      
      if (!response.ok) {
        console.warn('⚠️ Backend API error:', response.status, response.statusText);
        // Don't throw error - just return null to skip update check
        return null;
      }
      
      const data = await response.json();
      console.log('📱 Backend API response:', data);
      
      if (data.success && data.data) {
        return {
          latestVersion: data.data.latestVersion,
          forceUpdate: data.data.forceUpdateRequired || false,
          updateAvailable: data.data.updateAvailable || false,
          releaseNotes: data.data.releaseNotes,
          updateUrl: data.data.updateUrl?.[platform] || data.data.updateUrl?.android
        };
      }
      
      return null;
    } catch (error) {
      console.warn('⚠️ Error fetching version data from backend:', error);
      if (error instanceof Error && error.message === 'Request timeout') {
        console.log('⏰ Request timed out after', appUpdateConfig.BACKEND_API.TIMEOUT, 'ms');
      }
      // Don't throw error - just return null to skip update check gracefully
      return null;
    }
  }

  /**
   * Get the latest version from your backend API (legacy method)
   * @deprecated Use getVersionDataFromBackend instead
   */
  private async getLatestVersionFromBackend(): Promise<string | null> {
    try {
      if (appUpdateConfig.TESTING.ENABLED) {
        // Return mock version for testing
        return appUpdateConfig.TESTING.MOCK_LATEST_VERSION;
      }

      // Call the backend API to get latest version
      const currentVersion = Constants.expoConfig?.version || '1.0.0';
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      
      const url = `${appUpdateConfig.BACKEND_API.VERSION_CHECK_ENDPOINT}?platform=${platform}&current_version=${currentVersion}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, appUpdateConfig.BACKEND_API.TIMEOUT);
      
      if (!response.ok) {
        console.error('❌ Backend API error:', response.status, response.statusText);
        return null;
      }
      
      const data = await response.json();
      console.log('📱 Backend API response:', data);
      
      if (data.success && data.data && data.data.latestVersion) {
        return data.data.latestVersion;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching latest version from backend:', error);
      return null;
    }
  }

  /**
   * Compare two version strings
   * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    const maxLength = Math.max(parts1.length, parts2.length);
    
    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 0;
    }
    
    return 0;
  }

  /**
   * Open the app in Play Store for update
   */
  public async openPlayStoreForUpdate(): Promise<void> {
    try {
      const url = this.PLAY_STORE_URL + this.APP_BUNDLE_ID;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to general Play Store
        await Linking.openURL('https://play.google.com/store');
      }
    } catch (error) {
      console.error('❌ Error opening Play Store:', error);
      Alert.alert(
        'Update Required',
        'Please manually open the Play Store and search for "Finance Manager" to update the app.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Force check for updates (can be called manually)
   */
  public async forceCheckForUpdates(): Promise<void> {
    await this.checkForUpdates();
  }

  /**
   * Force check for updates (bypasses remind later cooldown)
   */
  public async forceCheckForUpdatesIgnoreCooldown(): Promise<void> {
    try {
      if (Platform.OS !== 'android') {
        console.log('📱 App update check only supported on Android');
        return;
      }

      const currentVersion = Constants.expoConfig?.version || '1.0.0';
      console.log('📱 Force checking for updates (ignoring cooldown)...');

      // Get version information from backend API
      const versionData = await this.getVersionDataFromBackend();
      
      if (!versionData) {
        console.log('📱 Could not fetch version data from backend');
        return;
      }

      const { latestVersion, forceUpdate, releaseNotes, updateUrl, updateAvailable } = versionData;
      
      // Use backend's updateAvailable flag instead of local version comparison
      const isUpdateRequired = updateAvailable || false;
      
      const updateInfo: AppUpdateInfo = {
        currentVersion,
        latestVersion,
        isUpdateRequired: isUpdateRequired,
        forceUpdate: forceUpdate,
        updateUrl: updateUrl || (this.PLAY_STORE_URL + this.APP_BUNDLE_ID),
        releaseNotes: releaseNotes || 'Bug fixes and performance improvements'
      };

      console.log('📱 Force update check result:', updateInfo);

      // Update the store
      store.dispatch(setUpdateInfo(updateInfo));
      store.dispatch(setUpdateRequired(isUpdateRequired));

    } catch (error) {
      console.error('❌ Error force checking for updates:', error);
    }
  }

  /**
   * Check if we should skip update check due to recent "remind later" action
   */
  private async shouldSkipUpdateCheck(): Promise<boolean> {
    try {
      const remindLaterTimestamp = await AsyncStorage.getItem(this.REMIND_LATER_STORAGE_KEY);
      
      if (!remindLaterTimestamp) {
        return false; // No previous dismiss, allow check
      }
      
      const lastDismissTime = parseInt(remindLaterTimestamp, 10);
      const currentTime = Date.now();
      const timeSinceDismiss = currentTime - lastDismissTime;
      
      // If less than 24 hours have passed, skip the check
      if (timeSinceDismiss < this.REMIND_LATER_COOLDOWN) {
        const remainingHours = Math.ceil((this.REMIND_LATER_COOLDOWN - timeSinceDismiss) / (60 * 60 * 1000));
        console.log(`📱 Update check skipped - ${remainingHours} hours remaining in cooldown`);
        return true;
      }
      
      // 24 hours have passed, clear the timestamp and allow check
      await AsyncStorage.removeItem(this.REMIND_LATER_STORAGE_KEY);
      console.log('📱 Remind later cooldown expired - allowing update check');
      return false;
      
    } catch (error) {
      console.error('❌ Error checking remind later status:', error);
      return false; // On error, allow the check
    }
  }

  /**
   * Dismiss update notification (remind later)
   */
  public async dismissUpdate(): Promise<void> {
    try {
      console.log('📱 Update notification dismissed - will remind later');
      
      // Store the current timestamp to prevent showing updates for 24 hours
      const currentTime = Date.now().toString();
      await AsyncStorage.setItem(this.REMIND_LATER_STORAGE_KEY, currentTime);
      
      // Clear the update state
      store.dispatch(setUpdateRequired(false));
      store.dispatch(setUpdateInfo(null as any));
      
      console.log('📱 Remind later timestamp saved - will not show updates for 24 hours');
      
    } catch (error) {
      console.error('❌ Error dismissing update:', error);
      // Still clear the state even if storage fails
      store.dispatch(setUpdateRequired(false));
      store.dispatch(setUpdateInfo(null as any));
    }
  }

  /**
   * Force update (user must update to continue)
   */
  public forceUpdate(): void {
    console.log('📱 Force update required - user must update');
    // Keep the update overlay visible until user updates
    store.dispatch(setUpdateRequired(true));
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }
}

export const appUpdateService = AppUpdateService.getInstance();
