# 💸 ExpenseWise Manager & Budgets
**A React Native Expo personal finance companion for tracking daily spending, managing budgets, building savings goals, and understanding money habits with live insights.**

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.22-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.2.7-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)

## 🧭 Overview
ExpenseWise Manager & Budgets is a mobile-first finance app built for people who want a clearer picture of their everyday money habits without using a full banking product. The app combines transaction tracking, budget monitoring, savings goals, exports, reminders, and analytics into a single Expo-based React Native experience. It is designed around real recurring usage: fast capture flows, persistent local state, refresh-on-focus behavior, and API-backed insights that keep the dashboard useful after every edit. A few details that stand out in the codebase are the guided post-signup onboarding overlay, live dashboard insight hydration, statement import preview, and background services for reminders, goal monitoring, budget monitoring, and app-update enforcement.

## 📸 Screenshots or Demo
Screenshots below.

## ✨ Features
### Dashboard & overview
- **Home dashboard with live summary cards** in `src/screens/dashboard/DashboardScreen.tsx`: total balance, monthly income, monthly expenses, monthly savings, savings rate, recent activity, and a smart budget alert.
- **Category breakdown visualization** through `src/components/dashboard/CategoryBreakdownSection.tsx` and reusable chart primitives in `src/components/charts/`.
- **Recommendations preview** on the dashboard using `RecommendationCard` components fed from `recommendationsSlice`.
- **Currency-aware balance presentation** through `src/components/dashboard/CurrencySummary.tsx` and `src/utils/currency.ts`.
- **Refresh on focus and pull-to-refresh** so the dashboard rehydrates when users come back after edits on other screens.

### Transactions
- **Transaction history screen** in `src/screens/transactions/TransactionsListScreen.tsx` with grouped-by-date sections, running balance grouping, pagination, pull-to-refresh, and quick add.
- **Transaction search and filtering** powered by `src/hooks/useSearchWithDebounce.ts`, `src/hooks/useTransactionFilters.ts`, `src/components/transactions/SearchBar.tsx`, and `src/components/transactions/TransactionFilters.tsx`.
- **Add and edit flow** in `src/screens/transactions/AddEditTransactionScreen.tsx` with account selection, category selection, income/expense type, amount, description, merchant, tags, and date entry.
- **Transaction detail flow** in `src/screens/transactions/TransactionDetailScreen.tsx` with edit and delete actions.
- **Calendar screen** in `src/screens/transactions/TransactionCalendarScreen.tsx` with month summaries, per-day totals, date-range filtering, and direct drill-through into filtered history.
- **Bulk operations screen scaffold** in `src/screens/transactions/BulkOperationsScreen.tsx` for multi-select transaction workflows.
- **Defensive transaction normalization** in `src/store/slices/transactionsSlice.ts` so malformed API payloads do not crash recent-activity or detail rendering.

### Goals & savings
- **Goals list with summary cards** in `src/screens/goals/GoalsListScreen.tsx`: active goals, total saved, completed goals, analytics shortcut, and per-goal contribution CTA.
- **Manual goal creation and editing** in `src/screens/goals/AddManualGoalScreen.tsx` with target amount, initial contribution, target date, category, priority, and status.
- **Goal detail view** in `src/screens/goals/GoalDetailScreen.tsx` with progress ring, remaining amount, monthly savings needed, status, contribution flow, edit, and delete.
- **Goal contribution flow** from both list and detail screens, backed by account selection and Redux synchronization.
- **AI goal-setting flow** in `src/screens/goals/AIGoalSettingScreen.tsx`, backed by `startAIGoalSession`, `chatWithAI`, and `finalizeAIGoal` thunks in `src/store/slices/goalsSlice.ts`.
- **Goal analytics screen** in `src/screens/goals/GoalAnalyticsScreen.tsx` with monthly savings target, remaining amount, completion rate, on-track vs at-risk grouping, and deep links into individual goals.
- **Goal insight components** in `src/components/goals/GoalAnalyticsSummary.tsx`, `src/components/goals/GoalContributionTimeline.tsx`, and `src/components/goals/GoalInsights.tsx`.

