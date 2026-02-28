# Notifications Guide

This guide explains how to use the comprehensive notification system in your React Native finance app.

## 🚀 Quick Start

### 1. What's Already Set Up

✅ **expo-notifications** is already installed  
✅ **Notification service** is implemented  
✅ **Redux integration** for notification state management  
✅ **Notification screens** are created and integrated  
✅ **Navigation** is set up  

### 2. Test Notifications Right Now

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Navigate to More → Notifications** to access the notification center

3. **Test notifications:**
   - Tap "Test Notification" to send an immediate notification
   - Tap "Schedule Reminder" to schedule a reminder for tomorrow
   - Use the notification settings to test different types

## 📱 Features

### Notification Types

1. **Transaction Notifications**
   - New transaction alerts
   - Large transaction alerts
   - Spending pattern alerts

2. **Budget Notifications**
   - Budget limit warnings
   - Budget exceeded alerts
   - Weekly budget reviews

3. **Goal Notifications**
   - Goal milestones
   - Goal completion celebrations
   - Savings milestones

4. **Reminder Notifications**
   - Bill due reminders
   - Weekly finance reviews
   - Monthly summaries

5. **System Notifications**
   - Low balance alerts
   - App updates
   - System maintenance

### Notification Channels

- **Default Channel**: General notifications
- **High Priority**: Important alerts (budget exceeded, large transactions)
- **Reminders**: Scheduled reminders and bill notifications

## 🔧 Configuration

### 1. Update Expo Project ID

In `src/services/notificationService.ts`, replace the placeholder:

```typescript
token = (await Notifications.getExpoPushTokenAsync({
  projectId: 'your-expo-project-id', // ← Replace with your actual Expo project ID
})).data;
```

### 2. Android Configuration

The Android manifest already includes necessary permissions:

```xml
<uses-permission android:name="android.permission.VIBRATE"/>
```

### 3. iOS Configuration

For iOS, add to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

## 💻 Usage Examples

### 1. Send Immediate Notifications

```typescript
import { NotificationUtils } from '../utils/notificationUtils';

// Send a transaction notification
await NotificationUtils.sendTransactionNotification(45.67, 'Dining', 'Starbucks');

// Send a budget alert
await NotificationUtils.sendBudgetAlert('Dining', 450, 500, 90);

// Send a goal milestone
await NotificationUtils.sendGoalMilestone('Vacation Fund', '25% milestone', 2500, 10000);
```

### 2. Schedule Reminders

```typescript
// Schedule a bill reminder
const dueDate = new Date('2024-02-15');
await NotificationUtils.scheduleBillReminder('Electricity Bill', 89.50, dueDate, 3);

// Schedule weekly budget review
await NotificationUtils.scheduleBudgetReviewReminder(1, 9, 0); // Monday at 9 AM

// Schedule monthly summary
await NotificationUtils.scheduleMonthlySummaryReminder(1, 10, 0); // 1st of month at 10 AM
```

### 3. Advanced Notifications

```typescript
// Send spending pattern alert
await NotificationUtils.sendSpendingPatternAlert('Dining', 150, 'increase');

// Send low balance alert
await NotificationUtils.sendLowBalanceAlert('Checking Account', 250, 500);

// Send large transaction alert
await NotificationUtils.sendLargeTransactionAlert(250, 'Electronics', 'Best Buy', 100);
```

### 4. Custom Notifications

```typescript
import { NotificationTrigger } from '../utils/notificationUtils';

const customNotification: NotificationTrigger = {
  type: 'system',
  title: 'Custom Alert',
  body: 'This is a custom notification',
  data: { customField: 'value' },
  immediate: true
};

await NotificationUtils.sendCustomNotification(customNotification);
```

## 🎯 Integration Points

### 1. Transaction Creation

Add to your transaction creation flow:

```typescript
// After successfully creating a transaction
if (amount > 100) {
  await NotificationUtils.sendLargeTransactionAlert(amount, category, merchant);
}

await NotificationUtils.sendTransactionNotification(amount, category, merchant);
```

### 2. Budget Monitoring

