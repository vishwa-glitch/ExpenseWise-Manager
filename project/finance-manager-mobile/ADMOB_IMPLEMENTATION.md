# AdMob Implementation for Export Limits

This document describes the implementation of Google AdMob rewarded ads to manage export limits for free users in the finance manager mobile app.

## Overview

Free users have a monthly export limit of 1 export. When they reach this limit, they can watch a rewarded ad to get 1 additional export. Premium users have unlimited exports.

## Implementation Details

### 1. AdMob Service (`src/services/adMobService.ts`)

- **Purpose**: Manages rewarded ad loading, display, and event handling
- **Features**:
  - Automatic ad preloading
  - Event listeners for ad states (loaded, error, closed, reward earned)
  - Promise-based ad display
  - Automatic ad reloading after use

### 2. Export Limits Hook (`src/hooks/useExportLimits.ts`)

- **Purpose**: Manages export limits and ad interactions for free users
- **Features**:
  - Tracks monthly export usage
  - Handles monthly reset logic
  - Manages ad watched status
  - Provides limit status information
  - Integrates with AdMob service

### 3. Ad Prompt Modal (`src/components/common/AdPromptModal.tsx`)

- **Purpose**: User interface for prompting users to watch ads
- **Features**:
  - Clear explanation of the reward
  - Loading states for ad preparation
  - Error handling for ad failures
  - Upgrade option for premium

### 4. Configuration (`src/config/adMobConfig.ts`)

- **Purpose**: Centralized AdMob configuration
- **Features**:
  - Test and production ad unit IDs
  - Ad request configuration
  - Environment-based ad unit selection

## Usage Flow

1. **User attempts to export**: ExportScreen checks if user can export
2. **Limit reached**: If free user has used their monthly limit, show AdPromptModal
3. **User watches ad**: AdMob service displays rewarded ad
4. **Reward earned**: User gets 1 additional export
5. **Export proceeds**: User can now export their data

## Test Ad Unit IDs

The implementation uses Google's official test ad unit IDs:

- **Rewarded Ad Test ID**: `ca-app-pub-3940256099942544/5224354917`
- **App Test ID**: `ca-app-pub-3940256099942544~3347511713`

## Production Setup

To use real ads in production:

1. **Create AdMob Account**: Set up an AdMob account at https://admob.google.com
2. **Create App**: Add your app to AdMob
3. **Create Ad Units**: Create rewarded ad units
4. **Update Configuration**: Replace test IDs with real ad unit IDs in `src/config/adMobConfig.ts`
5. **Test**: Test with real ads before release

## Key Features

### Monthly Reset
- Export limits reset automatically on the first day of each month
- Stored locally using SecureStore for offline functionality

### Ad Preloading
- Ads are preloaded when the export screen is accessed
- Reduces waiting time when user needs to watch an ad

### Error Handling
- Graceful fallback if ads fail to load
- Clear user feedback for ad-related issues
- Option to upgrade to premium if ads are unavailable

### User Experience
- Clear messaging about limits and rewards
- Loading states for better UX
- Non-intrusive ad prompts

## Files Modified/Created

### New Files
- `src/services/adMobService.ts` - AdMob service
- `src/hooks/useExportLimits.ts` - Export limits hook
- `src/components/common/AdPromptModal.tsx` - Ad prompt modal
- `src/config/adMobConfig.ts` - AdMob configuration
- `ADMOB_IMPLEMENTATION.md` - This documentation

### Modified Files
- `App.tsx` - Added AdMob initialization
- `src/screens/export/ExportScreen.tsx` - Integrated ad functionality
- `package.json` - Added react-native-google-mobile-ads dependency

## Dependencies

- `react-native-google-mobile-ads`: Google AdMob SDK for React Native

## Testing

1. **Test with Free User**: Create a free user account and test export limits
2. **Test Ad Display**: Verify rewarded ads display correctly
3. **Test Limit Tracking**: Verify monthly limits are tracked and reset properly
4. **Test Error Scenarios**: Test behavior when ads fail to load

## Security Considerations

- Ad unit IDs are stored in configuration files
- No sensitive user data is shared with AdMob
- Ad requests use non-personalized ads for privacy compliance

## Future Enhancements

- Analytics tracking for ad performance
- A/B testing for different ad placements
- Multiple ad formats (banner, interstitial)
- Advanced targeting options
