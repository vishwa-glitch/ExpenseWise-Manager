# 📋 Backend Configuration for Mobile App Integration

## 🔗 API Base URL

### Development Environment
```
Base URL: http://localhost:3000
API Prefix: /api
Full API Base: http://localhost:3000/api
```

### Production Environment
```
Base URL: [TO BE DEPLOYED]
API Prefix: /api
Full API Base: [TO BE DEPLOYED]/api
```

### Required Headers
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_ACCESS_TOKEN" // For protected routes
}
```

## 👤 Sample User Credentials

### Free Tier User
```javascript
{
  "email": "test@example.com",
  "password": "testpassword123",
  "subscription_tier": "premium", // Note: Seeded as premium for testing
  "features": ["basic_transactions", "simple_budgets", "basic_reports"]
}
```

### Premium User (Same as above - for testing purposes)
```javascript
{
  "email": "test@example.com", 
  "password": "testpassword123",
  "subscription_tier": "premium",
  "features": ["unlimited_accounts", "ai_categorization", "advanced_analytics", "account_sharing"]
}
```

**Note**: Run `npm run db:seed` to create this test user with sample data.

## 📡 Complete API Endpoints List

### 🔐 Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### 👤 User Management
- `GET /api/user/profile` - Get user profile and stats
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/subscription-status` - Get subscription details and limits
- `POST /api/user/upgrade-premium` - Upgrade to premium (mock)
- `POST /api/user/cancel-premium` - Cancel premium subscription

### 🏦 Account Management
- `GET /api/accounts` - List all user accounts
- `GET /api/accounts/:id` - Get specific account details
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/:id` - Update account (supports currency conversion)
- `DELETE /api/accounts/:id` - Delete/deactivate account
- `GET /api/accounts/:id/balance-history?days=30` - Get balance history
- `GET /api/accounts/:id/summary?period=month` - Get account summary
- `GET /api/accounts/currency-summary` - Get account totals grouped by currency

### 💰 Transaction Management
- `GET /api/transactions?page=1&limit=20` - List transactions (paginated)
- `GET /api/transactions/calendar/:year/:month` - Calendar view
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/bulk-import` - Bulk import transactions
- `GET /api/transactions/export?format=excel` - Export transactions

### 💱 Currency Management
- `GET /api/currency/supported` - Get list of supported currencies
- `GET /api/currency/rates/:baseCurrency` - Get exchange rates for base currency
- `POST /api/currency/convert` - Convert amount between currencies

### 🏷️ Category Management
- `GET /api/categories` - List all categories
- `GET /api/categories/hierarchy` - Get category hierarchy
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### 📊 Budget Management
- `GET /api/budgets` - List all budgets with progress
- `GET /api/budgets/:id` - Get budget details
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### 📅 Bill Reminders
- `GET /api/bills` - List all bill reminders
- `GET /api/bills/upcoming?days=30` - Get upcoming bills
- `POST /api/bills` - Create bill reminder
- `PUT /api/bills/:id` - Update bill reminder
- `POST /api/bills/:id/mark-paid` - Mark bill as paid
- `DELETE /api/bills/:id` - Delete bill reminder

### 🎯 Goals (NEW)
- `GET /api/goals` - List all goals
- `GET /api/goals/:id` - Get goal details with progress
- `POST /api/goals` - Create manual goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/contribute` - Add contribution to goal
- `GET /api/goals/:id/progress` - Get detailed progress analytics

### 🤖 AI Goals (Premium)
- `POST /api/goals/ai/start-session` - Start AI goal session
- `POST /api/goals/ai/chat` - Continue AI conversation
- `GET /api/goals/ai/session/:sessionId` - Get session status
- `POST /api/goals/ai/finalize` - Create goal from AI session
- `DELETE /api/goals/ai/session/:sessionId` - Cancel AI session

### 💡 Recommendations (NEW)
- `GET /api/recommendations` - Get active recommendations
- `GET /api/recommendations/history` - Get recommendation history
- `POST /api/recommendations/:id/dismiss` - Dismiss recommendation
- `POST /api/recommendations/:id/act` - Mark as acted upon
- `POST /api/recommendations/:id/feedback` - Provide feedback
- `GET /api/recommendations/generate` - Force generate new recommendations

### 🔔 Notifications (NEW)
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread` - Get unread notifications
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/:id/click` - Track click
- `POST /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update preferences

### 📈 Analytics
- `GET /api/analytics/spending-trends?months=6` - Monthly spending trends
- `GET /api/analytics/category-breakdown?start_date=2024-01-01&end_date=2024-12-31` - Category analysis
- `GET /api/analytics/predictive-alerts` - AI-powered alerts (Premium)

### 🌟 Premium Features
- `GET /api/premium/account-shares` - List account shares
- `POST /api/premium/account-shares` - Share account
- `PUT /api/premium/account-shares/:id` - Update share permissions
- `DELETE /api/premium/account-shares/:id` - Remove share
- `GET /api/premium/analytics-dashboard` - Advanced analytics

### 📄 Statement Import
- `GET /api/statements/formats` - Supported file formats
- `POST /api/statements/upload` - Upload statement file
- `GET /api/statements/upload/:id/status` - Check processing status
- `GET /api/statements/upload/:id/preview` - Preview transactions
- `POST /api/statements/upload/:id/import` - Import transactions
- `GET /api/statements/history` - Upload history

### 📊 Insights (NEW)
- `GET /api/insights/dashboard` - Real-time dashboard insights
- `GET /api/insights/weekly-report` - Weekly financial report
- `GET /api/insights/monthly-report` - Monthly analysis (Premium)

### 🔧 System
- `GET /health` - Health check

## 🔑 API Keys & Configuration

### Environment Variables Required
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance-db
DB_USER=postgres
DB_PASSWORD=your_password

# Redis Configuration (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Configuration - CRITICAL FOR AUTHENTICATION
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-different-from-jwt-secret

# API Keys
EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
COHERE_API_KEY=your-cohere-api-key

# AWS Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
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
  "custom_categories": 5,  // Maximum custom categories  
  "monthly_uploads": 1,    // Statement uploads per month
  "active_goals": 1,       // Maximum active goals
  "features": [
    "basic_transactions",
    "simple_budgets", 
    "basic_reports",
    "basic_statement_import",
    "manual_goals"
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
  "features": [
    "unlimited_accounts",
    "unlimited_categories",
    "unlimited_statement_imports",
    "unlimited_goals",
    "ai_goal_setting",
    "advanced_analytics",
    "predictive_alerts",
    "account_sharing",
    "excel_export",
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