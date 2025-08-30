# CloudFront Quick Fix for HTTPS

## Overview
This is the fastest solution to get HTTPS working without modifying your Elastic Beanstalk backend. CloudFront will act as a CDN and provide HTTPS termination.

## Step 1: Create CloudFront Distribution

### 1. Go to AWS CloudFront Console
1. Open AWS Console
2. Go to CloudFront service
3. Click "Create Distribution"

### 2. Configure Origin
- **Origin Domain**: Select your Elastic Beanstalk environment
  - `finance-app-env.eba-8rzsstea.us-east-1.elasticbeanstalk.com`
- **Origin Path**: Leave empty
- **Protocol**: HTTP Only
- **Port**: 80

### 3. Configure Default Cache Behavior
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Allowed HTTP Methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- **Cache Policy**: CachingDisabled (for API calls)
- **Origin Request Policy**: AllViewer (for API calls)

### 4. Configure Distribution Settings
- **Price Class**: Use Only North America and Europe (cheaper)
- **Alternate Domain Names**: Leave empty for now
- **SSL Certificate**: Request a certificate (free)
- **Default Root Object**: Leave empty

### 5. Create Distribution
- Click "Create Distribution"
- Wait 5-10 minutes for deployment

## Step 2: Update Your App Configuration

### Update Environment Configuration
Edit `src/config/environment.ts`:

```typescript
const environments: Record<string, EnvironmentConfig> = {
  development: {
    API_BASE_URL: "http://192.168.11.131:3000", // Local development
    API_PREFIX: "/api",
    API_TIMEOUT: 10000,
    ENVIRONMENT: 'development',
    ENABLE_LOGGING: true,
    ENABLE_ANALYTICS: false,
  },
  production: {
    API_BASE_URL: "https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net", // CloudFront URL
    API_PREFIX: "/api",
    API_TIMEOUT: 15000,
    ENVIRONMENT: 'production',
    ENABLE_LOGGING: false,
    ENABLE_ANALYTICS: true,
  },
};
```

### Remove Network Security Config
Since you're using HTTPS, remove the network security configuration:

```json
// In app.json, remove this:
"networkSecurityConfig": {
  "cleartextTrafficPermitted": true
}
```

## Step 3: Test CloudFront Setup

### Test Your Backend
```bash
# Test CloudFront HTTPS endpoint
curl https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net/api/health

# Test authentication
curl -X POST https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Step 4: Build and Test App

```bash
# Build new APK with HTTPS
eas build -p android --profile production

# Install and test
# The app should now work without network errors
```

## Cost Analysis

- **CloudFront**: ~$0.085/GB (very low for API calls)
- **Data Transfer**: Minimal cost for API responses
- **Total Cost**: Usually < $1/month for typical usage

## Advantages

1. **Quick Setup**: 10-15 minutes
2. **No Backend Changes**: Your Elastic Beanstalk stays the same
3. **Free SSL**: AWS provides free SSL certificates
4. **Global CDN**: Improves performance worldwide
5. **Easy Management**: Simple AWS console interface

## Disadvantages

1. **Additional Cost**: Small monthly fee
2. **Latency**: Slight increase due to CDN layer
3. **Complexity**: Additional AWS service to manage

## Troubleshooting

### Common Issues

1. **CloudFront Not Working**
   - Check distribution status (must be "Deployed")
   - Verify origin configuration
   - Check security groups

2. **API Calls Failing**
   - Ensure "Allowed HTTP Methods" includes POST, PUT, DELETE
   - Check "Cache Policy" is set to "CachingDisabled"
   - Verify "Origin Request Policy" is set to "AllViewer"

3. **HTTPS Certificate Issues**
   - Wait for SSL certificate to be issued
   - Check certificate status in CloudFront console

### Debug Steps

1. **Test CloudFront URL**
   ```bash
   curl -I https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net/api/health
   ```

2. **Check Distribution Status**
   - Go to CloudFront console
   - Verify status is "Deployed"
   - Check for any errors

3. **Monitor Logs**
   - Enable CloudFront access logs
   - Check for failed requests
   - Monitor error rates

## Next Steps

1. **Create CloudFront Distribution**: Follow Step 1
2. **Update App Configuration**: Follow Step 2
3. **Test Endpoints**: Follow Step 3
4. **Build New APK**: Follow Step 4
5. **Monitor Performance**: Watch CloudFront metrics

## Alternative: Use Custom Domain

If you want a custom domain:

1. **Register Domain**: Use Route 53 or your existing domain
2. **Request Certificate**: In AWS Certificate Manager
3. **Add Custom Domain**: In CloudFront distribution
4. **Update DNS**: Point domain to CloudFront

## Support

If you encounter issues:
1. Check CloudFront distribution status
2. Verify origin configuration
3. Test endpoints manually
4. Review CloudFront logs
