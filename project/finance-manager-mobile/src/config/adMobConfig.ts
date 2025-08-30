// AdMob Configuration
export const ADMOB_CONFIG = {
  // Test App ID - Replace with your actual app ID in production
  APP_ID: 'ca-app-pub-3940256099942544~3347511713', // Android test app ID
  
  // Test Ad Unit IDs - Replace with your actual ad unit IDs in production
  REWARDED_AD_UNIT_ID: 'ca-app-pub-3940256099942544/5224354917', // Test rewarded ad ID
  
  // Banner Ad Unit IDs
  BANNER_AD_UNIT_ID: 'ca-app-pub-3940256099942544/6300978111', // Test fixed size banner
  ADAPTIVE_BANNER_AD_UNIT_ID: 'ca-app-pub-3940256099942544/9214589741', // Test adaptive banner
  
  // Production Ad Unit IDs (uncomment and use these in production)
  // REWARDED_AD_UNIT_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  // BANNER_AD_UNIT_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  // ADAPTIVE_BANNER_AD_UNIT_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  
  // Ad Request Configuration
  AD_REQUEST_CONFIG: {
    requestNonPersonalizedAdsOnly: true,
    keywords: ['finance', 'budget', 'money', 'expense', 'banking'],
    contentRating: ['G', 'PG'],
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
  },
  
  // Ad Loading Configuration
  AD_LOADING_CONFIG: {
    timeoutMillis: 10000, // 10 seconds timeout
    maxRetries: 3,
  },
};

// Helper function to get the appropriate ad unit ID based on environment
export const getAdUnitId = (adType: 'rewarded' | 'banner' | 'adaptive_banner'): string => {
  // In production, you might want to use different ad unit IDs based on environment
  const isProduction = __DEV__ ? false : true;
  
  if (isProduction) {
    // Return production ad unit IDs
    switch (adType) {
      case 'rewarded':
        return ADMOB_CONFIG.REWARDED_AD_UNIT_ID;
      case 'banner':
        return ADMOB_CONFIG.BANNER_AD_UNIT_ID;
      case 'adaptive_banner':
        return ADMOB_CONFIG.ADAPTIVE_BANNER_AD_UNIT_ID;
      default:
        return ADMOB_CONFIG.BANNER_AD_UNIT_ID;
    }
  } else {
    // Return test ad unit IDs for development
    switch (adType) {
      case 'rewarded':
        return ADMOB_CONFIG.REWARDED_AD_UNIT_ID;
      case 'banner':
        return ADMOB_CONFIG.BANNER_AD_UNIT_ID;
      case 'adaptive_banner':
        return ADMOB_CONFIG.ADAPTIVE_BANNER_AD_UNIT_ID;
      default:
        return ADMOB_CONFIG.BANNER_AD_UNIT_ID;
    }
  }
};