### Budgets
- **Budgets list screen** in `src/screens/budgets/BudgetsListScreen.tsx` with budget cards, refresh, create flow, analytics entry point, edit, delete, and active-state toggling.
- **Budget create/edit flow** in `src/screens/budgets/CreateEditBudgetScreen.tsx` with category selection, period presets, auto-generated date ranges, custom date support, threshold handling, and duplicate-budget conflict handling.
- **Budget detail screen** in `src/screens/budgets/BudgetDetailScreen.tsx` with progress visualization, spent/remaining calculations, active/inactive state, recent related transactions, edit, and delete.
- **Budget analytics screen** in `src/screens/budgets/BudgetAnalyticsScreen.tsx` backed by `budgetAnalyticsSlice`, with utilization, top spending categories, and over-budget warnings.
- **Recurring budget renewal service** in `src/services/budgetRenewalService.ts`, initialized on app start and checked again from budget surfaces.

### Accounts
- **Accounts list** in `src/screens/accounts/AccountsListScreen.tsx` with total balance summary and account cards.
- **Account detail screen** in `src/screens/accounts/AccountDetailScreen.tsx` with income, expenses, net change, average transaction, largest expense, largest income, top category, and recent transactions.
- **Add/edit account flow** in `src/screens/accounts/AddEditAccountScreen.tsx` with account type, balance, and currency-aware defaults; balance-only edits route through a dedicated PATCH path.
- **Premium-ready account sharing surface** in `src/screens/accounts/AccountSharingScreen.tsx`.

### Categories
- **Custom category management** in `src/screens/categories/CategoriesScreen.tsx` with CRUD actions.
- **Color and icon picking** in `src/screens/categories/AddEditCategoryScreen.tsx`, including preview before save.

### Notifications & reminders
- **Deferred notification permission flow** in `src/components/NotificationRequestWrapper.tsx`, triggered only after auth + onboarding completion.
- **Notification settings screen** in `src/screens/notifications/NotificationSettingsScreen.tsx` for permission checks and scheduled daily reminder toggles.
- **Daily reminder settings screen** in `src/screens/notifications/DailyReminderSettingsScreen.tsx` with reminder time control, today's logging status, and test reminder action.
- **Notification center** in `src/screens/notifications/NotificationCenterScreen.tsx` with unread counts, mark-as-read, test notifications, and scheduled notification inspection.
- **Notification service layer** in `src/services/notificationService.ts`, `src/services/notificationScheduler.ts`, `src/services/notificationMemoryService.ts`, `src/services/budgetMonitoringService.ts`, and `src/services/goalMonitoringService.ts`.

### Export & statement tools
- **Dedicated export screen** in `src/screens/export/ExportScreen.tsx` for Excel, CSV, and PDF exports with date-range selection, file generation, validation, and native share sheet handoff.
- **Statement import screen** in `src/screens/statements/StatementImportScreen.tsx` with `expo-document-picker`, CSV parsing, import preview, totals preview, selected-account import target, and bulk import dispatch.
- **Export utilities** in `src/utils/exportUtils.ts` for MIME types, file names, validation, and share behavior.

### Profile, settings, and support
- **Profile screen** in `src/screens/profile/ProfileScreen.tsx` with user identity, stats, subscription info, and logout.
- **Edit profile screen** in `src/screens/profile/EditProfileScreen.tsx` with backend-synced profile updates.
- **Settings screen** in `src/screens/settings/SettingsScreen.tsx` for font size, font family, and bold-number preferences.
- **Help & support** in `src/screens/help/HelpSupportScreen.tsx` with FAQ and app information.
- **Secure account deletion flow** in `src/screens/help/AccountDeletionScreen.tsx` requiring confirmation phrase plus password before destructive action.
- **More tab hub** in `src/screens/more/MoreScreen.tsx` linking categories, export, notifications, profile, help, and support actions.

### UX, reliability, and platform behavior
- **Three-screen animated onboarding** using `react-native-pager-view` and `lottie-react-native`, followed by an **8-step in-app guided overlay** driven by `onboardingSlice` and `useOnboardingOverlay`.
- **Crash boundary at the app root** in `src/components/common/CrashErrorBoundary.tsx`.
- **Force-update overlay** backed by `src/services/appUpdateService.ts`, `src/hooks/useAppUpdate.ts`, and `src/components/common/AppUpdateOverlay.tsx`.
- **Secure token storage** through `expo-secure-store` and Axios interceptors with refresh-token handling in `src/services/api.ts`.
- **Persisted local state** for auth, accounts, transactions, categories, budgets, goals, notifications, user settings, and onboarding progress.
- **Network-awareness and offline support scaffolding** via `src/services/networkService.ts`, `src/services/offlineQueue.ts`, `src/components/common/OfflineIndicator.tsx`, and `src/components/common/NetworkStatusIndicator.tsx`.

