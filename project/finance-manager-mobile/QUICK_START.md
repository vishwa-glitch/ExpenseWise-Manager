# Quick Start Guide - AdMob Export Limits

## ✅ **Fixed Issues**

1. **Syntax Error**: Fixed conditional export issue in `adMobService.ts`
2. **Native Module Error**: Implemented hybrid approach with mock service
3. **Expo Compatibility**: Works in both Expo managed workflow and development builds

## 🚀 **How to Test Right Now**

### Step 1: Start the App
```bash
npm start
```

### Step 2: Use Expo Go
1. Install Expo Go app on your phone
2. Scan the QR code from the terminal
3. The app will load with mock ad service

### Step 3: Test Export Limits
1. Navigate to **Export screen**
2. Try to export transactions multiple times
3. After the first export, you'll see the ad prompt
4. Click "Watch Ad" to get 1 additional export

## 🎯 **What You'll See**

### Mock Ad Dialog
```
🎬 Mock Rewarded Ad
This is a mock ad for development. In production, this would show a real Google AdMob rewarded ad.

Watch the ad to earn 1 additional export?

[Skip Ad] [Watch Ad]
```

### Export Limit Info
- **Free users**: "1 monthly export remaining"
- **After using limit**: "Monthly limit reached - watch an ad for 1 more export"
- **After watching ad**: "1 additional export available (ad watched)"

## 🔧 **How It Works**

### Export Limits
- **Free users**: 1 monthly export + 1 via ad
- **Premium users**: Unlimited exports
- **Monthly reset**: Automatically resets on 1st of each month
- **Local storage**: Uses SecureStore for offline functionality

### Mock Ad Service
- **Simulates real ads** for development
- **2-second loading time** to mimic real ad loading
- **Alert dialogs** instead of native ad components
- **Automatic reloading** after use

## 📱 **Environment Detection**

The app automatically detects your environment:

- **Expo Go/Managed**: Uses mock service
- **Development Build**: Uses real AdMob (when configured)
- **Production Build**: Uses real AdMob

## 🎉 **Success Indicators**

✅ **No more bundling errors**  
✅ **App starts successfully**  
✅ **Export screen loads**  
✅ **Ad prompts appear**  
✅ **Export limits work**  
✅ **Monthly reset functions**  

## 🔄 **Next Steps**

1. **Test the functionality** with the mock service
2. **Create development build** for real AdMob testing
3. **Update ad unit IDs** for production

The mock service provides a complete development experience while you set up real AdMob integration!
