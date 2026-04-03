# 💸 ExpenseWise Manager & Budgets
**A React Native Expo personal finance companion for tracking daily spending, managing budgets, building savings goals, and understanding money habits with live insights.**

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.22-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.2.7-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)

---

## 🧭 Overview
ExpenseWise is a mobile-first personal finance companion built for everyday use — not a banking app, but a lightweight tool that helps users understand their spending habits, track transactions, manage budgets, and work toward savings goals. It combines a live AWS-hosted backend with offline-first Redux persistence so the app stays usable even without a network. It is published on the Google Play Store and actively maintained.

---

## 📸 Screenshots

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/9d051481-b744-418e-8339-1cbe49b46b57" width="220" /></td>
    <td><img src="https://github.com/user-attachments/assets/5827d923-ea54-419c-8f1c-2105a05bf7b8" width="220" /></td>
    <td><img src="https://github.com/user-attachments/assets/3c1129a1-38a7-4c56-82b5-05a92f92a792" width="220" /></td>
    <td><img src="https://github.com/user-attachments/assets/e370ced4-4aae-4f5c-abb4-f4e4cb43a0b8" width="220" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/062ae1eb-57a3-45c3-9578-6ee52c13defb" width="220" /></td>
    <td><img src="https://github.com/user-attachments/assets/4cf9d978-c9fe-4381-a451-c3eacca37b50" width="220" /></td>
    <td><img src="https://github.com/user-attachments/assets/ebb02fdf-f134-4153-86b2-c13da266f378" width="220" /></td>
    <td> <img  src="https://github.com/user-attachments/assets/43fbaa3b-e1b4-4151-8983-e0c4de206017" width="220" /></td>
  </tr>
</table>

---


## ✨ Features

### 💳 Dashboard
- **Home summary**: Total balance, monthly income, monthly expenses, savings amount, and savings rate — all on the home screen.
- **Category breakdown chart**: Visual spending breakdown by category using interactive chart components.
- **Smart budget alert**: Surfaces the most urgent over-budget warning directly on the dashboard.
- **Recommendations**: Personalized spending recommendations rendered as cards from the backend.

### 📊 Transactions
- **Transaction tracking**: Add, view, edit, and delete transactions with amount, type, category, merchant, tags, date, and description.
- **Search and filtering**: Debounced search plus filters for type, category, period, and custom date range.
- **Calendar view**: Month grid showing per-day totals with drill-through into filtered transaction history.
- **Bulk operations**: Multi-select scaffold for bulk transaction management workflows.

### 🎯 Goals & Savings
- **Savings goals**: Create goals with target amount, target date, category, and priority — track contribution progress with a visual progress ring.
- **Goal contributions**: Add contributions from any screen with account selection and instant Redux sync.
- **AI goal setup**: Conversational AI-assisted goal creation via a multi-turn chat flow.
- **Goal analytics**: On-track vs at-risk grouping, completion rates, monthly savings targets, and deep links into individual goals.

### 📁 Budgets
- **Budget management**: Create category-based budgets with period presets, auto date ranges, custom dates, and spending thresholds.
- **Budget detail**: Real-time progress tracking with spent/remaining amounts, related transactions, and active/inactive toggling.
- **Budget analytics**: Utilization rates, top spending categories, and over-budget warnings.
- **Auto renewal**: Background service renews recurring budgets on schedule.

### 🏦 Accounts
- **Multi-account tracking**: Supports checking, savings, credit, investment, and cash account types.
- **Account detail analytics**: Income, expenses, net change, largest transaction, top category, and recent activity per account.

### 📈 Insights
- **Spending trends**: Monthly summaries and period-over-period comparisons across transactions and budgets.
- **Financial health**: Dashboard insight cards hydrated from the backend with category-level breakdowns.
- **Weekly health section**: Weekly financial health widget built into the dashboard surface.

