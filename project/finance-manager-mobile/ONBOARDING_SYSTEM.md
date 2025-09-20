# Onboarding System

This document describes the onboarding system implemented for new users in the Finance Manager mobile app.

## Overview

The onboarding system provides a comprehensive guided experience for new users through all major app features. It includes both initial welcome screens with Lottie animations and an interactive overlay system that guides users through the main app functionality.

## Features

### Phase 1: Initial Welcome Screens (with Lottie Animations)
1. **Welcome Screen** - Bank animation, introduces financial growth concept
2. **Organization Screen** - Coins animation, explains transaction categorization
3. **Data Control Screen** - People animation, highlights export capabilities

### Phase 2: Interactive Guided Tour (Overlay System)
1. **Dashboard Welcome** - Guides to "Add Account" button
2. **Account Creation** - Walks through account setup process
3. **Transaction Tracking** - Shows how to add transactions
4. **Calendar View** - Demonstrates transaction calendar navigation
5. **Budget Management** - Guides through budget creation
6. **Custom Categories** - Shows category customization features
7. **Financial Goals** - Introduces savings goal tracking
8. **Completion** - Final congratulations and app readiness confirmation

## Technical Implementation

### State Management
- **Redux Slice**: `onboardingSlice.ts`
- **State Properties**:
  - `isOnboardingComplete`: Whether onboarding is finished
  - `currentStep`: Current step in the overlay flow (0-7)
  - `totalSteps`: Total number of overlay steps (8)
  - `isOverlayVisible`: Whether the guided overlay is shown
  - `hasCreatedAccount`: Whether user created an account
  - `hasCreatedTransaction`: Whether user created a transaction
  - `hasCreatedBudget`: Whether user created a budget

### Navigation
- **Initial Screens**: `OnboardingNavigator.tsx` with Lottie animations
- **Overlay System**: `OnboardingOverlay.tsx` component used across screens
- **Hook**: `useOnboardingOverlay.ts` manages overlay state and navigation

### Integration
- Integrated into `AppNavigator.tsx`
- Shows after currency selection for new users
- Automatically resets when new user registers
- Persists completion status in SecureStore

## User Flow

1. **App Launch (Unauthenticated)** → Lottie Onboarding Screens → Login/Register
2. **New User Registration** → Currency Selection → Main App with Overlay Tour
3. **Existing User Login** → Main App (no onboarding)
4. **Complete Onboarding Flow**:
   - **Phase 1**: Welcome (Bank) → Organization (Coins) → Data Control (People) → Login/Register
   - **Phase 2**: Dashboard → Accounts → Transactions → Calendar → Budgets → Categories → Goals → Complete

## Persistence

The system uses SecureStore to persist:
- `onboarding_complete`: Whether onboarding is finished
- `onboarding_account_created`: Whether account was created
- `onboarding_transaction_created`: Whether transaction was created
- `onboarding_budget_created`: Whether budget was created

## Customization

### Adding New Steps
1. Create new screen in `src/screens/onboarding/`
2. Add to `OnboardingNavigator.tsx`
3. Update `totalSteps` in `onboardingSlice.ts`
4. Add corresponding state properties if needed

### Modifying Steps
- Each screen is self-contained and can be modified independently
- Progress indicators automatically update based on `currentStep`
- Skip functionality is consistent across all screens

## Best Practices

1. **User Choice**: Always provide skip options with clear explanations
2. **Progress Feedback**: Show current step and total progress
3. **Validation**: Validate user input before proceeding
4. **Persistence**: Save user progress to prevent data loss
5. **Accessibility**: Ensure all screens are accessible
6. **Performance**: Keep screens lightweight and responsive

## Testing

To test the onboarding system:
1. Register a new user account
2. Complete currency selection
3. Navigate through onboarding steps
4. Test skip functionality at each step
5. Verify completion and transition to main app
6. Test with existing users (should skip onboarding)

## Future Enhancements

Potential improvements:
- Add animations between steps
- Include video tutorials
- Add more account types and categories
- Implement guided tours for main app features
- Add onboarding analytics
- Support for different user personas