### Product-ready extension surfaces already present in the repo
- `src/screens/bills/BillsScreen.tsx` provides a coming-soon bill-reminder surface.
- `src/screens/recommendations/RecommendationsHistoryScreen.tsx` provides a placeholder destination for a richer recommendation archive.
- `src/components/dashboard/WeeklyFinancialHealthSection.tsx`, `src/components/dashboard/SmartInsightsSection.tsx`, and related utility modules show a deeper analytics direction already started in the codebase.

## 🛠️ Tech Stack
| Tool / Library | Why it is in this project |
| --- | --- |
| **React Native** | Core cross-platform mobile framework for Android and iOS UI. |
| **Expo** | Simplifies native tooling, runtime APIs, and iteration for an app of this size. |
| **TypeScript** | Adds safer domain types for screens, slices, API responses, and utilities. |
| **Redux Toolkit** | Centralizes async state, API lifecycle handling, and domain-oriented reducers. |
| **React Redux** | Connects screens and components to the global store with typed hooks. |
| **Redux Persist** | Rehydrates critical app data so the app can reopen with last-known state intact. |
| **@react-native-async-storage/async-storage** | Storage backend for persisted Redux state and queued offline metadata. |
| **React Navigation** | Powers nested stacks, bottom tabs, and swipe-based section flows. |
| **react-native-tab-view** | Drives the swipeable Transactions and Goals/Budget top-tab experiences. |
| **react-native-pager-view** | Powers the onboarding flow with horizontal paging. |
| **Axios** | Handles authenticated API requests, interceptors, retries, and token refresh flow. |
| **Expo Secure Store** | Stores access tokens, refresh tokens, and currency hints securely on device. |
| **@react-native-community/netinfo** | Detects connectivity changes for offline/online behavior. |
| **Expo Notifications** | Handles notification permissions, scheduling, and local notification delivery. |
| **Expo Document Picker** | Allows CSV statement selection for import workflows. |
| **Expo File System** | Saves exported files to local storage before sharing. |
| **Expo Sharing** | Opens the native share sheet for generated exports. |
| **react-native-chart-kit** | Renders dashboard and analytics charts. |
| **react-native-svg** | Provides the vector primitives required by chart rendering. |
| **Lottie React Native** | Adds animated onboarding illustrations. |
| **Expo Linear Gradient** | Styles analytics summary cards and richer visual sections. |
| **date-fns** | Formats notification timestamps and date-based UI consistently. |
| **React Native Paper** | Included dependency for Material-aligned component patterns; the current app mostly uses custom components. |
| **React Hook Form** | Included dependency for scalable form handling; current forms are primarily controlled custom inputs. |
| **Yup** | Available for schema-based validation in form-heavy flows. |
| **Jest + ts-jest** | Test runner and TypeScript-aware unit testing setup. |
| **EAS Build** | Produces internal APK preview builds and production store bundles. |