### 🔔 Notifications & Reminders
- **Daily reminders**: Scheduled local notifications for daily expense logging with custom time settings.
- **Budget + goal alerts**: Background monitoring services fire alerts when budgets are exceeded or goals need attention.
- **Notification center**: Unread counts, mark-as-read, and scheduled notification inspection.

### 📤 Export & Import
- **Data export**: Generate CSV, Excel, and PDF financial reports with date-range selection and native share sheet.
- **Statement import**: Pick a CSV bank statement, preview parsed transactions, and bulk-import with account selection.

### 🎨 UX & Reliability
- **Onboarding**: Three-screen animated intro (Lottie) followed by an 8-step guided in-app overlay for new users.
- **Offline support**: Redux Persist keeps all financial data available on reopen; an offline queue retries mutations when connectivity returns.
- **Force update overlay**: Version check service shows a blocking overlay when a mandatory app update is available.
- **Dark / Light theme**: Full theme support across all screens.
- **Crash boundary**: Root-level error boundary prevents full app crashes from unhandled exceptions.

## 🗂️ Project Structure
```
src/
├── components/       # Reusable UI across screens (charts, cards, forms, loaders, empty states)
│   ├── budgets/      # Budget summary cards and analytics UI
│   ├── charts/       # Bar, line, pie, and donut chart wrappers
│   ├── common/       # App shell, boundaries, overlays, offline indicator, shared primitives
│   ├── dashboard/    # Dashboard sections, insight widgets, weekly health, category breakdown
│   ├── goals/        # Goal analytics, contribution timeline, insight cards
│   └── transactions/ # Search bar, filter UI, loading/error wrappers
├── config/           # API endpoints, environment config, dev network overrides
├── constants/        # Design tokens — colors, chart config
├── hooks/            # Typed Redux hooks, search debounce, filter logic, onboarding, update checks
├── navigation/       # Bottom tabs, nested stacks, auth flow, onboarding navigator
├── screens/          # All product screens organized by domain
│   ├── accounts/     # Account list, detail, create/edit
│   ├── auth/         # Login, register, forgot password, currency selection
│   ├── budgets/      # Budget list, detail, create/edit, analytics
│   ├── categories/   # Category list and create/edit
│   ├── dashboard/    # Main dashboard screen
│   ├── export/       # CSV, Excel, PDF export
│   ├── goals/        # Goals list, detail, manual + AI creation, analytics
│   ├── notifications/# Notification center, permission settings, daily reminders
│   ├── onboarding/   # Animated intro screens
│   ├── profile/      # Profile view and edit
│   ├── settings/     # Typography and display preferences
│   ├── statements/   # CSV statement import with preview
│   └── transactions/ # Transaction list, detail, add/edit, calendar, bulk ops
├── services/         # Axios client, offline queue, network monitor, reminder + budget + goal monitoring
├── store/
│   ├── index.ts      # Redux store setup and Redux Persist config
│   └── slices/       # Domain reducers: auth, accounts, transactions, budgets, goals, analytics, UI, onboarding
├── types/            # Shared TypeScript models for API responses and domain entities
└── utils/            # Currency helpers, chart transforms, filter logic, analytics math, export utilities
```
---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| **React Native + Expo** | Cross-platform mobile framework with managed native tooling |
| **TypeScript** | Type-safe domain models, API payloads, and screen props |
| **Redux Toolkit** | Centralized async state with domain-oriented slices and thunks |
| **Redux Persist + AsyncStorage** | Offline state rehydration across app sessions |
| **React Navigation** | Bottom tabs, nested stacks, and swipeable tab sections |
| **Axios + Expo Secure Store** | Authenticated API requests, token refresh, and secure token storage |
| **react-native-chart-kit + SVG** | Dashboard charts and category breakdown visualizations |
| **Expo Notifications** | Local notification scheduling for reminders and alerts |
| **Expo Document Picker + File System + Sharing** | Statement import, export generation, and native share sheet |
| **Lottie React Native** | Animated onboarding illustrations |
| **@react-native-community/netinfo** | Connectivity detection for offline/online queue flushing |
| **EAS Build** | APK and production store bundle generation |
| **date-fns** | Date formatting throughout the app |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (Android) or Xcode (iOS)

