# AdMob Banner Ads Implementation Guide

This guide explains how to implement Google AdMob banner ads using test ad units in your React Native finance app.

## 🎯 Overview

The implementation includes:
- **Fixed Size Banner Ads**: Standard 320x50 banners
- **Adaptive Banner Ads**: Responsive banners that adapt to screen width
- **Test Ad Units**: Google's official test ad unit IDs for safe development
- **Mock Service**: Fallback for Expo managed workflow
- **Real AdMob**: Full integration for development builds

## 📱 Test Ad Unit IDs

### Google's Official Test Ad Units
```typescript
// Fixed Size Banner
BANNER_AD_UNIT_ID: 'ca-app-pub-3940256099942544/6300978111'

// Adaptive Banner  
ADAPTIVE_BANNER_AD_UNIT_ID: 'ca-app-pub-3940256099942544/9214589741'

// App ID (Android)
APP_ID: 'ca-app-pub-3940256099942544~3347511713'
```

### Banner Sizes Available
- **BANNER**: 320x50 (standard mobile banner)
- **FULL_BANNER**: 468x60 (tablet banner)
- **LARGE_BANNER**: 320x100 (large mobile banner)
- **MEDIUM_RECTANGLE**: 300x250 (rectangular ad)
- **LEADERBOARD**: 728x90 (desktop banner)

## 🚀 Quick Start

### Step 1: Test in Expo Go (Immediate)
```bash
npm start
# Scan QR code with Expo Go
```

You'll see mock banner ads that simulate real AdMob behavior.

### Step 2: Test with Real AdMob (Development Build)
```bash
# Create development build
eas build --profile development --platform android

# Install the APK and test real AdMob ads
```

## 📋 Implementation Details

### 1. Configuration (`src/config/adMobConfig.ts`)
```typescript
export const ADMOB_CONFIG = {
  // Test App ID
  APP_ID: 'ca-app-pub-3940256099942544~3347511713',
  
  // Test Banner Ad Unit IDs
  BANNER_AD_UNIT_ID: 'ca-app-pub-3940256099942544/6300978111',
  ADAPTIVE_BANNER_AD_UNIT_ID: 'ca-app-pub-3940256099942544/9214589741',
  
  // Ad Request Configuration
  AD_REQUEST_CONFIG: {
    requestNonPersonalizedAdsOnly: true,
    keywords: ['finance', 'budget', 'money', 'expense', 'banking'],
    contentRating: ['G', 'PG'],
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
  },
};
```

### 2. Banner Ad Component (`src/components/common/BannerAd.tsx`)
```typescript
<BannerAd
  adType="banner"
  size="BANNER"
  onAdLoaded={() => console.log('Ad loaded')}
  onAdFailedToLoad={(error) => console.log('Ad failed:', error)}
  onAdOpened={() => console.log('Ad opened')}
  onAdClosed={() => console.log('Ad closed')}
/>
```

### 3. Adaptive Banner Component (`src/components/common/AdaptiveBannerAd.tsx`)
```typescript
<AdaptiveBannerAd
  onAdLoaded={() => console.log('Adaptive ad loaded')}
  onAdFailedToLoad={(error) => console.log('Adaptive ad failed:', error)}
  onAdOpened={() => console.log('Adaptive ad opened')}
  onAdClosed={() => console.log('Adaptive ad closed')}
/>
```

## 🎨 Usage Examples

### Basic Banner Ad
```typescript
import { BannerAd } from '../components/common';

<BannerAd
  adType="banner"
  size="BANNER"
  onAdLoaded={() => console.log('Banner loaded')}
/>
```

### Adaptive Banner Ad
```typescript
import { AdaptiveBannerAd } from '../components/common';

<AdaptiveBannerAd
  onAdLoaded={() => console.log('Adaptive banner loaded')}
/>
```

### Different Banner Sizes
```typescript
// Standard mobile banner
<BannerAd size="BANNER" />

// Large mobile banner
<BannerAd size="LARGE_BANNER" />

// Tablet banner
<BannerAd size="FULL_BANNER" />

// Rectangular ad
<BannerAd size="MEDIUM_RECTANGLE" />
```

## 🔧 Environment Detection

The components automatically detect your environment:

### Expo Managed Workflow
- Uses mock banner ads
- Shows colored placeholder banners
- Simulates ad loading and events
- Perfect for UI development

### Development Build
- Uses real Google AdMob ads
- Shows actual test ads with "Test Ad" label
- Full ad functionality and tracking

