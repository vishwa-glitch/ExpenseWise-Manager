import { ENV } from './environment';

/**
 * Determine force update settings based on environment
 * - Development: Force updates enabled for testing
 * - Staging: Force updates enabled for testing
 * - Production: Force updates controlled by backend (dynamic)
 */
function getForceUpdateSetting(): boolean {
  switch (ENV.ENVIRONMENT) {
    case 'development':
      return true; // Enable force updates in development for testing
    case 'staging':
      return true; // Enable force updates in staging for testing
    case 'production':
      return true; // Enable force updates in production - controlled by backend
    default:
      return true; // Default to enabled - backend will control the behavior
  }
}

export const appUpdateConfig = {
  // App bundle ID - Replace with your actual bundle ID from Play Store
  APP_BUNDLE_ID: 'com.vishwa567.fintech', // Updated to match your actual bundle ID
  
  // Play Store URL template
  PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=',
  
  // Update check intervals (in milliseconds)
  UPDATE_CHECK_INTERVAL: 6 * 60 * 60 * 1000, // 6 hours
  
  // Force update settings - Environment-based configuration
  FORCE_UPDATE_ENABLED: getForceUpdateSetting(),
  
  // Update check settings - Temporarily disabled to prevent crashes
  CHECK_ON_APP_START: true,
  CHECK_ON_APP_FOREGROUND: true,
  
  // Backend API configuration
  BACKEND_API: {
    VERSION_CHECK_ENDPOINT: `${ENV.API_BASE_URL}${ENV.API_PREFIX}/app/version/check`, // Environment-based backend URL
    TIMEOUT: 10000, // 10 seconds
  },
  
  // UI Settings
  UI: {
    SHOW_RELEASE_NOTES: true,
    SHOW_VERSION_INFO: true,
    SHOW_REMIND_LATER_BUTTON: true, // Show "Remind Later" button for optional updates
  },
  
  // Testing settings (set to false in production)
  TESTING: {
    ENABLED: false, // Disabled to use backend API
    MOCK_LATEST_VERSION: '2.0.1', // Not used when testing is disabled
    MOCK_UPDATE_REQUIRED: false, // Not used when testing is disabled
  },
};