Add to your budget checking logic:

```typescript
// Check budget limits
if (currentSpending >= budgetAmount * 0.9) {
  await NotificationUtils.sendBudgetAlert(category, currentSpending, budgetAmount, 90);
}

if (currentSpending > budgetAmount) {
  await NotificationUtils.sendBudgetExceededAlert(category, currentSpending, budgetAmount);
}
```

### 3. Goal Tracking

Add to your goal progress tracking:

```typescript
// Check goal milestones
if (currentAmount >= targetAmount * 0.25 && !milestone25Reached) {
  await NotificationUtils.sendGoalMilestone(goalName, '25% milestone', currentAmount, targetAmount);
  setMilestone25Reached(true);
}

if (currentAmount >= targetAmount) {
  await NotificationUtils.sendGoalCompleted(goalName, targetAmount);
}
```

## 🔔 Notification Center Features

### 1. View All Notifications
- Scroll through all notifications
- See unread count badge
- Pull to refresh

### 2. Mark as Read
- Tap any notification to mark as read
- Unread notifications have a blue dot indicator

### 3. Test Notifications
- Test button for each notification type
- Immediate feedback

### 4. Scheduled Notifications
- View all scheduled notifications
- Horizontal scrollable list

## ⚙️ Settings Management

### 1. Permission Management
- Check notification permissions
- Request permissions if not granted
- Visual status indicators

### 2. Preference Toggles
- Enable/disable notification types
- Individual test buttons for each type
- Visual feedback for disabled state

### 3. Advanced Settings
- Schedule weekly reminders
- Clear all scheduled notifications
- Bulk management options

## 🚨 Troubleshooting

### Common Issues

1. **Notifications not showing**
   - Check device notification settings
   - Verify app permissions
   - Ensure device is not in Do Not Disturb mode

2. **Scheduled notifications not working**
   - Check if app is backgrounded
   - Verify notification permissions
   - Check device battery optimization settings

3. **Push notifications not working**
   - Verify Expo project ID
   - Check internet connection
   - Ensure device is registered with Expo

### Debug Commands

```typescript
// Check notification permissions
const { status } = await Notifications.getPermissionsAsync();
console.log('Permission status:', status);

// Get scheduled notifications
const scheduled = await NotificationUtils.getScheduledNotifications();
console.log('Scheduled notifications:', scheduled);

// Get push token
const token = notificationService.getPushToken();
console.log('Push token:', token);
```

## 📊 Analytics Integration

### Track Notification Engagement

```typescript
// Track notification opens
const trackNotificationOpen = (notificationData) => {
  // Send to your analytics service
  analytics.track('notification_opened', {
    type: notificationData.type,
    title: notificationData.title,
    timestamp: new Date().toISOString()
  });
};
```

### A/B Testing Notifications

```typescript
// Test different notification messages
const testNotificationVariants = async () => {
  const variants = [
    'You spent $45.67 at Starbucks',
    'New transaction: $45.67 at Starbucks',
    'Starbucks charge: $45.67'
  ];
  
  const randomVariant = variants[Math.floor(Math.random() * variants.length)];
  await NotificationUtils.sendCustomNotification({
    type: 'transaction',
    title: 'New Transaction',
    body: randomVariant,
    immediate: true
  });
};
```

## 🔮 Future Enhancements

### Planned Features

1. **Smart Notifications**
   - AI-powered spending insights
   - Predictive budget alerts
   - Personalized recommendations

2. **Rich Notifications**
   - Action buttons (Mark as read, View details)
   - Rich media (charts, progress bars)
   - Deep linking to specific screens

3. **Notification Scheduling**
   - Custom reminder times
   - Smart scheduling based on user behavior
   - Timezone-aware notifications

4. **Notification Analytics**
   - Engagement tracking
   - A/B testing framework
   - Performance metrics

## 📞 Support

If you encounter issues with notifications:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Test with the built-in test functions
4. Verify device settings and permissions

For development builds, ensure you're using a physical device as notifications don't work in simulators.

---

**Happy Notifying! 🎉**
