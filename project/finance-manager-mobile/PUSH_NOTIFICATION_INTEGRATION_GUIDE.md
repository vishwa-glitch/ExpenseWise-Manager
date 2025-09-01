# 🚀 Push Notification Integration Guide

## ✅ **What's Been Implemented**

Your backend now has a **complete push notification system** with the following features:

### **1. Database Schema**
- ✅ Push token storage in users table
- ✅ Push notification logs table
- ✅ Scheduled notifications table
- ✅ Enhanced notification preferences
- ✅ Automatic cleanup functions

### **2. Push Notification Service**
- ✅ Expo push notification integration
- ✅ Token validation and management
- ✅ Retry logic with exponential backoff
- ✅ Bulk notification sending
- ✅ Scheduled notifications
- ✅ Comprehensive logging and analytics

### **3. API Endpoints**
- ✅ Token registration/unregistration
- ✅ Notification preferences management
- ✅ Test notification sending
- ✅ Statistics and logs
- ✅ Scheduled notification management

### **4. Scheduled Workers**
- ✅ Weekly spending summaries
- ✅ Monthly financial reports
- ✅ Bill reminders
- ✅ Budget alerts
- ✅ Automatic cleanup

## 🔧 **Setup Instructions**

### **1. Install Dependencies**
```bash
npm install expo-server-sdk node-cron
```

### **2. Run Database Migrations**
```bash
# Run the push notification migration
psql -d your_database -f database_migrations/push_notifications.sql
```

### **3. Environment Variables**
Add these to your `.env` file:
```env
# Push Notifications
ENABLE_PUSH_NOTIFICATIONS=true
EXPO_ACCESS_TOKEN=your_expo_access_token_here

# Optional: Customize notification settings
PUSH_NOTIFICATION_MAX_RETRIES=3
PUSH_NOTIFICATION_RETRY_DELAY=1000
```

### **4. Start the System**
```bash
npm start
```

The scheduled notification worker will automatically start and begin processing notifications.

## 📱 **Mobile App Integration**

### **1. Register Push Token**
When your mobile app starts, register the push token:

```javascript
// React Native with Expo
import * as Notifications from 'expo-notifications';

const registerPushToken = async (userId, accessToken) => {
  try {
    // Get push token
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      throw new Error('Failed to get push token for push notification!');
    }
    
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Register with backend
    const response = await fetch('http://localhost:3000/api/push-notifications/register-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        push_token: token,
        device_type: Platform.OS === 'ios' ? 'ios' : 'android'
      })
    });
    
    const result = await response.json();
    console.log('Push token registered:', result);
    
  } catch (error) {
    console.error('Error registering push token:', error);
  }
};
```

### **2. Handle Push Notifications**
```javascript
// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Listen for notifications
useEffect(() => {
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
    // Handle notification data
    const data = notification.request.content.data;
    
    // Navigate to specific screen based on data
    if (data.screen) {
      navigation.navigate(data.screen, data);
    }
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response:', response);
    // Handle notification tap
    const data = response.notification.request.content.data;
    
    if (data.screen) {
      navigation.navigate(data.screen, data);
    }
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}, []);
```

## 🔗 **API Integration Examples**

### **1. Transaction Creation with Push Notification**
```javascript
// After creating a transaction, send push notification
const createTransaction = async (transactionData) => {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(transactionData)
  });
  
  const result = await response.json();
  
  // Send push notification for transaction alert
  if (result.transaction) {
    await fetch('/api/push-notifications/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: 'New Transaction',
        body: `You spent ₹${transactionData.amount} on ${transactionData.description}`,
        data: {
          type: 'transaction',
          transaction_id: result.transaction.id,
          amount: transactionData.amount,
          screen: 'Transactions'
        }
      })
    });
  }
  
  return result;
};
```

