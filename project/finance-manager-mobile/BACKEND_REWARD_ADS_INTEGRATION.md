# 🎬 Backend Reward Ads Integration

## Overview

The frontend has been updated to integrate with the backend's comprehensive reward ads system. This replaces the previous client-side export limit tracking with a robust server-side system that provides:

- **Backend-driven eligibility checks**
- **Daily ad-based usage limits** 
- **Secure unlock tokens for exports**
- **Real-time usage statistics**
- **Multiple export options (watch ad, upgrade)**

## 🔄 Key Changes Made

### 1. API Configuration Updates (`src/config/api.ts`)

#### New Endpoints Added:
```typescript
// User Management
USER: {
  // ... existing endpoints
  EXPORT_ELIGIBILITY: "/user/export-eligibility",
  REWARD_AD_COMPLETED: "/user/reward-ad-completed", 
  USAGE: "/user/usage",
},

// Transaction Export (Updated)
TRANSACTIONS: {
  EXPORT: (format, startDate?, endDate?, unlockToken?) => {
    // Now supports unlock_token parameter
  }
}
```

### 2. API Service Updates (`src/services/api.ts`)

#### New Methods Added:
```typescript
// Check export eligibility with reward ads options
async checkExportEligibility()

// Process reward ad completion
async processRewardAd(featureType: 'export' | 'upload' | 'goal', adData: any)

// Get user usage statistics
async getUserUsage()

// Export transactions (Updated to support unlock tokens)
async exportTransactions(format, startDate?, endDate?, unlockToken?)
```

### 3. Hook Rewrite (`src/hooks/useExportLimits.ts`)

#### **Removed**: Client-side tracking
- ❌ Local storage for export limits
- ❌ Monthly reset logic
- ❌ Client-side ad watched tracking

#### **Added**: Backend integration
- ✅ Real-time eligibility checks
- ✅ Backend usage statistics
- ✅ Secure unlock token management
- ✅ Automatic state refresh

#### Key Features:
```typescript
interface ExportEligibility {
  can_export: boolean;
  reason?: string;
  options?: Array<{
    type: 'watch_ad' | 'upgrade';
    title: string;
    description: string;
    reward?: string;
    price?: string;
  }>;
}

interface UsageStats {
  subscription_tier: string;
  daily_usage: {
    export: {
      free_used: number;
      ad_used: number;
      total_used: number;
      ad_limit: number;
      ad_remaining: number;
    };
  };
}
```

### 4. Export Screen Updates (`src/screens/export/ExportScreen.tsx`)

#### **Updated**: Export flow
- ✅ Uses backend eligibility checks
- ✅ Supports unlock tokens for exports
- ✅ Shows backend-provided options
- ✅ Automatic state refresh after export

#### **New Flow**:
1. Check eligibility from backend
2. If limit reached, show options modal
3. If ad watched, get unlock token
4. Use unlock token for export
5. Refresh stats after export

### 5. Modal Updates (`src/components/common/AdPromptModal.tsx`)

#### **Enhanced**: Options display
- ✅ Shows backend-provided options
- ✅ Dynamic content based on eligibility
- ✅ Fallback to default content if no options

## 🔄 Integration Flow

### 1. Export Eligibility Check
```typescript
// Before export, check eligibility
const eligibility = await apiService.checkExportEligibility();

if (eligibility.can_export) {
  // Proceed with normal export
  await exportTransactions(format, startDate, endDate);
} else {
  // Show options modal with backend-provided options
  showExportOptions(eligibility.options);
}
```

### 2. Ad Watching Flow
```typescript
async function handleWatchAd() {
  try {
    // Show ad (AdMob integration)
    const adSuccess = await adMobService.showRewardedAd();
    
    if (adSuccess) {
      // Process ad completion with backend
      const rewardResult = await apiService.processRewardAd('export', {
        adUnitId: 'test_ad_unit_id',
        rewardAmount: 1
      });
      
      if (rewardResult.success && rewardResult.unlock_token) {
        // Store unlock token for export
        setCurrentUnlockToken(rewardResult.unlock_token);
        
        // Refresh eligibility and usage stats
        await loadEligibility();
        await loadUsageStats();
        
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error showing rewarded ad:', error);
    return false;
  }
}
```

### 3. Export with Unlock Token
```typescript
async function performExport(unlockToken?: string) {
  const exportData = await apiService.exportTransactions(
    format,
    startDate,
    endDate,
    unlockToken // Pass unlock token if available
  );
  
  // Handle file download
  await saveAndShareBlob(exportData, fileName, options);
  
  // Reset unlock token and refresh stats
  await recordExport();
}
```

## 🎯 Backend API Endpoints Used

### 1. Check Export Eligibility
```http
GET /api/user/export-eligibility
Authorization: Bearer {access_token}
```

