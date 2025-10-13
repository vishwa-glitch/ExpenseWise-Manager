# Authentication Flow Update

## Changes Made

Updated the app's authentication flow to follow the standard pattern where users see the Register screen first after onboarding.

### Flow Structure

1. **Onboarding Screens** (3 swipeable screens)
   - Introduction to app features
   - User swipes through or clicks "Next"
   - Final screen has "Get Started" button

2. **Register Screen** (First auth screen)
   - Primary screen after onboarding
   - Form fields: First Name, Last Name, Email, Password, Confirm Password
   - "Create Account" button
   - Bottom section: "Already have an account? **Sign In**" button

3. **Login Screen** (Accessible from Register)
   - Form fields: Email, Password
   - "Sign In" button
   - Bottom section: "Don't have an account? **Create Account**" button

### Technical Changes

#### AppNavigator.tsx
- Added `isOnboardingComplete` state check from Redux
- Updated navigation logic to show:
  1. Onboarding screens if not completed
  2. Auth screens (Register/Login) if onboarding complete but not authenticated
  3. Currency selection if authenticated but needs currency
  4. Main app if fully authenticated

#### OnboardingNavigator.tsx
- Simplified to only handle the 3 onboarding screens
- Removed Login and Register screens (moved to AuthNavigator)
- `handleGetStarted` now dispatches `completeOnboarding()` action
- This marks onboarding as complete and triggers navigation to AuthNavigator

#### AuthNavigator.tsx
- Already configured with `initialRouteName="Register"`
- Contains Register, Login, and CurrencySelection screens
- Register screen is shown first after onboarding

### User Experience

**New User Journey:**
1. Opens app → Sees onboarding screens
2. Completes onboarding → Sees Register screen
3. Can click "Already have an account? Sign In" to go to Login
4. After registration → Currency selection → Main app

**Returning User Journey:**
1. Opens app → Directly to Main app (onboarding already complete)

**Existing User Without Account:**
1. Opens app → Sees Register screen (onboarding already complete)
2. Can switch to Login if they already have an account

This matches the standard flow used by most modern apps where registration is the primary action, with login as a secondary option.