### **2. Budget Alert Integration**
```javascript
// Check budget status and send alerts
const checkBudgetStatus = async (budgetId) => {
  const response = await fetch(`/api/budgets/${budgetId}/status`);
  const status = await response.json();
  
  if (status.percentage_used >= 80) {
    await fetch('/api/push-notifications/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: `Budget Alert: ${status.category_name}`,
        body: `You've used ${status.percentage_used}% of your budget. ₹${status.remaining} remaining.`,
        data: {
          type: 'budget_alert',
          budget_id: budgetId,
          percentage_used: status.percentage_used,
          screen: 'Budgets'
        }
      })
    });
  }
};
```

### **3. Goal Milestone Notification**
```javascript
// Send notification when goal milestone is reached
const checkGoalMilestones = async (goalId) => {
  const response = await fetch(`/api/goals/${goalId}/progress`);
  const progress = await response.json();
  
  if (progress.percentage >= 25 && progress.percentage < 50) {
    await fetch('/api/push-notifications/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: `Goal Milestone: ${progress.goal_name}`,
        body: `Congratulations! You've reached ${progress.percentage}% of your goal.`,
        data: {
          type: 'goal_milestone',
          goal_id: goalId,
          percentage: progress.percentage,
          screen: 'Goals'
        }
      })
    });
  }
};
```

## 📊 **Testing the System**

### **1. Test Push Notification**
```bash
curl -X POST http://localhost:3000/api/push-notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test push notification from your finance app!",
    "data": {
      "type": "test",
      "screen": "Dashboard"
    }
  }'
```

### **2. Check Push Notification Stats**
```bash
curl -X GET http://localhost:3000/api/push-notifications/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **3. View Push Notification Logs**
```bash
curl -X GET http://localhost:3000/api/push-notifications/logs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🎯 **Scheduled Notifications**

The system automatically sends these notifications:

### **Weekly Spending Summary**
- **When**: Every Sunday at 9 PM
- **Content**: Total spending, income, and net for the week
- **Screen**: Dashboard

### **Monthly Financial Report**
- **When**: First day of month at 10 AM
- **Content**: Monthly spending, income, and category breakdown
- **Screen**: Reports

### **Bill Reminders**
- **When**: Daily at 9 AM
- **Content**: Bills due in next 3 days
- **Screen**: Bills

### **Budget Alerts**
- **When**: Every 6 hours
- **Content**: Budgets approaching or exceeding limits
- **Screen**: Budgets

## 🔧 **Customization Options**

### **1. Notification Preferences**
Users can customize:
- Transaction alerts
- Budget alerts
- Goal milestones
- Bill reminders
- Weekly summaries
- Monthly reports
- System updates
- Promotional notifications

### **2. Quiet Hours**
Set quiet hours to avoid notifications during specific times:
```javascript
await fetch('/api/notifications/preferences', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00'
  })
});
```

### **3. Frequency Control**
Control notification frequency:
- `immediate`: Send immediately
- `daily`: Batch daily
- `weekly`: Batch weekly
- `smart`: AI-powered timing

## 🚨 **Error Handling**

The system includes comprehensive error handling:

- **Invalid tokens**: Automatically marked and disabled
- **Retry logic**: Exponential backoff for failed sends
- **Rate limiting**: Prevents spam notifications
- **Logging**: Complete audit trail of all notifications
- **Cleanup**: Automatic cleanup of old logs

## 📈 **Analytics & Monitoring**

### **Push Notification Statistics**
- Total notifications sent
- Success/failure rates
- Invalid token tracking
- User engagement metrics

### **Performance Monitoring**
- Delivery times
- Error rates
- Token validity rates
- System health metrics

## 🎉 **Ready to Use!**

Your push notification system is now fully implemented and ready for production use. The system will:

1. ✅ **Automatically send notifications** for important events
2. ✅ **Handle token management** and cleanup
3. ✅ **Provide comprehensive analytics** and monitoring
4. ✅ **Support user preferences** and customization
5. ✅ **Scale efficiently** with bulk sending capabilities

Start by registering push tokens from your mobile app and test with the provided endpoints. The scheduled workers will automatically begin sending notifications based on user activity and preferences!
