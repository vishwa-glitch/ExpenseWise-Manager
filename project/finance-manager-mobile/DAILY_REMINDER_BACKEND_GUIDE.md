# 🎯 Daily Expense Reminder Backend Implementation

## 📋 **What You Need to Implement**

### **1. Database Schema**
```sql
-- Add to your users table
ALTER TABLE users ADD COLUMN daily_reminder_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN daily_reminder_time TIME DEFAULT '09:00:00';
ALTER TABLE users ADD COLUMN daily_reminder_timezone VARCHAR(50) DEFAULT 'UTC';

-- Create daily reminder logs table
CREATE TABLE daily_reminder_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    sent_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent',
    has_logged_expenses BOOLEAN DEFAULT false
);
```

### **2. API Endpoints**

**A. Register Push Token**
```javascript
POST /api/push-notifications/register-token
{
  "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "device_type": "mobile"
}
```

**B. Update Daily Reminder Preferences**
```javascript
PUT /api/notifications/preferences
{
  "daily_expense_reminder": true,
  "reminder_time": "09:00",
  "timezone": "America/New_York"
}
```

**C. Check Today's Transactions**
```javascript
GET /api/transactions/today?date=2024-01-15
Response: {
  "transactions": [
    {
      "id": 1,
      "amount": 25.50,
      "description": "Coffee",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### **3. Daily Reminder Cron Job**

```javascript
// Run daily at 9 AM (or user's preferred time)
cron.schedule('0 9 * * *', async () => {
  try {
    // Get all users with daily reminders enabled
    const users = await db.query(`
      SELECT u.id, u.push_token, u.daily_reminder_time, u.daily_reminder_timezone
      FROM users u
      WHERE u.daily_reminder_enabled = true 
      AND u.push_token IS NOT NULL
    `);

    for (const user of users.rows) {
      // Check if user has logged expenses today
      const today = new Date().toISOString().split('T')[0];
      const hasLogged = await checkUserHasLoggedToday(user.id, today);

      // Send appropriate notification
      const title = hasLogged ? 'Great Job! 🎉' : 'Log Today\'s Expenses';
      const body = hasLogged 
        ? 'You\'ve already logged your expenses today. Keep up the good work!'
        : 'Take a moment to log your expenses for today and stay on track with your budget! 💰';

      await sendPushNotification(user.push_token, title, body, {
        type: 'daily_reminder',
        has_logged_today: hasLogged,
        screen: 'Transactions'
      });

      // Log the reminder
      await db.query(`
        INSERT INTO daily_reminder_logs (user_id, has_logged_expenses)
        VALUES ($1, $2)
      `, [user.id, hasLogged]);
    }
  } catch (error) {
    console.error('Error sending daily reminders:', error);
  }
});

async function checkUserHasLoggedToday(userId, date) {
  const result = await db.query(`
    SELECT COUNT(*) as count
    FROM transactions
    WHERE user_id = $1 
    AND DATE(created_at) = $2
  `, [userId, date]);
  
  return result.rows[0].count > 0;
}
```

### **4. Push Notification Service**

```javascript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushNotification(pushToken, title, body, data = {}) {
  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
    priority: 'normal'
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    
    console.log('✅ Push notification sent:', title);
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
}
```

## 🚀 **Implementation Steps**

1. **Add the database schema** to your existing database
2. **Create the API endpoints** for token registration and preferences
3. **Implement the daily reminder cron job** that runs at 9 AM
4. **Add the push notification service** using Expo's server SDK
5. **Test the system** with your mobile app

## 📱 **Mobile App Integration**

The mobile app will:
- ✅ Register push tokens with your backend
- ✅ Allow users to enable/disable daily reminders
- ✅ Let users set their preferred reminder time
- ✅ Show today's logging status
- ✅ Send test reminders

## 🎯 **User Experience**

Users will receive:
- **One gentle reminder per day** at their chosen time (default: 9 AM)
- **Smart messaging** - different messages if they've already logged expenses
- **Easy on/off toggle** in the app settings
- **Customizable reminder time**
- **Notifications even when app is closed**

## 🔧 **Environment Variables**

Add to your `.env`:
```env
ENABLE_DAILY_REMINDERS=true
EXPO_ACCESS_TOKEN=your_expo_access_token
```

## 📊 **Testing**

Test the system by:
1. Enabling daily reminders in the mobile app
2. Setting a reminder time for a few minutes from now
3. Waiting for the notification
4. Checking the backend logs

This gives you a simple, non-intrusive notification system that encourages users to log their expenses daily! 🎉