**Response:**
```json
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

### 2. Process Reward Ad Completion
```http
POST /api/user/reward-ad-completed
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "feature_type": "export",
  "ad_network": "admob",
  "ad_unit_id": "test_ad_unit_id",
  "reward_amount": 1,
  "reward_type": "export_unlock"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ad reward granted successfully",
  "unlock_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 600,
  "feature_unlocked": "export",
  "ad_transaction_id": "uuid-here"
}
```

### 3. Export with Unlock Token
```http
GET /api/transactions/export?format=excel&unlock_token={token}
Authorization: Bearer {access_token}
```

### 4. Get Usage Statistics
```http
GET /api/user/usage
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "subscription_tier": "free",
  "daily_usage": {
    "export": {
      "free_used": 0,
      "ad_used": 1,
      "total_used": 1,
      "ad_limit": 3,
      "ad_remaining": 2
    }
  }
}
```

## 🔒 Security Features

### Unlock Token Security
- **Short Expiration**: Tokens expire in 10 minutes
- **Single Use**: Each token can only be used once
- **User Binding**: Tokens are bound to specific user and feature
- **JWT Signing**: Tokens are signed with server secret

### Anti-Abuse Measures
- **Daily Limits**: 3 ads per day per feature type
- **Global Limits**: 10 ads per day across all features
- **IP Tracking**: Ad transactions include IP address
- **Device Info**: Store device information for fraud detection

## 🧪 Testing

### Test Scenarios
1. **Free User Export Limit**:
   - Try to export multiple times
   - Verify ad prompt appears
   - Test ad watching flow
   - Verify unlock token usage

2. **Premium User**:
   - Verify unlimited exports
   - No ad prompts should appear

3. **Daily Limits**:
   - Watch multiple ads
   - Verify daily limit enforcement
   - Check usage statistics

### Manual Testing Commands
```bash
# Check export eligibility
curl -X GET "http://localhost:3000/api/user/export-eligibility" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Process reward ad
curl -X POST "http://localhost:3000/api/user/reward-ad-completed" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"feature_type": "export", "ad_network": "admob"}'

# Export with unlock token
curl -X GET "http://localhost:3000/api/transactions/export?format=excel&unlock_token=TOKEN" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚀 Benefits

### For Users
- **Transparent Limits**: Clear daily usage tracking
- **Multiple Options**: Watch ad or upgrade to premium
- **Secure System**: Backend-validated unlock tokens
- **Real-time Updates**: Instant eligibility checks

### For Developers
- **Backend Control**: Server-side limit enforcement
- **Scalable**: Handles multiple features (export, upload, goals)
- **Secure**: JWT-based unlock tokens
- **Analytics**: Comprehensive usage tracking

### For Business
- **Monetization**: Ad revenue from free users
- **Conversion**: Clear upgrade path to premium
- **Analytics**: Detailed usage and conversion metrics
- **Fraud Prevention**: Anti-abuse measures

## 🔧 Configuration

### Environment Variables
```bash
# Backend JWT Secret (for unlock tokens)
JWT_SECRET=your-super-secret-jwt-key

# AdMob Configuration
ADMOB_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy
ADMOB_REWARDED_AD_UNIT_ID=ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz
```

### Database Tables (Backend)
```sql
-- Reward ad transactions
CREATE TABLE reward_ad_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature_type VARCHAR(50) NOT NULL CHECK (feature_type IN ('export', 'upload', 'goal')),
    ad_network VARCHAR(20) DEFAULT 'admob',
    reward_granted BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    watched_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    ip_address INET,
    device_info JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Daily usage limits
CREATE TABLE user_daily_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    exports_used INTEGER DEFAULT 0,
    exports_from_ads INTEGER DEFAULT 0,
    uploads_used INTEGER DEFAULT 0,
    uploads_from_ads INTEGER DEFAULT 0,
    goals_used INTEGER DEFAULT 0,
    goals_from_ads INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);
```

## 📊 Monitoring

### Key Metrics
- **Ad Completion Rate**: Successful ad watches
- **Conversion Rate**: Ad viewers to premium upgrades
- **Usage Patterns**: Daily/weekly usage trends
- **Error Rates**: Failed ad processing attempts

### Dashboard Metrics
- **Daily Active Users**: Users engaging with reward ads
- **Revenue per User**: Ad revenue + premium conversions
- **Feature Usage**: Export vs upload vs goal unlocks
- **Geographic Distribution**: Usage by region

---

## ✅ Integration Complete

The frontend is now fully integrated with the backend's reward ads system. The implementation provides:

1. **Seamless User Experience**: Clear options and instant feedback
2. **Secure Backend Integration**: Server-side validation and token management
3. **Comprehensive Analytics**: Detailed usage tracking and metrics
4. **Scalable Architecture**: Support for multiple features and future expansion

The system is ready for production use with proper AdMob configuration and backend deployment.
