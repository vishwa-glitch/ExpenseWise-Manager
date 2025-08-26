# AdMob Setup Guide

This guide explains how to set up Google AdMob for the export limits feature in your React Native finance app.

## Current Status

The app now includes a **hybrid approach** that works in both Expo managed workflow and development builds:

- **Expo Managed Workflow**: Uses a mock ad service for development
- **Development Builds**: Uses real Google AdMob ads

## Option 1: Quick Development (Recommended for now)

The app is already configured to work with a **mock ad service** in Expo managed workflow. This allows you to:

✅ **Test the export limits functionality immediately**
✅ **Develop and test the UI without native dependencies**
✅ **Use Expo Go app for development**

### How it works:
- When you reach the export limit, a mock ad dialog appears
- Clicking "Watch Ad" simulates watching an ad and grants 1 additional export
- The export limits are tracked locally and reset monthly

### To test:
1. Run `npm start` or `expo start`
2. Use Expo Go app to scan the QR code
3. Navigate to Export screen
4. Try exporting multiple times to trigger the ad prompt

## Option 2: Real AdMob with Development Build

To use real Google AdMob ads, you need to create a development build:

### Prerequisites:
1. **Expo Account**: Sign up at https://expo.dev
2. **EAS CLI**: Already installed globally
3. **AdMob Account**: Create at https://admob.google.com

### Steps:

#### 1. Login to Expo
```bash
eas login
```

#### 2. Configure your project
```bash
eas build:configure
```

#### 3. Create a development build for Android
```bash
eas build --profile development --platform android
```

#### 4. Install the development build
- Download the APK from the build link
- Install it on your device
- Use this build instead of Expo Go

#### 5. Update AdMob configuration
Replace the test ad unit IDs in `src/config/adMobConfig.ts` with your real ones:

```typescript
export const ADMOB_CONFIG = {
  // Replace with your real app ID
  APP_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
  
  // Replace with your real ad unit ID
  REWARDED_AD_UNIT_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  
  // ... rest of config
};
```

#### 6. Update app.json
Replace the test app IDs with your real ones:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
        }
      ]
    ]
  }
}
```

## Option 3: Production Build

For production releases:

### 1. Create production build
```bash
eas build --profile production --platform android
```

### 2. Submit to app stores
```bash
eas submit --platform android
```

## File Structure

```
src/
├── services/
│   ├── adMobService.ts      # Real AdMob service (development builds)
│   └── mockAdService.ts     # Mock service (Expo managed workflow)
├── hooks/
│   └── useExportLimits.ts   # Export limits management
├── components/
│   └── common/
│       └── AdPromptModal.tsx # Ad prompt UI
└── config/
    └── adMobConfig.ts       # AdMob configuration
```

## Testing

### Mock Service Testing:
- Works immediately in Expo Go
- Shows alert dialogs instead of real ads
- Perfect for UI/UX development

### Real AdMob Testing:
- Requires development build
- Shows actual Google AdMob ads
- Use test ad unit IDs during development

## Troubleshooting

### "RNGoogleMobileAdsModule could not be found"
- **Solution**: Use the mock service (already implemented)
- **Alternative**: Create a development build

### Ads not showing in development build
- Check AdMob account setup
- Verify ad unit IDs are correct
- Ensure internet connection
- Check AdMob console for any policy violations

### Export limits not working
- Check SecureStore permissions
- Verify the useExportLimits hook is properly integrated
- Check console logs for errors

## Next Steps

1. **For immediate development**: Use the mock service (already working)
2. **For real ads**: Create a development build following Option 2
3. **For production**: Follow Option 3

The mock service provides a complete development experience while you set up the real AdMob integration.
