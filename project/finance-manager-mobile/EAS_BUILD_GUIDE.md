# EAS Build Guide for Elastic Beanstalk Backend

## Overview
This guide will help you build your React Native/Expo app using EAS Build and test it with your Elastic Beanstalk backend.

## Prerequisites
- EAS CLI installed: `npm install -g @expo/eas-cli`
- Logged into EAS: `eas login`
- Your Elastic Beanstalk URL configured in `src/config/environment.ts`

## Current Configuration
Your app is configured to use:
- **Development**: `http://192.168.11.131:3000` (local backend)
- **Production**: `http://finance-app-env.eba-8rzsstea.us-east-1.elasticbeanstalk.com` (Elastic Beanstalk)

## Build Commands

### 1. Development Build (for testing with local backend)
```bash
# Build development version for Android
eas build -p android --profile development

# Build development version for iOS
eas build -p ios --profile development

# Build for both platforms
eas build --platform all --profile development
```

### 2. Preview Build (for testing with Elastic Beanstalk backend)
```bash
# Build preview version for Android (APK)
eas build -p android --profile preview

# Build preview version for iOS
eas build -p ios --profile preview

# Build for both platforms
eas build --platform all --profile preview
```

### 3. Production Build (for release with Elastic Beanstalk backend)
```bash
# Build production version for Android
eas build -p android --profile production

# Build production version for iOS
eas build -p ios --profile production

# Build for both platforms
eas build --platform all --profile production
```

## Testing Your Elastic Beanstalk Backend

### Step 1: Verify Backend Connectivity
Before building, test your backend endpoints:

```bash
# Test health endpoint
curl http://finance-app-env.eba-8rzsstea.us-east-1.elasticbeanstalk.com/api/health

# Test authentication endpoint (should return 401 for missing credentials)
curl http://finance-app-env.eba-8rzsstea.us-east-1.elasticbeanstalk.com/api/auth/login
```

### Step 2: Build and Test
1. **Build a preview version**:
   ```bash
   eas build -p android --profile preview
   ```

2. **Download and install the APK** on your device

3. **Test the app**:
   - Try logging in with existing credentials
   - Test all major features (transactions, accounts, budgets, etc.)
   - Check if data is being fetched from your Elastic Beanstalk backend

## Environment Detection

Your app automatically detects the environment:
- **Development builds**: Use local backend (`http://192.168.11.131:3000`)
- **Preview/Production builds**: Use Elastic Beanstalk backend

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   ```bash
   # Check build status
   eas build:list
   
   # View build logs
   eas build:view [BUILD_ID]
   ```

2. **App Can't Connect to Backend**:
   - Verify your Elastic Beanstalk environment is healthy
   - Check if the URL is accessible from your device
   - Ensure CORS is configured on your backend

3. **Authentication Issues**:
   - Verify your backend authentication endpoints work
   - Check if tokens are being stored correctly
   - Test with Postman or curl first

### Debug Steps:

1. **Check Environment Configuration**:
   ```typescript
   // Add this to your app to debug
   import { ENV } from './src/config/environment';
   console.log('Current environment:', ENV);
   ```

2. **Test API Endpoints**:
   ```bash
   # Test with curl
   curl -X POST http://finance-app-env.eba-8rzsstea.us-east-1.elasticbeanstalk.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

3. **Check Network Requests**:
   - Use React Native Debugger or Flipper
   - Monitor network requests in your app
   - Check if requests are going to the correct URL

## Build Profiles Explained

### Development Profile
- Uses local backend
- Includes development tools
- Debug build
- Internal distribution

### Preview Profile
- Uses Elastic Beanstalk backend
- APK format for Android (easier to install)
- Internal distribution
- Good for testing

### Production Profile
- Uses Elastic Beanstalk backend
- Optimized for release
- AAB format for Android (Play Store)
- Production distribution

## Next Steps

1. **Test with Preview Build**:
   ```bash
   eas build -p android --profile preview
   ```

2. **Verify All Features Work**:
   - Authentication
   - Transactions
   - Accounts
   - Budgets
   - Goals
   - Analytics

3. **Monitor Performance**:
   - Check response times
   - Monitor error rates
   - Verify data consistency

4. **Prepare for Release**:
   ```bash
   eas build -p android --profile production
   eas build -p ios --profile production
   ```

## Security Notes

1. **HTTPS**: Consider upgrading your Elastic Beanstalk environment to use HTTPS
2. **Environment Variables**: Use EAS secrets for sensitive configuration
3. **API Keys**: Never hardcode sensitive information

## Support

If you encounter issues:
1. Check EAS build logs: `eas build:view [BUILD_ID]`
2. Verify Elastic Beanstalk environment health
3. Test backend endpoints directly
4. Check app logs for network errors