### Production Build
- Uses real Google AdMob ads
- Shows actual ads from your ad units
- Revenue generation enabled

## 📊 Ad Events

### Available Event Handlers
```typescript
onAdLoaded?: () => void;           // Ad successfully loaded
onAdFailedToLoad?: (error: any) => void;  // Ad failed to load
onAdOpened?: () => void;           // User clicked ad
onAdClosed?: () => void;           // Ad closed
```

### Event Logging
```typescript
<BannerAd
  onAdLoaded={() => {
    console.log('📱 Banner ad loaded successfully');
    // Track ad impression
  }}
  onAdFailedToLoad={(error) => {
    console.error('❌ Banner ad failed to load:', error);
    // Handle ad failure
  }}
  onAdOpened={() => {
    console.log('📱 Banner ad opened');
    // Track ad click
  }}
  onAdClosed={() => {
    console.log('📱 Banner ad closed');
    // Handle ad close
  }}
/>
```

## 🎯 Best Practices

### 1. Ad Placement
- **Top of screen**: Less intrusive, good for engagement
- **Bottom of screen**: Easy to dismiss, good for monetization
- **Between content**: Natural flow, good user experience

### 2. Ad Frequency
- Don't overwhelm users with too many ads
- Consider user experience over revenue
- Test different ad densities

### 3. Ad Sizing
- Use adaptive banners for responsive design
- Match ad size to screen width
- Consider device orientation

### 4. Error Handling
- Always handle ad loading failures gracefully
- Provide fallback content when ads fail
- Log errors for debugging

## 🧪 Testing

### Test Ad Features
- **Safe to click**: Test ads won't charge advertisers
- **Test Ad label**: Clearly marked as test content
- **Real ad behavior**: Simulates actual ad interactions
- **Event tracking**: All ad events work normally

### Testing Checklist
- [ ] Banner ads load correctly
- [ ] Adaptive banners resize properly
- [ ] Ad events fire correctly
- [ ] Error handling works
- [ ] Mock ads show in Expo Go
- [ ] Real ads show in development build

## 🚀 Production Deployment

### Step 1: Create AdMob Account
1. Go to https://admob.google.com
2. Create new app
3. Add Android/iOS platforms
4. Create banner ad units

### Step 2: Update Configuration
```typescript
// Replace test IDs with production IDs
export const ADMOB_CONFIG = {
  APP_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
  BANNER_AD_UNIT_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  ADAPTIVE_BANNER_AD_UNIT_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
};
```

### Step 3: Update app.json
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

### Step 4: Build and Deploy
```bash
# Production build
eas build --profile production --platform android

# Submit to app stores
eas submit --platform android
```

## 🔍 Troubleshooting

### Common Issues

#### "Ad not available" error
- Check internet connection
- Verify ad unit ID is correct
- Ensure AdMob account is active
- Check for policy violations

#### Ads not showing in development build
- Verify AdMob initialization
- Check ad unit status in AdMob console
- Ensure test device is configured
- Check app permissions

#### Mock ads showing instead of real ads
- Confirm you're using development build
- Check AdMob SDK installation
- Verify native module linking

### Debug Commands
```bash
# Check AdMob configuration
console.log('AdMob config:', ADMOB_CONFIG);

# Monitor ad events
adb logcat | grep -i admob

# Test ad loading
adb shell am start -n com.yourapp/.MainActivity
```

## 📈 Performance Optimization

### Ad Loading
- Preload ads when possible
- Use appropriate ad sizes
- Implement ad caching
- Monitor ad load times

### User Experience
- Don't block UI with ad loading
- Provide loading indicators
- Handle ad failures gracefully
- Consider ad frequency capping

## 🎉 Success Metrics

### Key Performance Indicators
- **Fill Rate**: Percentage of ad requests that return ads
- **Click-Through Rate (CTR)**: Percentage of ad impressions that result in clicks
- **Revenue per User (RPU)**: Average revenue generated per user
- **Ad Load Time**: Time taken to load and display ads

### Monitoring
- Use AdMob console for analytics
- Implement custom event tracking
- Monitor user feedback
- Track app performance impact

## 📚 Additional Resources

- [AdMob Documentation](https://developers.google.com/admob)
- [React Native Google Mobile Ads](https://github.com/react-native-admob/react-native-admob)
- [AdMob Policy Center](https://support.google.com/admob/answer/6129563)
- [AdMob Best Practices](https://support.google.com/admob/answer/6167117)

---

**Note**: Always test thoroughly with test ad units before deploying to production. Test ads are safe to click and won't affect your AdMob account.