### Setup
```bash
git clone <your-repo-url>
cd ExpenseWise-Manager
npm install
```

Create a `.env` file:
```env
API_BASE_URL=https://your-backend-host
API_PREFIX=/api
API_TIMEOUT=15000
ENVIRONMENT=development
ENABLE_LOGGING=true
```

```bash
npm start        # Start Expo dev server
npm run android  # Run on Android
npm run ios      # Run on iOS
```

> **Note:** For physical device development, update `src/config/dev-config.ts` with your machine's local IP.

---

## 🧠 Architecture & State Management

**Domain-oriented Redux slices** — `src/store/slices/` contains separate reducers for auth, accounts, transactions, categories, budgets, goals, analytics, notifications, onboarding, and UI preferences. Each slice owns its async thunks, loading state, and error state independently.

**Typed store access** — all screens use typed hooks from `useAppDispatch` and `useTypedSelector` rather than raw Redux hooks, keeping dispatch and select usage consistent.

**Refresh strategy** — primary screens use `useFocusEffect` to reload data when users return from create/edit flows. Pull-to-refresh is wired into all major list screens.

**Persistence** — Redux Persist whitelists auth, accounts, transactions, categories, budgets, goals, notifications, and onboarding. Analytics and transient UI state are excluded intentionally.

**Offline queue** — `src/services/offlineQueue.ts` stores pending mutations in AsyncStorage and retries them when `networkService.ts` detects connectivity returning. An `OfflineIndicator` surfaces queue status in the UI.

**Background services** — `budgetRenewalService`, `budgetMonitoringService`, `goalMonitoringService`, `notificationScheduler`, and `appUpdateService` initialize on app start and run independently of screen lifecycle.

---

## ☁️ Backend Integration

The app connects to a live backend hosted on **AWS EC2**. The APK build is pre-configured to talk to this backend directly — no local setup needed to run the built APK.

The backend handles:
- Auth and token refresh
- User profile and subscription state
- Account, transaction, category, budget, and goal persistence
- Dashboard insights and analytics
- Recommendation payloads
- Export endpoints
- Currency metadata and user preference sync

Local development can override the API URL via `.env` or `src/config/dev-config.ts`.

---

## ✅ Assignment Feature Coverage

| Requirement | Status | Where |
|-------------|--------|-------|
| Home Dashboard with Summary | ✅ | `DashboardScreen.tsx` — balance, income, expenses, savings, savings rate |
| Visual Element (Chart/Trend/Breakdown) | ✅ | `CategoryBreakdownSection.tsx` + `src/components/charts/` |
| Transaction Tracking (Add/View/Edit/Delete) | ✅ | `AddEditTransactionScreen`, `TransactionDetailScreen`, `TransactionsListScreen` |
| Transaction Filtering and Search | ✅ | `useTransactionFilters`, `useSearchWithDebounce`, `TransactionFilters` component |
| Goal or Challenge Feature | ✅ | `GoalsListScreen`, `AddManualGoalScreen`, `GoalDetailScreen`, `AIGoalSettingScreen` |
| Insights Screen | ✅ | `GoalAnalyticsScreen`, `BudgetAnalyticsScreen`, dashboard insight widgets |
| Smooth Navigation Flow | ✅ | Bottom tabs + nested stacks in `src/navigation/` |
| Empty, Loading, and Error States | ✅ | `EmptyState`, `LoadingSpinner`, screen-level error alerts, `CrashErrorBoundary` |
| Local Data Persistence | ✅ | Redux Persist with AsyncStorage — whitelisted across all critical slices |
| State Management | ✅ | Redux Toolkit slices in `src/store/slices/` covering all app domains |

---

## 📦 APK Download
[Download APK](#) — _replace with Google Drive link_

## 🏪 Play Store
[View on Google Play](#) — _replace with Play Store link_
