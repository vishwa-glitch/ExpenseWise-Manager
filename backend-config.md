# 🚀 Fintech Backend API Reference for Frontend Development

## 📋 Quick Start Configuration

### 🔗 API Base URLs
```javascript
// Development
const API_BASE_URL = 'http://localhost:3000/api';

// Production (when deployed)
const API_BASE_URL = 'https://your-domain.com/api';
```

### 🔑 Authentication Headers
```javascript
// For protected endpoints
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`
};

// For file uploads
const uploadHeaders = {
  'Authorization': `Bearer ${accessToken}`
  // Don't set Content-Type for FormData
};
```

### 👤 Test User Credentials
```javascript
const testUser = {
  email: "test@example.com",
  password: "testpassword123",
  first_name: "John",
  last_name: "Doe",
  preferred_currency: "USD",
  subscription_tier: "premium"
};
```

## 🎯 Core Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  preferred_currency: string; // 3-letter code (USD, EUR, INR, etc.)
  subscription_tier: 'free' | 'premium';
  subscription_expires_at?: string;
  created_at: string;
  stats: {
    account_count: number;
    transaction_count: number;
    custom_category_count: number;
    active_goal_count: number;
  };
}
```

### Account Model
```typescript
interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string; // 3-letter code
  is_active: boolean;
  created_at: string;
}
```

### Transaction Model
```typescript
interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  description: string;
  transaction_date: string; // YYYY-MM-DD
  created_at: string;
  tags?: string[];
  merchant?: string;
  location?: string;
  receipt_url?: string;
  category_name?: string;
  category_color?: string;
  account_name?: string;
}
```

### Category Model
```typescript
interface Category {
  id: string;
  user_id: string;
  name: string;
  parent_id?: string;
  color: string; // Hex color
  icon: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  subcategories?: Category[];
}
```

### Budget Model
```typescript
interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly' | 'custom';
  start_date: string;
  end_date: string;
  alert_threshold: number; // 0.0 to 1.0
  is_active: boolean;
  created_at: string;
  category_name?: string;
  category_color?: string;
  spent_amount?: number;
  remaining_amount?: number;
  progress_percentage?: number;
  is_over_budget?: boolean;
}
```

### Bill Reminder Model
```typescript
interface BillReminder {
  id: string;
  user_id: string;
  title: string;
  amount?: number;
  due_date: string;
  frequency: 'once' | 'weekly' | 'monthly' | 'yearly';
  category_id?: string;
  is_paid: boolean;
  reminder_days_before: number;
  created_at: string;
  category_name?: string;
  category_color?: string;
  days_until_due?: number;
  urgency?: 'overdue' | 'due_today' | 'urgent' | 'soon' | 'upcoming';
}
```

### Currency Model
```typescript
interface Currency {
  code: string; // 3-letter code (USD, EUR, INR)
  name: string; // Full name (US Dollar, Euro, Indian Rupee)
  symbol: string; // Symbol ($, €, ₹)
}

interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}
```

## 🔐 Authentication API

### Register User
```javascript
// POST /api/auth/register
const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: "user@example.com",
      password: "password123",
      first_name: "John",
      last_name: "Doe" // Optional
    })
  });
  return response.json();
};

// Response
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "subscription_tier": "free"
  },
  "tokens": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "token_type": "Bearer",
    "expires_in": 900
  }
}
```

### Login User
```javascript
// POST /api/auth/login
const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: "test@example.com",
      password: "testpassword123"
    })
  });
  return response.json();
};

// Response: Same as register
```

### Refresh Token
```javascript
// POST /api/auth/refresh
const refreshToken = async (refreshToken) => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  return response.json();
};
```

## 👤 User Management API

### Get User Profile
```javascript
// GET /api/user/profile
const getUserProfile = async (accessToken) => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "preferred_currency": "USD",
    "subscription_tier": "premium",
    "subscription_expires_at": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "stats": {
      "account_count": 3,
      "transaction_count": 45,
      "custom_category_count": 2,
      "active_goal_count": 1
    }
  }
}
```

### Update User Profile
```javascript
// PUT /api/user/profile
const updateProfile = async (accessToken, updates) => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      first_name: "Jane",
      last_name: "Smith",
      preferred_currency: "EUR"
    })
  });
  return response.json();
};
```

### Change User Currency (Bulk Conversion)
```javascript
// POST /api/user/change-currency
const changeCurrency = async (accessToken, newCurrency, convertData = true) => {
  const response = await fetch(`${API_BASE_URL}/user/change-currency`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      new_currency: newCurrency, // "INR", "EUR", "GBP", etc.
      convert_existing_data: convertData
    })
  });
  return response.json();
};

// Response
{
  "success": true,
  "message": "Currency successfully changed to INR",
  "previous_currency": "USD",
  "new_currency": "INR",
  "data_converted": true,
  "conversion_summary": {
    "accounts_converted": 3,
    "budgets_converted": 2,
    "transactions_converted": 45,
    "bill_reminders_converted": 1,
    "total_errors": 0,
    "errors": []
  }
}
```

## 🏦 Account Management API

