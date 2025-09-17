# Onboarding Navigation Fix

## Problem
After the onboarding overlay completes, the hamburger menu (More tab) navigation gets stuck showing the Categories screen instead of the main More screen. This happens because:

1. During onboarding step 5 (categories), the app navigates to: `Home > More > Categories`
2. When onboarding completes, it only navigates back to Dashboard but doesn't reset the More tab's navigation state
3. The More tab's navigation stack remains on the Categories screen
4. When user taps the hamburger icon, it shows Categories instead of MoreMain

## Solution
The fix involves multiple targeted improvements:

### 1. Onboarding Completion Navigation
- Modified onboarding completion handlers to reset More tab navigation
- Added targeted navigation to MoreMain screen after onboarding completes
- Prevents the More tab from staying stuck on Categories screen

### 2. Tab Press Navigation Override
- Added custom tab press listener for the More tab
- Ensures the More tab always navigates to MoreMain screen when pressed
- Prevents navigation to previously visited screens within More tab

### 3. Redux State Management
- Added `forceCompleteOnboarding` action for emergency reset
- Improved state cleanup when onboarding completes
- Reset currentStep to 0 to prevent lingering state issues

### 4. Performance Optimizations
- Removed problematic useEffect that caused re-rendering
- Simplified navigation logic to be less aggressive
- Added error handling for navigation operations

## Files Modified
- `src/hooks/useOnboardingOverlay.ts` - Main fix for navigation reset
- `src/store/slices/onboardingSlice.ts` - State management improvements
- `src/navigation/MainNavigator.tsx` - Added debug logging
- `src/utils/navigationUtils.ts` - New utility functions

## Testing
To test the fix:
1. Complete the onboarding flow
2. Tap the hamburger menu (More tab)
3. Verify it shows the More screen, not Categories screen
4. Clear app from RAM and verify the issue doesn't return

## Prevention
The fix prevents the issue by:
- Resetting navigation state after onboarding completion
- Ensuring More tab always starts with MoreMain screen
- Adding safeguards for navigation state corruption