## 🗂️ Project Structure
```text
src/
├── components/                 # Reusable UI building blocks shared across screens.
│   ├── budgets/                # Budget analytics summaries, reports, and budget-specific cards.
│   ├── charts/                 # Reusable bar, line, pie, and donut chart wrappers.
│   ├── common/                 # App shell, form controls, loaders, cards, boundaries, and shared primitives.
│   ├── dashboard/              # Dashboard sections, widgets, refresh helpers, and insight modules.
│   ├── debug/                  # Debug/test panels for notifications, goal monitoring, and budget monitoring.
│   ├── export/                 # Reusable export-related UI.
│   ├── goals/                  # Goal analytics summaries, timelines, and insight cards.
│   ├── onboarding/             # Onboarding progress UI.
│   ├── settings/               # Settings-specific reusable UI.
│   └── transactions/           # Search, filters, quick filters, loading, and error wrappers for transactions.
├── config/                     # API endpoints, environment switching, dev-network config, and update config.
├── constants/                  # Shared design tokens like colors and chart config.
├── contexts/                   # Context provider for onboarding screen state.
├── hooks/                      # Typed Redux hooks plus search, filters, onboarding, update, and query helpers.
├── navigation/                 # Bottom tabs, nested stacks, onboarding, auth, and feature navigators.
├── screens/                    # Screen-level product surfaces.
│   ├── accounts/               # Account list, detail, create/edit, and sharing screens.
│   ├── auth/                   # Login, register, forgot password, and currency selection.
│   ├── bills/                  # Bill-reminder placeholder screen.
│   ├── budgets/                # Budget list, detail, create/edit, and analytics.
│   ├── categories/             # Category list and create/edit flows.
│   ├── dashboard/              # Main dashboard and safety variants.
│   ├── export/                 # Export screen and related tests/docs.
│   ├── goals/                  # Goals list, goal detail, manual creation, AI setup, and analytics.
│   ├── help/                   # Help/support and secure account deletion.
│   ├── more/                   # More-tab hub screen.
│   ├── notifications/          # Notification center, permission settings, and daily reminder controls.
│   ├── onboarding/             # Introductory onboarding screens.
│   ├── profile/                # Profile view and edit flow.
│   ├── recommendations/        # Recommendation history placeholder surface.
│   ├── settings/               # Typography and display preference settings.
│   ├── statements/             # Statement import and export-related document workflows.
│   └── transactions/           # Transaction list, detail, add/edit, calendar, and bulk operations.
├── services/                   # API client, network detection, queueing, updates, reminders, and monitoring services.
├── store/                      # Redux store bootstrap plus domain slices.
│   ├── index.ts                # Store configuration and Redux Persist setup.
│   └── slices/                 # Domain reducers for auth, user, accounts, transactions, budgets, goals, analytics, UI, onboarding, and updates.
├── types/                      # Shared TypeScript models for API payloads, goals, and transactions.
└── utils/                      # Currency helpers, chart transforms, filtering logic, analytics math, accessibility helpers, and shared formatting logic.
```

## 🚀 Getting Started
### Prerequisites
- Node.js 18+
- npm
- Expo SDK 53 compatible environment
- Android Studio for Android emulators
- Xcode for iOS simulators on macOS

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ExpenseWise-Manager
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
This project reads runtime API configuration from `app.config.js` via `.env`.

Create a `.env` file in the project root:
```env
API_BASE_URL=https://your-backend-host
API_PREFIX=/api
API_TIMEOUT=15000
ENVIRONMENT=development
ENABLE_LOGGING=true
ENABLE_ANALYTICS=false
```

### 4. Configure local device development if needed
For phone-on-LAN Expo development, update `src/config/dev-config.ts` with your machine's local IP address so the app can reach your local backend from a physical device.

### 5. Start Expo
```bash
npm start
```

### 6. Run on Android
```bash
npm run android
```

### 7. Run on iOS
```bash
npm run ios
```

### 8. Optional scripts
```bash
npm run clear
npm test
npm run test:watch
npm run test:coverage
npm run check-jsx
```

## 🧠 Architecture & State Management
### Redux Toolkit by domain
The app is organized around domain slices rather than screen-local state. `src/store/slices/` contains slices for auth, user profile, accounts, transactions, categories, budgets, goals, notifications, recommendations, analytics, budget analytics, onboarding, UI preferences, and app updates. Each slice owns its async thunks, server synchronization, loading state, and error state.

### Typed store access
Screens use typed hooks from `src/hooks/useAppDispatch.ts` and `src/hooks/useTypedSelector.ts` instead of raw Redux hooks. That keeps dispatch/select usage consistent and makes screen code easier to reason about during async flows.

### Refresh strategy
Most primary surfaces rely on `useFocusEffect` or an equivalent loader function:
- `DashboardScreen` refreshes accounts, recent transactions, budgets, recommendations, and dashboard insights on focus.
- `TransactionsListScreen`, `GoalsListScreen`, `BudgetsListScreen`, and `AccountDetailScreen` all reload their core data when users return from create/edit flows.
- Pull-to-refresh is also wired into the main list-based screens.

### Persistence with Redux Persist
`src/store/index.ts` whitelists critical slices for persistence:
- `auth`
- `user`
- `accounts`
- `transactions`
- `categories`
- `budgets`
- `goals`
- `notifications`
- `onboarding`

This means the app can reopen with the user's last-known auth state, financial data, preferences, and onboarding progress already restored. Non-critical slices like analytics, recommendations, and transient UI state are intentionally excluded.

### Token handling and secure storage
Sensitive auth data is stored with `expo-secure-store`. The Axios client in `src/services/api.ts` injects bearer tokens into protected requests, retries failed requests after token refresh, and centralizes API method definitions for accounts, transactions, categories, budgets, goals, export, analytics, and profile data.