### Get All Accounts
```javascript
// GET /api/accounts
const getAccounts = async (accessToken) => {
  const response = await fetch(`${API_BASE_URL}/accounts`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "accounts": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Main Checking",
      "type": "checking",
      "balance": 2500.00,
      "currency": "USD",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "name": "Savings Account",
      "type": "savings",
      "balance": 10000.00,
      "currency": "USD",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Account
```javascript
// POST /api/accounts
const createAccount = async (accessToken, accountData) => {
  const response = await fetch(`${API_BASE_URL}/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      name: "New Savings",
      type: "savings", // checking, savings, credit, investment, cash
      balance: 1000.00,
      currency: "USD"
    })
  });
  return response.json();
};
```

### Update Account (with Currency Conversion)
```javascript
// PUT /api/accounts/:id
const updateAccount = async (accessToken, accountId, updates) => {
  const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      name: "Updated Account Name",
      currency: "EUR",
      convert_balance: true // Convert balance to new currency
    })
  });
  return response.json();
};
```

## 💰 Transaction Management API

### Get Transactions (Paginated)
```javascript
// GET /api/transactions?page=1&limit=20&account_id=uuid&category_id=uuid&type=expense
const getTransactions = async (accessToken, filters = {}) => {
  const params = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 20,
    ...(filters.account_id && { account_id: filters.account_id }),
    ...(filters.category_id && { category_id: filters.category_id }),
    ...(filters.type && { type: filters.type }),
    ...(filters.start_date && { start_date: filters.start_date }),
    ...(filters.end_date && { end_date: filters.end_date })
  });

  const response = await fetch(`${API_BASE_URL}/transactions?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "account_id": "uuid",
      "category_id": "uuid",
      "amount": 45.67,
      "type": "expense",
      "description": "Grocery shopping",
      "transaction_date": "2024-01-15",
      "created_at": "2024-01-15T10:30:00.000Z",
      "tags": ["food", "essentials"],
      "merchant": "Walmart",
      "category_name": "Food & Dining",
      "category_color": "#FF6B6B",
      "account_name": "Main Checking"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Create Transaction
```javascript
// POST /api/transactions
const createTransaction = async (accessToken, transactionData) => {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      account_id: "uuid",
      category_id: "uuid", // Optional
      amount: 50.00,
      type: "expense", // income, expense, transfer
      description: "Coffee shop",
      transaction_date: "2024-01-20",
      tags: ["coffee", "daily"], // Optional
      merchant: "Starbucks", // Optional
      location: "Downtown" // Optional
    })
  });
  return response.json();
};
```

### Get Calendar View
```javascript
// GET /api/transactions/calendar/2024/01
const getTransactionCalendar = async (accessToken, year, month) => {
  const response = await fetch(`${API_BASE_URL}/transactions/calendar/${year}/${month}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "calendar": {
    "2024-01-15": [
      {
        "id": "uuid",
        "amount": 45.67,
        "type": "expense",
        "description": "Grocery shopping",
        "category_name": "Food & Dining",
        "category_color": "#FF6B6B"
      }
    ],
    "2024-01-20": [
      // More transactions...
    ]
  },
  "summary": {
    "total_income": 3000.00,
    "total_expenses": 1250.50,
    "net_amount": 1749.50,
    "transaction_count": 25
  }
}
```
## 💱 Currency Management API

### Get Supported Currencies
```javascript
// GET /api/currency/supported
const getSupportedCurrencies = async () => {
  const response = await fetch(`${API_BASE_URL}/currency/supported`);
  return response.json();
};

// Response
{
  "currencies": [
    {
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$"
    },
    {
      "code": "EUR",
      "name": "Euro",
      "symbol": "€"
    },
    {
      "code": "INR",
      "name": "Indian Rupee",
      "symbol": "₹"
    }
    // ... more currencies
  ]
}
```

### Get Exchange Rates
```javascript
// GET /api/currency/rates/USD
const getExchangeRates = async (baseCurrency = 'USD') => {
  const response = await fetch(`${API_BASE_URL}/currency/rates/${baseCurrency}`);
  return response.json();
};

// Response
{
  "base": "USD",
  "date": "2024-01-20",
  "rates": {
    "EUR": 0.85,
    "GBP": 0.73,
    "INR": 86.25,
    "JPY": 110.25,
    "CAD": 1.25
    // ... more rates
  }
}
```

### Convert Currency
```javascript
// POST /api/currency/convert
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  const response = await fetch(`${API_BASE_URL}/currency/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amount,
      from: fromCurrency,
      to: toCurrency
    })
  });
  return response.json();
};

// Response
{
  "original_amount": 100,
  "from_currency": "USD",
  "to_currency": "INR",
  "converted_amount": 8625.00,
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## 🏷️ Category Management API

### Get All Categories
```javascript
// GET /api/categories
const getCategories = async (accessToken) => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "categories": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Food & Dining",
      "parent_id": null,
      "color": "#FF6B6B",
      "icon": "utensils",
      "is_default": true,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "subcategories": [
        {
          "id": "uuid",
          "name": "Restaurants",
          "parent_id": "parent_uuid",
          "color": "#FF8E8E",
          "icon": "restaurant"
        }
      ]
    }
  ]
}
```

### Create Category
```javascript
// POST /api/categories
const createCategory = async (accessToken, categoryData) => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      name: "Custom Category",
      color: "#4ECDC4",
      icon: "star",
      parent_id: null // Optional, for subcategories
    })
  });
  return response.json();
};
```

## 📊 Budget Management API

### Get All Budgets
```javascript
// GET /api/budgets
const getBudgets = async (accessToken) => {
  const response = await fetch(`${API_BASE_URL}/budgets`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "budgets": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "category_id": "uuid",
      "amount": 500.00,
      "period": "monthly",
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "alert_threshold": 0.8,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "category_name": "Food & Dining",
      "category_color": "#FF6B6B",
      "spent_amount": 320.50,
      "remaining_amount": 179.50,
      "progress_percentage": 64.1,
      "is_over_budget": false
    }
  ]
}
```

### Create Budget
```javascript
// POST /api/budgets
const createBudget = async (accessToken, budgetData) => {
  const response = await fetch(`${API_BASE_URL}/budgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      category_id: "uuid",
      amount: 600.00,
      period: "monthly", // weekly, monthly, yearly, custom
      start_date: "2024-02-01",
      end_date: "2024-02-29",
      alert_threshold: 0.8 // 80%
    })
  });
  
  const result = await response.json();
  
  // Handle duplicate category prevention
  if (response.status === 409) {
    console.log('Duplicate budget prevented:', result.error);
    console.log('Existing budget ID:', result.existing_budget_id);
  }
  
  return result;
};
```

### Get Budget Analytics
```javascript
// GET /api/budgets/analytics?period=current_month&months=6
const getBudgetAnalytics = async (accessToken, period = 'current_month', months = 6) => {
  const params = new URLSearchParams({
    period: period,
    months: months.toString()
  });

  const response = await fetch(`${API_BASE_URL}/budgets/analytics?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "summary": {
    "total_budgets": 5,
    "active_budgets": 4,
    "total_budget_amount": 2500.00,
    "total_spent_amount": 1800.50,
    "total_remaining_amount": 699.50,
    "avg_alert_threshold": 0.8
  },
  "category_performance": [
    {
      "category_id": "uuid",
      "category_name": "Food & Dining",
      "category_color": "#FF6B6B",
      "budget_count": 1,
      "total_budget_amount": 500.00,
      "total_spent_amount": 320.50,
      "total_remaining_amount": 179.50,
      "percentage_used": 64.1,
      "variance": -179.50,
      "variance_percentage": -35.9,
      "status": "on_track",
      "avg_alert_threshold": 0.8,
      "earliest_start": "2024-01-01T00:00:00.000Z",
      "latest_end": "2024-01-31T00:00:00.000Z"
    }
  ],
  "monthly_trends": [
    {
      "month": "2024-12-01T00:00:00.000Z",
      "budget_count": 4,
      "total_budget_amount": 2000.00,
      "total_spent_amount": 1500.00,
      "total_remaining_amount": 500.00,
      "percentage_used": 75.0,
      "avg_alert_threshold": 0.8
    }
  ],
  "efficiency_metrics": {
    "overall_efficiency": 72.0,
    "budgets_on_track": 3,
    "budgets_at_risk": 1,
    "budgets_over_limit": 0,
    "avg_variance_percentage": -15.2
  },
  "period": "current_month",
  "analysis_date": "2024-12-20T10:30:00.000Z"
}
```

### Get Budget Variance Report
```javascript
// GET /api/budgets/variance-report?start_date=2024-12-01&end_date=2024-12-31&include_inactive=false
const getBudgetVarianceReport = async (accessToken, startDate, endDate, includeInactive = false) => {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    include_inactive: includeInactive.toString()
  });

  const response = await fetch(`${API_BASE_URL}/budgets/variance-report?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "period": {
    "start_date": "2024-12-01",
    "end_date": "2024-12-31",
    "days": 31
  },
  "summary": {
    "total_budgets": 4,
    "total_budget_amount": 2000.00,
    "total_actual_spent": 1800.50,
    "total_variance": -199.50,
    "overall_efficiency": 90.0,
    "variance_distribution": {
      "under_budget": 2,
      "on_budget": 1,
      "over_budget": 1,
      "high_variance": 0,
      "medium_variance": 1,
      "low_variance": 2
    }
  },
  "detailed_analysis": [
    {
      "budget_id": "uuid",
      "category_id": "uuid",
      "category_name": "Food & Dining",
      "category_color": "#FF6B6B",
      "period": "monthly",
      "start_date": "2024-12-01",
      "end_date": "2024-12-31",
      "budget_amount": 500.00,
      "actual_spent": 320.50,
      "variance": -179.50,
      "variance_percentage": -35.9,
```

### Get Budget Variance Report
```javascript
// GET /api/budgets/variance-report?start_date=2024-12-01&end_date=2024-12-31&include_inactive=false
const getBudgetVarianceReport = async (accessToken, startDate, endDate, includeInactive = false) => {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    include_inactive: includeInactive.toString()
  });

  const response = await fetch(`${API_BASE_URL}/budgets/variance-report?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "period": {
    "start_date": "2024-12-01",
    "end_date": "2024-12-31",
    "days": 31
  },
  "summary": {
    "total_budgets": 4,
    "total_budget_amount": 2000.00,
    "total_actual_spent": 1800.50,
    "total_variance": -199.50,
    "overall_efficiency": 90.0,
    "variance_distribution": {
      "under_budget": 2,
      "on_budget": 1,
      "over_budget": 1,
      "high_variance": 0,
      "medium_variance": 1,
      "low_variance": 2
    }
  },
  "detailed_analysis": [
    {
      "budget_id": "uuid",
      "category_id": "uuid",
      "category_name": "Food & Dining",
      "category_color": "#FF6B6B",
      "period": "monthly",
      "start_date": "2024-12-01",
      "end_date": "2024-12-31",
      "budget_amount": 500.00,
      "actual_spent": 320.50,
      "variance": -179.50,
      "variance_percentage": -35.9,
      "efficiency_percentage": 64.1,
      "variance_severity": "medium",
      "alert_threshold": 0.8,
      "is_active": true,
      "transaction_count": 15,
      "avg_transaction_amount": 21.37,
      "min_transaction_amount": 5.00,
      "max_transaction_amount": 85.00
    }
  ],
  "top_over_budgets": [
    {
      "budget_id": "uuid",
      "category_name": "Entertainment",
      "budget_amount": 200.00,
      "actual_spent": 250.00,
      "variance": 50.00,
      "variance_percentage": 25.0
    }
  ],
  "top_under_budgets": [
    {
      "budget_id": "uuid",
      "category_name": "Food & Dining",
      "budget_amount": 500.00,
      "actual_spent": 320.50,
      "variance": -179.50,
      "variance_percentage": -35.9
    }
  ],
  "category_summary": [
    {
      "category_name": "Food & Dining",
      "category_color": "#FF6B6B",
      "budget_count": 1,
      "total_budget_amount": 500.00,
      "total_actual_spent": 320.50,
      "total_variance": -179.50,
      "avg_efficiency": 64.1
    }
  ],
  "report_generated": "2024-12-20T10:30:00.000Z"
}
```

## 🔒 Budget Duplicate Prevention

The budget system now prevents users from creating multiple active budgets for the same category. This ensures data integrity and provides a better user experience.

### Duplicate Prevention Logic

1. **Active Budget Check**: When creating a budget, the system checks if an active budget already exists for the same category
2. **Smart Reactivation**: If an inactive budget exists for the category, it's reactivated instead of creating a new one
3. **Clear Error Messages**: Users receive helpful feedback when duplicate creation is attempted

### Error Response (409 Conflict)
```javascript
{
  "error": "You already have an active budget for this category. Please update the existing budget instead of creating a new one.",
  "existing_budget_id": "uuid"
}
```

### Frontend Handling
```javascript
const handleBudgetCreation = async (budgetData) => {
  try {
    const result = await createBudget(accessToken, budgetData);
    console.log('Budget created successfully:', result);
  } catch (error) {
    if (error.response?.status === 409) {
      // Handle duplicate budget
      const existingBudgetId = error.response.data.existing_budget_id;
      console.log('Duplicate prevented. Existing budget ID:', existingBudgetId);
      
      // Option 1: Show message to user
      showMessage('You already have a budget for this category. Please update the existing one.');
      
      // Option 2: Redirect to existing budget
      navigateToBudget(existingBudgetId);
      
      // Option 3: Pre-fill update form
      loadBudgetForUpdate(existingBudgetId);
    }
  }
};
```

## 📊 Budget Analytics Improvements

The budget analytics system has been enhanced to provide better data aggregation and chart-ready information.

### Key Improvements

1. **Category Aggregation**: Budgets are now aggregated by category instead of individual budget records
2. **Unique Categories**: Each category appears only once in analytics responses
3. **Chart-Ready Data**: Perfect format for frontend charts and visualizations
4. **Comprehensive Metrics**: Enhanced efficiency metrics and variance analysis

### Analytics Data Structure

The `category_performance` array now contains aggregated data:
```javascript
{
  "category_id": "uuid",
  "category_name": "Food & Dining",
  "category_color": "#FF6B6B",
  "budget_count": 1,                    // Number of budgets for this category
  "total_budget_amount": 500.00,        // Combined budget amount
  "total_spent_amount": 320.50,         // Combined spent amount
  "total_remaining_amount": 179.50,     // Combined remaining amount
  "percentage_used": 64.1,              // Overall percentage used
  "variance": -179.50,                  // Overall variance
  "variance_percentage": -35.9,         // Overall variance percentage
  "status": "on_track",                 // Overall status
  "avg_alert_threshold": 0.8,           // Average alert threshold
  "earliest_start": "2024-01-01T00:00:00.000Z",
  "latest_end": "2024-01-31T00:00:00.000Z"
}
```

### Frontend Chart Integration

```javascript
// Example: Creating a pie chart with category performance data
const createBudgetChart = (categoryPerformance) => {
  const chartData = categoryPerformance.map(category => ({
    name: category.category_name,
    value: category.total_spent_amount,
    color: category.category_color,
    percentage: category.percentage_used,
    remaining: category.total_remaining_amount
  }));
  
  return {
    type: 'pie',
    data: chartData,
    options: {
      // Chart configuration
    }
  };
};

