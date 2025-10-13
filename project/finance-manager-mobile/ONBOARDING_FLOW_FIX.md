# Onboarding Flow Fix - 3 Intro Screens

## Problem
The 3 intro onboarding screens are not showing because the onboarding completion status is persisted in both SecureStore and Redux persist.

## Solution Implemented

### 1. AppNavigator.tsx Changes
- Added `checkOnboardingStatus()` call on app initialization
- This reads from SecureStore to check if user has completed onboarding
- Added proper loading states for both auth and onboarding
- Navigation flow now checks onboarding FIRST, then authentication

### 2. Navigation Flow
```
App Start
  ↓
Check Onboarding Status (from SecureStore)
  ↓
├─ NOT Complete → Show 3 Onboarding Screens
│   ↓
│   User completes onboarding
│   ↓
│   Mark as complete in SecureStore
│   ↓
│   Show Register Screen
│
└─ Complete → Check Authentication
    ↓
    ├─ NOT Authenticated → Show Register/Login (AuthNavigator)
    ├─ Needs Currency → Show Currency Selection
    └─ Authenticated → Show Main App
```

### 3. How to Test / Reset Onboarding (For Development)

**Clear App Data:**

iOS Simulator:
```bash
# Delete and reinstall app
# Long press app icon → Delete App
# Then: npx expo run:ios
```

Android Emulator:
```bash
# Clear app data
adb shell pm clear com.yourcompany.financemanager
```

## Why This Happens

1. **SecureStore**: Stores `onboarding_complete = 'true'` after user completes onboarding
2. **Redux Persist**: Caches the onboarding state in AsyncStorage
3. Both need to be cleared to show onboarding again

## For New Users

New users (fresh install) will automatically see the 3 onboarding screens because:
- SecureStore has no `onboarding_complete` key
- Redux state initializes with `isOnboardingComplete: false`
- `checkOnboardingStatus()` returns `false` for new users

## Current Flow Summary

1. **First Time User**:
   - Onboarding Screens (3 screens) → Register → Currency Selection → Main App

2. **Returning User (Logged Out)**:
   - Register/Login Screens → Currency Selection (if needed) → Main App

3. **Returning User (Logged In)**:
   - Main App (directly)

## Files Modified

- `src/navigation/AppNavigator.tsx` - Added onboarding status check
- `src/navigation/OnboardingNavigator.tsx` - Simplified to only handle 3 intro screens
- `src/navigation/AuthNavigator.tsx` - Already configured with Register as initial screen

## Notes

- The onboarding completion is intentionally persisted so users don't see it every time
- For development/testing, use one of the reset methods above
- The 3 intro screens are different from the in-app onboarding overlay (which guides users through creating accounts, transactions, etc.)
