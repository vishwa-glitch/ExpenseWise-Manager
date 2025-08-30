# Elastic Beanstalk Backend Setup Guide

## Overview
This guide will help you configure your React Native/Expo app to use your Elastic Beanstalk backend instead of the local development server.

## Prerequisites
- Your backend is successfully deployed on AWS Elastic Beanstalk
- You have the Elastic Beanstalk environment URL
- Your backend API is accessible and working

## Step 1: Get Your Elastic Beanstalk URL

1. Go to your AWS Elastic Beanstalk console
2. Select your environment
3. Copy the environment URL (it should look like):
   - `https://your-app-name.region.elasticbeanstalk.com`
   - or your custom domain if configured

## Step 2: Update Environment Configuration

1. Open `src/config/environment.ts`
2. Replace the production URL with your actual Elastic Beanstalk URL:

```typescript
production: {
  API_BASE_URL: "https://YOUR_ACTUAL_ELASTIC_BEANSTALK_URL.com", // Replace this
  API_PREFIX: "/api",
  API_TIMEOUT: 15000,
  ENVIRONMENT: 'production',
  ENABLE_LOGGING: false,
  ENABLE_ANALYTICS: true,
},
```

## Step 3: Test Your Configuration

### For Development (Local Backend):
```bash
# Your app will automatically use the development configuration
npx expo start
```

### For Production (Elastic Beanstalk Backend):
```bash
# Build for production to test with Elastic Beanstalk
eas build -p android
# or
eas build -p ios
# or for both platforms
eas build --platform all
```

## Step 4: Environment Variables (Optional)

If you want to use environment variables instead of hardcoding URLs:

1. Install expo-constants if not already installed:
```bash
npx expo install expo-constants
```

2. Update `app.json` to include environment variables:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      },
      "apiUrl": {
        "development": "http://192.168.11.131:3000",
        "production": "https://your-elastic-beanstalk-url.com"
      }
    }
  }
}
```

3. Update `src/config/environment.ts` to use Constants:
```typescript
import Constants from 'expo-constants';

const getCurrentEnvironment = (): string => {
  if (__DEV__) {
    return 'development';
  }
  
  const env = Constants.expoConfig?.extra?.environment;
  if (env && environments[env]) return env;
  
  return 'production';
};
```

## Step 5: Verify Backend Connectivity

1. Test your backend endpoints:
   - Health check: `https://your-eb-url.com/api/health`
   - Authentication: `https://your-eb-url.com/api/auth/login`

2. Check CORS configuration on your backend:
   - Ensure your backend allows requests from your app's domain
   - For development: `http://localhost:19006` (Expo dev server)
   - For production: Your app's domain

## Step 6: SSL/HTTPS Configuration

Ensure your Elastic Beanstalk environment:
1. Has SSL certificate configured
2. Uses HTTPS for all API calls
3. Has proper security groups configured

## Step 7: Environment-Specific Features

The configuration automatically handles:
- **Development**: Uses local backend with detailed logging
- **Production**: Uses Elastic Beanstalk with optimized settings

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Check your backend CORS configuration
   - Ensure your backend allows requests from your app's origin

2. **SSL Certificate Issues**:
   - Verify your Elastic Beanstalk environment has a valid SSL certificate
   - Check if your backend is accessible via HTTPS

3. **Timeout Issues**:
   - Increase `API_TIMEOUT` in production configuration
   - Check your Elastic Beanstalk instance size and configuration

4. **Authentication Issues**:
   - Verify your backend authentication endpoints are working
   - Check if your backend expects the same token format

### Debug Steps:

1. Check the console logs in your app
2. Test API endpoints directly using Postman or curl
3. Verify your Elastic Beanstalk environment health
4. Check AWS CloudWatch logs for backend errors

## Security Considerations

1. **API Keys**: Never hardcode sensitive information in your app
2. **HTTPS**: Always use HTTPS in production
3. **Token Storage**: Use SecureStore for token storage (already implemented)
4. **Environment Variables**: Use environment variables for sensitive configuration

## Next Steps

After configuration:
1. Test all major features with the Elastic Beanstalk backend
2. Monitor performance and adjust timeouts if needed
3. Set up monitoring and logging for production
4. Consider implementing retry logic for network failures

## Support

If you encounter issues:
1. Check the AWS Elastic Beanstalk console for environment health
2. Review CloudWatch logs for backend errors
3. Test API endpoints directly
4. Verify network connectivity from your development environment