// Example: Creating a progress bar chart
const createProgressChart = (categoryPerformance) => {
  return categoryPerformance.map(category => ({
    category: category.category_name,
    spent: category.total_spent_amount,
    budget: category.total_budget_amount,
    percentage: category.percentage_used,
    status: category.status,
    color: category.category_color
  }));
};
```

## 📅 Bill Reminders API

### Get All Bill Reminders
```javascript
// GET /api/bills?include_paid=false&upcoming_only=true
const getBillReminders = async (accessToken, filters = {}) => {
  const params = new URLSearchParams({
    include_paid: filters.include_paid || 'false',
    upcoming_only: filters.upcoming_only || 'false'
  });

  const response = await fetch(`${API_BASE_URL}/bills?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "bills": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Rent Payment",
      "amount": 1200.00,
      "due_date": "2024-02-01",
      "frequency": "monthly",
      "category_id": "uuid",
      "is_paid": false,
      "reminder_days_before": 3,
      "created_at": "2024-01-01T00:00:00.000Z",
      "category_name": "Housing",
      "category_color": "#45B7D1",
      "days_until_due": 5,
      "urgency": "soon"
    }
  ]
}
```

### Create Bill Reminder
```javascript
// POST /api/bills
const createBillReminder = async (accessToken, billData) => {
  const response = await fetch(`${API_BASE_URL}/bills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      title: "Electric Bill",
      amount: 150.00,
      due_date: "2024-02-15",
      frequency: "monthly", // once, weekly, monthly, yearly
      category_id: "uuid", // Optional
      reminder_days_before: 5
    })
  });
  return response.json();
};
```

### Mark Bill as Paid
```javascript
// POST /api/bills/:id/mark-paid
const markBillPaid = async (accessToken, billId, accountId) => {
  const response = await fetch(`${API_BASE_URL}/bills/${billId}/mark-paid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      account_id: accountId, // Optional: creates transaction
      create_transaction: true
    })
  });
  return response.json();
};
```

## 📈 Analytics API

### Get Spending Trends
```javascript
// GET /api/analytics/spending-trends?months=6
const getSpendingTrends = async (accessToken, months = 6) => {
  const response = await fetch(`${API_BASE_URL}/analytics/spending-trends?months=${months}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "trends": [
    {
      "month": "2024-01",
      "total_income": 5000.00,
      "total_expenses": 3200.50,
      "net_amount": 1799.50,
      "transaction_count": 45,
      "top_categories": [
        {
          "category_name": "Food & Dining",
          "amount": 650.00,
          "percentage": 20.3
        }
      ]
    }
  ],
  "summary": {
    "average_monthly_income": 4800.00,
    "average_monthly_expenses": 3100.00,
    "trend_direction": "increasing", // increasing, decreasing, stable
    "savings_rate": 35.4
  }
}
```

### Get Category Breakdown
```javascript
// GET /api/analytics/category-breakdown?start_date=2024-01-01&end_date=2024-01-31
const getCategoryBreakdown = async (accessToken, startDate, endDate) => {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate
  });

  const response = await fetch(`${API_BASE_URL}/analytics/category-breakdown?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "breakdown": [
    {
      "category_id": "uuid",
      "category_name": "Food & Dining",
      "category_color": "#FF6B6B",
      "total_amount": 650.00,
      "transaction_count": 15,
      "percentage": 20.3,
      "average_per_transaction": 43.33,
      "subcategories": [
        {
          "name": "Restaurants",
          "amount": 400.00,
          "percentage": 61.5
        }
      ]
    }
  ],
  "total_expenses": 3200.50,
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "days": 31
  }
}
```

## 📄 File Upload API (Statement Import)

### Upload Statement File
```javascript
// POST /api/statements/upload
const uploadStatement = async (accessToken, file) => {
  const formData = new FormData();
  formData.append('statement', file);

  const response = await fetch(`${API_BASE_URL}/statements/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: formData
  });
  return response.json();
};