### Offline behavior and queueing
There are two layers of offline resilience in the codebase:
1. **Persisted Redux state** keeps previously fetched financial data available on reopen.
2. **Offline queue scaffolding** in `src/services/offlineQueue.ts` stores pending operations in AsyncStorage and retries them when connectivity returns. Queue status is surfaced through `OfflineIndicator`, and connectivity changes are tracked through `src/services/networkService.ts` and `src/utils/networkUtils.ts`.

In practice, the strongest day-to-day offline continuity currently comes from persisted Redux state and network-aware auth fallback. The queueing infrastructure is present and documented in code for retryable mutation workflows.

### Background services
This codebase goes beyond plain CRUD by including:
- `budgetRenewalService.ts` for recurring budget renewal
- `budgetMonitoringService.ts` for budget-alert style checks
- `goalMonitoringService.ts` for goal progress reminders
- `notificationService.ts` and `notificationScheduler.ts` for local/push-style notification scheduling
- `appUpdateService.ts` for version checks and force-update overlays

## ☁️ Backend Integration
ExpenseWise is connected to a live AWS-hosted backend used by the APK build. The production API URL is configured through `src/config/environment.ts`, while local development can override it through `.env` or `src/config/dev-config.ts`.

The backend is responsible for:
- Authentication and token refresh
- User profile and subscription data
- Account, transaction, category, budget, and goal data
- Dashboard insights and analytics
- Recommendation payloads
- Export endpoints
- Currency metadata and preference sync

The APK build is intended to talk directly to the live hosted backend rather than a mock server.

## ✅ Feature Coverage Map
| Assignment Requirement | Status | Coverage Note |
| --- | --- | --- |
| Home Dashboard with Summary | ✅ Implemented | `src/screens/dashboard/DashboardScreen.tsx` renders total balance, monthly income, expenses, savings, savings rate, recent activity, and smart budget alerts. |
| Visual Element (Chart/Trend/Breakdown) | ✅ Implemented | `src/components/dashboard/CategoryBreakdownSection.tsx` plus reusable chart components in `src/components/charts/` provide chart-based spending breakdowns. |
| Transaction Tracking (Add/View/Edit/Delete) | ✅ Implemented | `src/screens/transactions/AddEditTransactionScreen.tsx`, `src/screens/transactions/TransactionDetailScreen.tsx`, `src/screens/transactions/TransactionsListScreen.tsx`, and `transactionsSlice.ts` cover the full CRUD loop. |
| Transaction Filtering and Search | ✅ Implemented | `src/hooks/useTransactionFilters.ts`, `src/hooks/useSearchWithDebounce.ts`, and the filters/search UI in `src/components/transactions/` power category, type, period, date-range, and search flows. |
| Goal or Challenge Feature | ✅ Implemented | `src/screens/goals/GoalsListScreen.tsx`, `src/screens/goals/AddManualGoalScreen.tsx`, `src/screens/goals/GoalDetailScreen.tsx`, and `src/screens/goals/AIGoalSettingScreen.tsx` provide savings-goal creation, contribution tracking, and AI-assisted goal setup. |
| Insights Screen | ✅ Implemented | `src/screens/goals/GoalAnalyticsScreen.tsx`, `src/screens/budgets/BudgetAnalyticsScreen.tsx`, and dashboard insight widgets provide multiple insight surfaces. |
| Smooth Navigation Flow | ✅ Implemented | `src/navigation/MainNavigator.tsx`, `src/navigation/TransactionsNavigator.tsx`, `src/navigation/GoalsBudgetNavigator.tsx`, and `src/navigation/MoreNavigator.tsx` combine bottom tabs, nested stacks, and swipeable tab sections. |
| Empty and Loading and Error States | ✅ Implemented | `LoadingSpinner`, `EmptyState`, screen-specific empty states, alert-based async error handling, and the root `CrashErrorBoundary` are used throughout the app. |
| Local Data Persistence | ✅ Implemented | `src/store/index.ts` uses Redux Persist with AsyncStorage to retain auth, financial data, preferences, and onboarding state between sessions. |
| State Management | ✅ Implemented | Redux Toolkit slices in `src/store/slices/` manage auth, transactions, accounts, goals, budgets, analytics, notifications, and UI state. |

## 📦 APK Download
APK link placeholder.

## 🏪 Play Store
Play Store link placeholder.
