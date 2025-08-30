# Banner Ads Troubleshooting Guide

## 🚨 Current Issue: "Ad is not showing"

### What's Happening
The error message you're seeing is **expected behavior** in Expo Go:
```
ERROR Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'RNGoogleMobileAdsModule' could not be found
LOG 📱 AdMob not available, using mock adaptive banner
```

This means:
1. ✅ **AdMob module is not available** in Expo Go (this is normal)
2. ✅ **Mock banner is being used** (this is working correctly)
3. ❌ **Mock banner is too small** (this is the actual issue)

## 🔧 What I Fixed

### 1. Improved Mock Banner Visibility
- **Increased height** from 50px to 60-80px
- **Added shadows and borders** for better visibility
- **Made text larger and more prominent**
- **Added interactive touch functionality**

### 2. Enhanced Mock Banner Content
- **Clear "TEST BANNER AD" text**
- **Shows banner type and size**
- **Interactive tap functionality**
- **Alert dialog on tap**

### 3. Better Styling
- **Rounded corners** (12px border radius)
- **Shadow effects** for depth
- **Better color contrast**
- **Proper spacing and padding**

## 📱 What You Should See Now

### In Expo Go (Current Setup)
You should now see a **prominent, colorful banner** in the middle of your dashboard that looks like:

```
┌─────────────────────────────────────┐
│  📱 ADAPTIVE BANNER AD              │
│  Test Ad - Size: BANNER | Width: 360px │
│  Tap to simulate ad interaction     │
└─────────────────────────────────────┘
```

### Features of the New Mock Banner
- **Height**: 80px (much more visible)
- **Color**: Your app's secondary color
- **Interactive**: Tap to see an alert
- **Informative**: Shows banner type and screen width
- **Professional**: Rounded corners and shadows

## 🧪 How to Test

### Step 1: Check the Dashboard
1. Open your app in Expo Go
2. Navigate to the Dashboard screen
3. Scroll down to see the banner ad section
4. You should see a **prominent colored banner**

### Step 2: Test Interaction
1. **Tap the banner** - you should see an alert dialog
2. **Check console logs** - you should see ad events
3. **Verify positioning** - banner should be between content and bottom

### Step 3: Test Different Sizes
If you want to test different banner sizes, you can modify the dashboard:

```typescript
// In DashboardScreen.tsx, change the banner type:
<BannerAd
  adType="banner"
  size="LARGE_BANNER"  // Try different sizes
  onAdLoaded={() => console.log('Banner loaded')}
/>
```

## 🎯 Expected Results

### ✅ Success Indicators
- **Visible banner** in the middle of the dashboard
- **Colored background** (not just a small icon)
- **Clear text** saying "ADAPTIVE BANNER AD"
- **Interactive tap** shows alert dialog
- **Console logs** show ad events

### ❌ If Still Not Visible
1. **Check if banner section exists** in DashboardScreen
2. **Verify imports** are correct
3. **Check for styling conflicts**
4. **Ensure no other components are hiding it**

## 🔍 Debug Steps

### 1. Check Console Logs
Look for these messages:
```
LOG 📱 AdMob not available, using mock adaptive banner
LOG 📱 Dashboard banner ad loaded
```

### 2. Check Component Rendering
Add a debug log in DashboardScreen:
```typescript
console.log('🎯 Banner section should be visible');
```

### 3. Check Styling
Make sure the banner section has proper styling:
```typescript
bannerAdSection: {
  marginHorizontal: spacing.md,
  marginBottom: spacing.md,
},
```

## 🚀 Next Steps

### For Development (Expo Go)
- ✅ **Mock banners work perfectly** for UI development
- ✅ **Test all banner sizes** and placements
- ✅ **Verify user interactions** and events

### For Production (Real Ads)
1. **Create development build**:
   ```bash
   eas build --profile development --platform android
   ```

2. **Install the APK** on your device

3. **Test real AdMob ads** with test ad units

4. **Replace test IDs** with production IDs when ready

## 📋 Quick Checklist

- [ ] **Banner is visible** in dashboard
- [ ] **Banner has color** (not just small icon)
- [ ] **Banner is interactive** (tap shows alert)
- [ ] **Console shows** "using mock adaptive banner"
- [ ] **No errors** in console (except the expected AdMob module error)

## 🆘 Still Having Issues?

If the banner is still not visible after these changes:

1. **Restart the development server**:
   ```bash
   npm start --clear
   ```

2. **Check the dashboard screen** for the banner section

3. **Verify the component imports** are correct

4. **Check if there are any styling conflicts**

The mock banner should now be **much more visible and prominent** than before!