// Response
{
  "success": true,
  "upload_id": "uuid",
  "filename": "statement.csv",
  "file_type": "csv",
  "status": "processing",
  "message": "File uploaded successfully and processing started"
}
```

### Check Processing Status
```javascript
// GET /api/statements/upload/:id/status
const checkUploadStatus = async (accessToken, uploadId) => {
  const response = await fetch(`${API_BASE_URL}/statements/upload/${uploadId}/status`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "upload_id": "uuid",
  "status": "completed", // processing, completed, failed
  "progress": 100,
  "transactions_found": 25,
  "transactions_processed": 25,
  "errors": []
}
```

## 📊 Data Export API

### Export Transactions (Excel, CSV, PDF)
```javascript
// GET /api/transactions/export?format=excel&start_date=2024-01-01&end_date=2024-01-31
const exportTransactions = async (accessToken, format = 'excel', filters = {}) => {
  const params = new URLSearchParams({
    format: format, // excel, csv, pdf
    ...(filters.start_date && { start_date: filters.start_date }),
    ...(filters.end_date && { end_date: filters.end_date }),
    ...(filters.account_id && { account_id: filters.account_id }),
    ...(filters.category_id && { category_id: filters.category_id }),
    ...(filters.type && { type: filters.type })
  });

  const response = await fetch(`${API_BASE_URL}/transactions/export?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  // For file downloads, handle the blob response
  if (format === 'pdf' || format === 'excel' || format === 'csv') {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `transactions_${new Date().toISOString().split('T')[0]}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    // Fallback to correct extension if header parsing fails
    if (!filename.includes('.')) {
      const extensions = {
        'excel': 'xlsx',
        'csv': 'csv',
        'pdf': 'pdf'
      };
      const extension = extensions[format] || format;
      filename = `${filename}.${extension}`;
    }
    
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  return response;
};

// Response Headers for File Downloads
// Excel: Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
// Excel: Content-Disposition: attachment; filename="transactions_2024-01-20.xlsx"
// CSV: Content-Type: text/csv
// CSV: Content-Disposition: attachment; filename="transactions_2024-01-20.csv"
// PDF: Content-Type: application/pdf
// PDF: Content-Disposition: attachment; filename="transactions_2024-01-20.pdf"

// Excel Export Features:
// ✅ Proper .xlsx extension
// ✅ Formatted headers with styling
// ✅ Auto-sized columns
// ✅ Numbers stored as numeric types (not text)
// ✅ Proper date formatting (mm/dd/yyyy)
// ✅ Conditional formatting for amounts (red for expenses, green for income)
// ✅ Currency formatting with dollar signs
// ✅ Alternating row colors for readability
// ✅ Professional borders and styling
// ✅ Multiple sheets (Transactions, Summary, Charts)
```

## 📋 PDF Reports API (Premium Feature)

### Get Available PDF Report Types
```javascript
// GET /api/reports/types
const getAvailableReportTypes = async (accessToken) => {
  const response = await fetch(`${API_BASE_URL}/reports/types`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "report_types": [
    {
      "id": "comprehensive",
      "name": "Comprehensive Financial Report",
      "description": "Complete financial overview with all three report templates",
      "includes": ["transaction_statement", "monthly_report", "portfolio_summary"]
    },
    {
      "id": "transaction_statement",
      "name": "Transaction Statement (Bank-Style)",
      "description": "Detailed transaction list with running balance and summary",
      "includes": ["transactions", "running_balance", "summary"]
    },
    {
      "id": "monthly_report",
      "name": "Monthly Financial Report (Executive Summary)",
      "description": "Monthly overview with trends, top categories, and budget performance",
      "includes": ["overview", "trends", "top_categories", "budget_performance", "upcoming_bills"]
    },
    {
      "id": "portfolio_summary",
      "name": "Account Portfolio Summary",
      "description": "Account overview with net worth, asset allocation, and trends",
      "includes": ["account_overview", "net_worth", "asset_allocation", "currency_breakdown", "trends"]
    }
  ]
}
```

### Export PDF Reports
```javascript
// GET /api/reports/export?type=comprehensive&start_date=2024-01-01&end_date=2024-01-31
const exportPDFReport = async (accessToken, reportType = 'comprehensive', filters = {}) => {
  const params = new URLSearchParams({
    type: reportType, // comprehensive, transaction_statement, monthly_report, portfolio_summary
    ...(filters.start_date && { start_date: filters.start_date }),
    ...(filters.end_date && { end_date: filters.end_date }),
    ...(filters.account_id && { account_id: filters.account_id })
  });

  const response = await fetch(`${API_BASE_URL}/reports/export?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  // Handle PDF blob response
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `financial_report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  return response;
};

// Response Headers
// Content-Type: application/pdf
// Content-Disposition: attachment; filename="financial_report_comprehensive_2024-01-20.pdf"
```

### PDF Report Templates Overview

#### 1. Transaction Statement (Bank-Style)
- **Header**: Company logo, period, account information
- **Transaction Table**: Date, description, category, amount, running balance
- **Summary**: Total income, expenses, net change, opening/closing balance
- **Features**: Professional bank-style formatting with running balance calculation

#### 2. Monthly Financial Report (Executive Summary)
- **Overview Section**: Income, expenses, savings with trend indicators
- **Top Spending Categories**: Top 5 categories with amounts and percentages
- **Budget Performance**: Budget vs actual with status icons
- **Upcoming Bills**: Due dates and amounts
- **Features**: Executive summary format with visual indicators

#### 3. Account Portfolio Summary
- **Account Overview**: Account details with balances and changes
- **Net Worth**: Total net worth with change indicators
- **Asset Allocation**: Breakdown by account type
- **Currency Breakdown**: Multi-currency portfolio overview
- **Net Worth Trend**: 6-month trend with growth rate
- **Features**: Portfolio management style with trend analysis

## 🔧 System Health API

### Health Check
```javascript
// GET /health
const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
  return response.json();
};

// Response
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

## ⚠️ Error Handling

### Standard Error Response Format
```javascript
// Error Response Structure
{
  "error": "Validation failed",
  "details": [
    "First name is required",
    "Email must be valid"
  ],
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Common HTTP Status Codes
```javascript
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();

    switch (response.status) {
      case 400:
        throw new Error(`Bad Request: ${error.error}`);
      case 401:
        // Token expired or invalid
        throw new Error('Authentication required');
      case 403:
        throw new Error('Access forbidden');
      case 404:
        throw new Error('Resource not found');
      case 409:
        throw new Error(`Conflict: ${error.error}`);
      case 429:
        throw new Error('Rate limit exceeded');
      case 500:
        throw new Error('Server error');
      default:
        throw new Error(`HTTP ${response.status}: ${error.error}`);
    }
  }

  return response.json();
};
```

## 🔄 Pagination Helper

### Pagination Utility
```javascript
const PaginationHelper = {
  // Build pagination params
  buildParams: (page = 1, limit = 20, filters = {}) => {
    return new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
  },

  // Parse pagination response
  parsePagination: (response) => {
    return {
      data: response.transactions || response.accounts || response.data,
      pagination: response.pagination,
      hasNextPage: response.pagination.page < response.pagination.pages,
      hasPrevPage: response.pagination.page > 1
    };
  }
};

// Usage example
const getTransactionsPage = async (accessToken, page = 1, filters = {}) => {
  const params = PaginationHelper.buildParams(page, 20, filters);
  const response = await fetch(`${API_BASE_URL}/transactions?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const data = await handleApiResponse(response);
  return PaginationHelper.parsePagination(data);
};
```

## 🚀 Frontend Integration Examples

### React/React Native API Service
```javascript
// apiService.js
class FinanceApiService {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
    this.accessToken = null;
    this.refreshToken = null;
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && this.refreshToken) {
        // Try to refresh token
        await this.refreshAccessToken();
        // Retry original request
        config.headers['Authorization'] = `Bearer ${this.accessToken}`;
        return fetch(url, config);
      }

      return handleApiResponse(response);
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async refreshAccessToken() {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: this.refreshToken })
    });

    const data = await response.json();
    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  // Authentication methods
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // User methods
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(updates) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async changeCurrency(newCurrency, convertData = true) {
    return this.request('/user/change-currency', {
      method: 'POST',
      body: JSON.stringify({
        new_currency: newCurrency,
        convert_existing_data: convertData
      })
    });
  }

  // Account methods
  async getAccounts() {
    return this.request('/accounts');
  }

  async createAccount(accountData) {
    return this.request('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData)
    });
  }

  // Transaction methods
  async getTransactions(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/transactions?${params}`);
  }

  async createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  // Export methods
  async exportTransactions(format = 'excel', filters = {}) {
    const params = new URLSearchParams({
      format: format,
      ...filters
    });
    
    // For file downloads, use blob response type
    const responseType = format === 'excel' || format === 'pdf' || format === 'csv' ? 'blob' : 'json';
    
    return this.request(`/transactions/export?${params}`, {
      headers: {}, // Remove Content-Type for file downloads
      responseType: responseType
    });
  }

  // PDF Reports methods (Premium)
  async getAvailableReportTypes() {
    return this.request('/reports/types');
  }

  async exportPDFReport(reportType = 'comprehensive', filters = {}) {
    const params = new URLSearchParams({
      type: reportType,
      ...filters
    });
    return this.request(`/reports/export?${params}`, {
      headers: {} // Remove Content-Type for file downloads
    });
  }

  // Currency methods
  async getSupportedCurrencies() {
    return this.request('/currency/supported');
  }

  async getExchangeRates(baseCurrency) {
    return this.request(`/currency/rates/${baseCurrency}`);
  }

  async convertCurrency(amount, from, to) {
    return this.request('/currency/convert', {
      method: 'POST',
      body: JSON.stringify({ amount, from, to })
    });
  }
}

