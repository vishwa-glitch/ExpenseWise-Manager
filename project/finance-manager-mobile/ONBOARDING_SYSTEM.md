# Onboarding System

This document describes the onboarding system implemented for new users in the Finance Manager mobile app.

## Overview

The onboarding system provides a guided experience for new users to set up their financial tracking by creating accounts, transactions, and budgets. Users can skip any step if they prefer to set up these features later.

## Features

### 1. Welcome Screen
- Introduces the app and its key features
- Shows benefits of using the app
- Provides "Get Started" and "Skip for now" options

### 2. Account Creation
- Guides users to create their first account
- Supports different account types (Checking, Savings, Credit Card, Investment)
- Collects account name and current balance
- Includes skip option with confirmation dialog

### 3. Transaction Setup
- Helps users add their first transaction
- Supports both income and expense transactions
- Includes category selection
- Collects transaction name and amount
- Includes skip option with confirmation dialog

### 4. Budget Creation
- Guides users to create their first budget
- Supports different budget periods (Weekly, Monthly, Yearly)
- Includes category selection
- Collects budget name and amount
- Includes skip option with confirmation dialog

### 5. Completion Screen
- Shows success message and app features summary
- Auto-completes onboarding after 2 seconds
- Provides manual "Get Started" button

## Technical Implementation

### State Management
- **Redux Slice**: `onboardingSlice.ts`
- **State Properties**:
  - `isOnboardingComplete`: Whether onboarding is finished
  - `currentStep`: Current step in the flow (0-4)
  - `totalSteps`: Total number of steps (4)
  - `hasCreatedAccount`: Whether user created an account
  - `hasCreatedTransaction`: Whether user created a transaction
  - `hasCreatedBudget`: Whether user created a budget

### Navigation
- **Navigator**: `OnboardingNavigator.tsx`
- **Screens**:
  - `OnboardingWelcomeScreen`
  - `OnboardingAccountScreen`
  - `OnboardingTransactionScreen`
  - `OnboardingBudgetScreen`
  - `OnboardingCompletionScreen`

### Integration
- Integrated into `AppNavigator.tsx`
- Shows after currency selection for new users
- Automatically resets when new user registers
- Persists completion status in SecureStore

## User Flow

1. **New User Registration** → Currency Selection → Onboarding
2. **Existing User Login** → Main App (no onboarding)
3. **Onboarding Flow**:
   - Welcome → Account → Transaction → Budget → Completion → Main App
4. **Skip Options**: Available at each step with confirmation dialogs

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
