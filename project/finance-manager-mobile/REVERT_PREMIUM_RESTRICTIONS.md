# Reverting Premium Restrictions

This document outlines the changes made to temporarily remove premium restrictions for the app launch and how to revert them when needed.

## Changes Made

### 1. Subscription Utilities (`src/utils/subscriptionUtils.ts`)
- All limit checks now return `false` (no limits)
- All premium feature checks now return `true` (all features available)
- All users show as premium members

### 2. Subscription Tier Configuration (`src/config/api.ts`)
- FREE tier now has unlimited limits (`-1` for all limits)
- FREE tier includes all premium features

### 3. Profile Screens
- **ProfileScreen.tsx**: Shows premium badge (⭐) and "Premium Member" for all users
- **MoreScreen.tsx**: Shows premium badge and status for all users
- **EditProfileScreen.tsx**: Shows premium status for all users

### 4. Export Functionality
- **ExportSection.tsx**: Shows "Unlimited exports" for all users

### 5. Premium Guards
- **PremiumScreenGuard.tsx**: Allows all users access to premium features

### 6. Other Components
- **TierComparisonCard.tsx**: Shows all users as premium
- **PremiumUpgradeScreen.tsx**: Shows all users as already premium
- **BudgetsListScreen.tsx**: No budget creation limits
- **StatementImportScreen.tsx**: No export restrictions

## How to Revert

### 1. Restore Subscription Utilities
In `src/utils/subscriptionUtils.ts`:
- Restore original `FREE_TIER_LIMITS` values
- Restore original `canAccessPremiumFeature` logic
- Restore original limit checking functions
- Remove temporary comments

### 2. Restore Subscription Tier Configuration
In `src/config/api.ts`:
- Restore original FREE tier limits
- Remove premium features from FREE tier

### 3. Restore Profile Screens
- Restore conditional premium badge display based on `profile?.subscription_tier === 'premium'`
- Remove "TEMPORARY" comments

### 4. Restore Export Functionality
- Restore original export limit logic
- Restore premium checks in export components

### 5. Restore Premium Guards
- Restore original premium feature access checks

### 6. Restore Other Components
- Restore original premium checks in all components
- Remove temporary unlimited access

## Search for "TEMPORARY" Comments

Use this search to find all temporary changes:
```bash
grep -r "TEMPORARY" src/
```

## Important Notes

- All changes are marked with "TEMPORARY" comments for easy identification
- The backend may still enforce some restrictions
- Consider updating backend API endpoints to also remove restrictions if needed
- Test thoroughly after reverting to ensure premium restrictions work correctly

## Backend Considerations

If you also want to remove backend restrictions, you may need to:
1. Update user creation to set all users as premium
2. Remove limit checks in API endpoints
3. Update subscription status endpoints to return premium for all users
4. Remove export limit enforcement
5. Remove upload limit enforcement

## Testing After Revert

After reverting, test:
1. Free user limitations work correctly
2. Premium upgrade flow works
3. Export limits are enforced
4. Upload limits are enforced
5. Premium feature access is restricted for free users
6. Premium badges only show for actual premium users