// Export singleton instance
export const apiService = new FinanceApiService();
```

### React Hook for API Integration
```javascript
// useFinanceApi.js
import { useState, useEffect } from 'react';
import { apiService } from './apiService';

export const useFinanceApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = async (requestFn) => {
    setLoading(true);
    setError(null);

    try {
      const result = await requestFn();
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { loading, error, makeRequest };
};

// Usage in component
const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const { loading, error, makeRequest } = useFinanceApi();

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await makeRequest(() => apiService.getTransactions());
        setTransactions(data.transactions);
      } catch (err) {
        console.error('Failed to load transactions:', err);
      }
    };

    loadTransactions();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {transactions.map(transaction => (
        <div key={transaction.id}>
          {transaction.description}: {transaction.amount}
        </div>
      ))}
    </div>
  );
};
```

### React Native AsyncStorage Integration
```javascript
// authStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthStorage = {
  async saveTokens(accessToken, refreshToken) {
    try {
      await AsyncStorage.multiSet([
        ['access_token', accessToken],
        ['refresh_token', refreshToken]
      ]);
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  },

  async getTokens() {
    try {
      const tokens = await AsyncStorage.multiGet(['access_token', 'refresh_token']);
      return {
        accessToken: tokens[0][1],
        refreshToken: tokens[1][1]
      };
    } catch (error) {
      console.error('Failed to get tokens:', error);
      return { accessToken: null, refreshToken: null };
    }
  },

  async clearTokens() {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
};
```

## 🎯 Quick Start Checklist for Frontend Developers

### 1. Setup API Service
- [ ] Copy the `FinanceApiService` class
- [ ] Configure base URL for your environment
- [ ] Implement token storage (localStorage/AsyncStorage)

### 2. Authentication Flow
- [ ] Implement login/register forms
- [ ] Store tokens securely after successful auth
- [ ] Handle token refresh automatically
- [ ] Implement logout functionality

### 3. Core Features to Implement
- [ ] User profile management with currency selection
- [ ] Account list and creation
- [ ] Transaction list with pagination
- [ ] Category management
- [ ] Budget tracking
- [ ] Bill reminders
- [ ] Data export (CSV, Excel, PDF)
- [ ] PDF reports (Premium feature)

### 4. Advanced Features
- [ ] Currency conversion with real-time rates
- [ ] File upload for statement import
- [ ] Analytics dashboard
- [ ] Push notifications

### 5. Error Handling
- [ ] Implement global error handler
- [ ] Show user-friendly error messages
- [ ] Handle network connectivity issues
- [ ] Implement retry mechanisms

---

## 📞 Support & Documentation

- **API Base URL**: `http://localhost:3000/api`
- **Test User**: `test@example.com` / `testpassword123`
- **Postman Collection**: Available in `API_TESTING_GUIDE.md`
- **Database Seeding**: Run `npm run db:seed` for test data

**Happy Coding! 🚀**
AWS_S3_BUCKET=finance-manager-uploads

# Application Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Logging
LOG_LEVEL=info
```

### Rate Limits
- **General API**: 100 requests per 15 minutes per IP
- **File Uploads**: 20 uploads per hour per IP
- **AI Endpoints**: 50 requests per hour per IP
- **Recommendation Generation**: 10 requests per hour per IP

### Special Headers
```javascript
// For file uploads
{
  "Content-Type": "multipart/form-data"
}

// For all other requests
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

## 🧪 Sample API Responses

### User Profile Response
```javascript
{
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "subscription_tier": "premium",
    "subscription_expires_at": "2024-12-31T23:59:59.000Z",
    "created_at": "2024-01-01T00:00:00.000Z",
    "stats": {
      "account_count": 3,
      "transaction_count": 150,
      "custom_category_count": 2,
      "active_goal_count": 2
    }
  }
}
```

### Account List Response
```javascript
{
  "accounts": [
    {
      "id": "uuid",
      "name": "Main Checking",
      "type": "checking",
      "balance": 2500.00,
      "currency": "USD",
      "transaction_count": 45,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Transaction List Response
```javascript
{
  "transactions": [
    {
      "id": "uuid",
      "account_id": "uuid",
      "category_id": "uuid",
      "amount": 45.67,
      "type": "expense",
      "description": "Grocery shopping",
      "transaction_date": "2024-01-15",
      "category_name": "Food & Dining",
      "account_name": "Main Checking",
      "account_currency": "USD",
      "merchant": "Supermarket",
      "tags": ["groceries", "food"],
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Account Update with Currency Conversion
```javascript
// PUT /api/accounts/:id
{
  "name": "Updated Account Name",
  "currency": "EUR",
  "convert_balance": true  // Optional: convert existing balance to new currency
}

// Response:
{
  "message": "Account updated successfully",
  "account": {
    "id": "uuid",
    "name": "Updated Account Name",
    "type": "checking",
    "balance": 85.23,  // Converted from $100 USD to €85.23 EUR
    "currency": "EUR",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-20T10:30:00.000Z"
  },
  "conversion_applied": true,
  "original_balance": 100.00,
  "original_currency": "USD"
}
```

### Dashboard Insights Response
```javascript
{
  "overview": {
    "monthly_income": 50000.00,
    "monthly_expenses": 35000.00,
    "monthly_savings": 15000.00,
    "savings_rate": 30.0,
    "active_recommendations": 3,
    "active_goals": 2,
    "active_budgets": 5
  },
  "spending_trend": {
    "last_7_days": 8500.00,
    "previous_7_days": 7200.00,
    "change_percentage": 18.1,
    "trend_direction": "increasing"
  },
  "top_categories": [
    {
      "name": "Food & Dining",
      "amount": 12000.00,
      "transaction_count": 25
    }
  ],
  "upcoming_bills": [
    {
      "title": "Electric Bill",
      "amount": 1200.00,
      "due_date": "2024-01-25",
      "days_until_due": 3
    }
  ]
}
```

### Goal List Response
```javascript
{
  "goals": [
    {
      "id": "uuid",
      "title": "Emergency Fund",
      "target_amount": 500000.00,
      "current_amount": 125000.00,
      "progress_percentage": 25.0,
      "target_date": "2024-12-31",
      "days_remaining": 320,
      "monthly_savings_needed": 11719.00,
      "status": "active",
      "category": "emergency",
      "priority": "high",
      "priority_display": "high"
    }
  ]
}
```

### Recommendations Response
```javascript
{
  "recommendations": [
    {
      "id": "uuid",
      "type": "goal_focused",
      "title": "Reduce dining out for Emergency Fund",
      "description": "You spent ₹8,500 on dining out this month. Reducing by 30% could free up ₹2,550 for your Emergency Fund.",
      "action_text": "Reduce dining out by 30%",
      "potential_savings": 2550.00,
      "confidence_score": 0.85,
      "priority": 4,
      "created_at": "2024-01-20T08:00:00.000Z"
    }
  ]
}
```

### Currency Summary Response
```javascript
{
  "currency_summary": [
    {
      "currency": "USD",
      "account_count": 2,
      "total_balance": 7500.00,
      "avg_balance": 3750.00
    },
    {
      "currency": "EUR",
      "account_count": 1,
      "total_balance": 1800.00,
      "avg_balance": 1800.00
    }
  ]
}
```

### Currency API Examples

**Get Supported Currencies:**
```bash
curl -X GET http://localhost:3000/api/currency/supported
```

**Response:**
```javascript
{
  "currencies": [
    {
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$"
    },
    {
      "code": "EUR",
      "name": "Euro",
      "symbol": "€"
    },
    {
      "code": "GBP",
      "name": "British Pound",
      "symbol": "£"
    }
    // ... more currencies
  ]
}
```

**Get Exchange Rates:**
```bash
curl -X GET http://localhost:3000/api/currency/rates/USD
```

**Response:**
```javascript
{
  "base": "USD",
  "date": "2024-01-20",
  "rates": {
    "EUR": 0.85,
    "GBP": 0.73,
    "JPY": 110.25,
    "CAD": 1.25
    // ... more rates
  }
}
```

**Convert Currency:**
```bash
curl -X POST http://localhost:3000/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "USD", "to": "EUR"}'
```

**Response:**
```javascript
{
  "original_amount": 100,
  "from_currency": "USD",
  "to_currency": "EUR",
  "converted_amount": 85.23,
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## 🎯 Test Data Overview

### Seeded Data (run `npm run db:seed`)
- **Test User**: `test@example.com` with premium subscription
- **Accounts**: 3 accounts (Checking: ₹25,000, Savings: ₹1,00,000, Credit: -₹12,000)
- **Categories**: 8 default categories (Food & Dining, Transportation, etc.)
- **Transactions**: 3 sample transactions across different categories
- **Budget**: 1 sample budget for Food & Dining (₹5,000/month)
- **Goals**: 2 sample goals (Emergency Fund: ₹5,00,000, New Car: ₹8,00,000)

### Test Scenarios
1. **Free Tier Limits**: Create 4+ accounts to test limit (3 max for free)
2. **Premium Features**: Test AI goal setting, advanced analytics
3. **File Upload**: Test with sample CSV files (limited to 1/month for free)
4. **Recommendations**: Generate and interact with AI recommendations

## 🚀 Quick Setup Instructions

### Start Backend Server
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Start development server
npm run dev
```

### Reset Test Data
```bash
# Re-run seed script to reset data
npm run db:seed
```

### Test API Connection
```bash
# Health check
curl http://localhost:3000/health

# Login test user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword123"}'
```

## 💳 Subscription Tiers

### Free Tier Limitations
```javascript
{
  "accounts": 3,           // Maximum accounts
  "custom_categories": 3,  // Maximum custom categories  
  "monthly_uploads": 1,    // Statement uploads per month
  "active_goals": 2,       // Maximum active goals
  "monthly_exports": -1,   // Export functionality per month (TEMPORARILY UNLIMITED)
  "features": [
    "basic_transactions",
    "simple_budgets", 
    "basic_reports",
    "basic_statement_import",
    "manual_goals",
    "csv_export"
  ]
}
```

### Premium Tier Benefits
```javascript
{
  "accounts": -1,          // Unlimited
  "custom_categories": -1, // Unlimited
  "monthly_uploads": -1,   // Unlimited
  "active_goals": -1,      // Unlimited
  "monthly_exports": -1,   // Unlimited
  "features": [
    "unlimited_accounts",
    "unlimited_categories",
    "unlimited_statement_imports",
    "unlimited_goals",
    "unlimited_exports",
    "ai_goal_setting",
    "advanced_analytics",
    "predictive_alerts",
    "account_sharing",
    "excel_export",
    "pdf_export",
    "professional_pdf_reports",
    "priority_support",
    "advanced_ai_categorization"
  ]
}
```

### Testing Both Tiers
- **Default**: Test user is seeded as Premium
- **Test Free Tier**: Manually update user subscription in database or create new user
- **Upgrade Flow**: Use `/api/user/upgrade-premium` endpoint (mock implementation)

## 🔒 Security Notes

### Token Management
- **Access Token**: Expires in 15 minutes
- **Refresh Token**: Expires in 7 days
- **Storage**: Store securely in device keychain/secure storage

### Authentication Flow
```javascript
// 1. Login
POST /api/auth/login
// Returns: { access_token, refresh_token }

// 2. Use access_token for API calls
Authorization: Bearer ACCESS_TOKEN

// 3. When access_token expires, refresh
POST /api/auth/refresh
Body: { refresh_token: REFRESH_TOKEN }
// Returns: { access_token }

// 4. Logout (invalidates refresh_token)
POST /api/auth/logout
Body: { refresh_token: REFRESH_TOKEN }
```

### CORS Settings
- **Development**: `http://localhost:3000` (configurable via `FRONTEND_URL`)
- **Production**: Configure `FRONTEND_URL` environment variable

### File Upload Security
- **Max Size**: 10MB per file
- **Allowed Types**: CSV, PDF, OFX, QFX only
- **Validation**: File type and content validation
- **Storage**: Encrypted in AWS S3

### Error Handling
```javascript
// Standard error response format
{
  "error": "Error message",
  "details": ["Validation error details"], // Optional
  "code": "ERROR_CODE" // Optional
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions/subscription)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## 📱 Mobile App Integration Tips

### State Management
- Store user profile and subscription status globally
- Cache frequently accessed data (accounts, categories)
- Implement offline support for viewing data

### Real-time Updates
- Refresh data after mutations (create/update/delete)
- Implement pull-to-refresh on list screens
- Show loading states during API calls

### Error Handling
- Handle token expiration gracefully
- Show user-friendly error messages
- Implement retry logic for failed requests

### Performance
- Implement pagination for large lists
- Use lazy loading for images and heavy content
- Cache API responses appropriately

### Testing
- Test with both free and premium user scenarios
- Test offline behavior
- Test file upload functionality
- Verify subscription limit enforcement

---

**Ready to integrate!** This backend provides a complete financial management system with AI-powered features, comprehensive analytics, and a robust subscription model. All endpoints are documented in the `API_TESTING_GUIDE.md` for detailed testing instructions.

### Export Functionality
- `GET /api/transactions/export` - Export transactions (Excel, CSV, PDF)
- `GET /api/reports/types` - Get available PDF report types
- `GET /api/reports/export` - Export professional PDF reports

### Reward Ads System (New)
- `GET /api/user/export-eligibility` - Check export eligibility with ad options
- `POST /api/user/reward-ad-completed` - Process reward ad completion
- `GET /api/user/usage` - Get comprehensive usage statistics (updated)

## 🎬 Reward Ads System

### Overview
The reward ads system allows free tier users to unlock premium features by watching short advertisements. This system is designed to provide value to users while encouraging premium upgrades.

### Supported Features
- **Export Functionality**: Unlock exports by watching ads
- **File Uploads**: Unlock additional uploads by watching ads  
- **Goal Creation**: Unlock additional goals by watching ads

### Daily Limits
- **Global Daily Limit**: 10 ads per day across all features
- **Per-Feature Limit**: 3 ads per day per feature type
- **Reset Time**: Daily at midnight (local timezone)

### API Endpoints

#### Check Export Eligibility
```javascript
// GET /api/user/export-eligibility
const checkExportEligibility = async (accessToken) => {
  const response = await fetch(`${API_BASE_URL}/user/export-eligibility`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response Examples
{
  "can_export": false,
  "reason": "over_limit_ad_available",
  "options": [
    {
      "type": "watch_ad",
      "title": "Watch Ad for Free Export",
      "description": "Watch a short ad to unlock 1 export (3 remaining today)",
      "reward": "export_unlock"
    },
    {
      "type": "upgrade",
      "title": "Upgrade to Premium",
      "description": "Get unlimited exports + all premium features",
      "price": "$9.99/month"
    }
  ]
}
```



#### Get Usage Statistics (Updated)
```javascript
// GET /api/user/usage
const getUsageStats = async (accessToken) => {
  const response = await fetch(`${API_BASE_URL}/user/usage`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

// Response
{
  "subscription_tier": "free",
  "monthly_usage": {
    "export": { "currentUsage": 0, "limit": 0, "unlimited": false },
    "upload": { "currentUsage": 1, "limit": 1, "unlimited": false },
    "ai_categorization": { "currentUsage": 5, "limit": 10, "unlimited": false }
  },
  "daily_usage": {
    "export": {
      "free_used": 0,
      "ad_used": 1,
      "total_used": 1,
      "ad_limit": 3,
      "ad_remaining": 2
    },
    "upload": {
      "free_used": 1,
      "ad_used": 0,
      "total_used": 1,
      "ad_limit": 3,
      "ad_remaining": 3
    },
    "goal": {
      "free_used": 0,
      "ad_used": 0,
      "total_used": 0,
      "ad_limit": 3,
      "ad_remaining": 3
    }
  }
}
```

### Frontend Integration Flow

#### 1. Check Eligibility Before Export
```javascript
// Before attempting export, check eligibility
const eligibility = await checkExportEligibility(accessToken);

if (eligibility.can_export) {
  // Proceed with normal export
  await exportTransactions(accessToken, 'excel');
} else {
  // Show options to user
  showExportOptions(eligibility.options);
}
```



#### 3. Show Export Options Modal
```javascript
function showExportOptions(options) {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="export-options-modal">
      <h3>Export Limit Reached</h3>
      <p>You've reached your free export limit. Choose an option:</p>
      ${options.map(option => `
        <div class="option ${option.type}">
          <h4>${option.title}</h4>
          <p>${option.description}</p>
          <button onclick="handleOption('${option.type}')">
            ${option.type === 'watch_ad' ? 'Watch Ad' : 'Upgrade'}
          </button>
        </div>
      `).join('')}
    </div>
  `;
  
  document.body.appendChild(modal);
}

function handleOption(optionType) {
  if (optionType === 'watch_ad') {
    handleWatchAd();
  } else if (optionType === 'upgrade') {
    window.location.href = '/upgrade-premium';
  }
}
```

### Error Handling

#### Ad Limit Reached
```javascript
// 429 Too Many Requests
{
  "error": "Daily ad limit reached"
}
```

#### Invalid Unlock Token
```javascript
// 401 Unauthorized
{
  "error": "Invalid unlock token"
}
```

#### Export Limit Exceeded
```javascript
// 403 Forbidden
{
  "error": "Export limit exceeded",
  "code": "EXPORT_LIMIT_EXCEEDED",
  "options": [
    {
      "type": "upgrade",
      "title": "Upgrade to Premium",
      "description": "Get unlimited exports + all premium features",
      "price": "$9.99/month"
    }
  ]
}
```

### Security Features

#### Token Security
- **Short Expiration**: Unlock tokens expire in 10 minutes
- **Single Use**: Each token can only be used once
- **User Binding**: Tokens are bound to specific user and feature
- **JWT Signing**: Tokens are signed with server secret

#### Anti-Abuse Measures
- **Daily Limits**: Strict daily limits per user and feature
- **IP Tracking**: Ad transactions include IP address for fraud detection
- **Device Info**: Store device information for suspicious activity detection
- **Rate Limiting**: Prevent rapid ad completion requests

#### Database Constraints
- **Unique Constraints**: Prevent duplicate ad transactions
- **Foreign Keys**: Ensure data integrity
- **Check Constraints**: Validate feature types and limits

### Testing

#### Run Test Suite
```bash
# Test reward ads functionality
node scripts/test-reward-ads.js
```

#### Manual Testing
```bash
# Check export eligibility
curl -X GET "http://localhost:3000/api/user/export-eligibility" \
  -H "Authorization: Bearer YOUR_TOKEN"


```

### Configuration

#### Environment Variables
```bash
# JWT Secret for unlock tokens
JWT_SECRET=your-super-secret-jwt-key

#### Database Tables
```sql
-- Daily usage limits
CREATE TABLE user_daily_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    exports_used INTEGER DEFAULT 0,
    uploads_used INTEGER DEFAULT 0,
    goals_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);
```

### Migration Notes

#### Breaking Changes
- **Export Limits**: Free tier exports now require ads or premium upgrade
- **API Response**: Export endpoints now return options when limit exceeded
- **Usage Tracking**: Daily usage tracking added alongside monthly tracking

#### Backward Compatibility
- **Premium Users**: No changes to premium user experience
- **Existing Exports**: Previously exported files remain accessible
- **API Structure**: Core API structure remains the same

#### Database Migration
The new tables will be created automatically when the application starts. No manual migration required.

### Performance Considerations

#### Database Optimization
- **Indexes**: Optimized indexes on user_id, date, and feature_type
- **Partitioning**: Consider partitioning user_daily_limits by date for large scale
- **Cleanup**: Implement cleanup job for expired ad transactions

#### Caching Strategy
- **Eligibility Cache**: Cache export eligibility for 5 minutes
- **Usage Stats Cache**: Cache usage statistics for 1 minute
- **Redis Integration**: Use Redis for distributed caching

#### Monitoring
- **Ad Completion Rate**: Track successful ad completions
- **Conversion Rate**: Monitor ad-to-premium conversion
- **Error Rates**: Monitor failed ad processing attempts