# Elastic Beanstalk HTTPS Setup Guide

## Overview
This guide will help you configure HTTPS on your Elastic Beanstalk environment to resolve Android production build network security issues.

## Why HTTPS is Required
- **Android Production Builds**: Require HTTPS by default for security
- **Network Security**: Prevents man-in-the-middle attacks
- **App Store Compliance**: Required for app store submissions
- **User Trust**: Users expect secure connections

## Step 1: Get a Domain Name (Optional but Recommended)

### Option A: Use AWS Route 53
1. Go to AWS Route 53 console
2. Register a domain (e.g., `yourfinanceapp.com`)
3. Cost: ~$12/year

### Option B: Use Your Existing Domain
1. Point your domain to Elastic Beanstalk
2. Update DNS records

### Option C: Use Elastic Beanstalk URL (Free)
- Use the default Elastic Beanstalk URL with HTTPS
- No additional cost

## Step 2: Request SSL Certificate

### Using AWS Certificate Manager (Free)
1. Go to AWS Certificate Manager console
2. Click "Request a certificate"
3. Choose "Request a public certificate"
4. Enter your domain:
   - `yourfinanceapp.com`
   - `*.yourfinanceapp.com` (for subdomains)
5. Choose "DNS validation" (recommended)
6. Click "Request"

### Validation Process
1. AWS will provide DNS records to add
2. Add these records to your domain's DNS
3. Wait for validation (usually 5-30 minutes)
4. Certificate status will change to "Issued"

## Step 3: Configure Elastic Beanstalk Environment

### Option A: Using AWS Console
1. Go to Elastic Beanstalk console
2. Select your environment
3. Click "Configuration"
4. Under "Load balancer", click "Edit"
5. Add listener:
   - **Port**: 443
   - **Protocol**: HTTPS
   - **SSL Certificate**: Select your certificate
   - **Default Process**: Port 80
6. Click "Apply"

### Option B: Using .ebextensions (Recommended)
Create file: `.ebextensions/alb-https.config`

```yaml
Resources:
  AWSEBV2LoadBalancerListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      LoadBalancerArn: !Ref AWSEBV2LoadBalancer
      Port: 443
      Protocol: HTTPS
      Certificates:
        - CertificateArn: arn:aws:acm:region:account:certificate/certificate-id
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref AWSEBV2TargetGroup

  AWSEBV2LoadBalancerListenerRedirect:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      LoadBalancerArn: !Ref AWSEBV2LoadBalancer
      Port: 80
      Protocol: HTTP
      DefaultActions:
        - Type: redirect
          RedirectConfig:
            Protocol: HTTPS
            Port: 443
            StatusCode: HTTP_301
```

## Step 4: Update Your App Configuration

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
    API_BASE_URL: "https://yourfinanceapp.com", // Your HTTPS domain
    API_PREFIX: "/api",
    API_TIMEOUT: 15000,
    ENVIRONMENT: 'production',
    ENABLE_LOGGING: false,
    ENABLE_ANALYTICS: true,
  },
};
```

### Remove Network Security Config
Since you're using HTTPS, you can remove the network security configuration:

```json
// In app.json, remove this:
"networkSecurityConfig": {
  "cleartextTrafficPermitted": true
}
```

## Step 5: Test HTTPS Setup

### Test Your Backend
```bash
# Test HTTPS endpoint
curl https://yourfinanceapp.com/api/health

# Test authentication
curl -X POST https://yourfinanceapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Build and Test App
```bash
# Build new APK with HTTPS
eas build -p android --profile production

# Install and test
# The app should now work without network errors
```

## Step 6: Update DNS (If Using Custom Domain)

### Route 53 Configuration
1. Go to Route 53 console
2. Select your hosted zone
3. Create A record:
   - **Name**: `@` (or your subdomain)
   - **Type**: A
   - **Alias**: Yes
   - **Alias Target**: Your Elastic Beanstalk environment
4. Create CNAME record for www:
   - **Name**: `www`
   - **Type**: CNAME
   - **Value**: `yourfinanceapp.com`

## Troubleshooting

### Common Issues

1. **Certificate Not Validated**
   - Check DNS records are correct
   - Wait longer for propagation
   - Verify domain ownership

2. **HTTPS Not Working**
   - Check security groups allow port 443
   - Verify load balancer configuration
   - Check certificate is attached to listener

3. **Mixed Content Errors**
   - Ensure all API calls use HTTPS
   - Check for hardcoded HTTP URLs
   - Update environment configuration

### Debug Steps

1. **Test Certificate**
   ```bash
   openssl s_client -connect yourfinanceapp.com:443 -servername yourfinanceapp.com
   ```

2. **Check Load Balancer**
   - Verify HTTPS listener is configured
   - Check target group health
   - Review security group rules

3. **Monitor Logs**
   - Check Elastic Beanstalk logs
   - Monitor CloudWatch metrics
   - Review application logs

## Security Best Practices

1. **Force HTTPS Redirect**
   - Redirect all HTTP traffic to HTTPS
   - Use HSTS headers
   - Implement secure cookies

2. **Certificate Management**
   - Set up automatic renewal
   - Monitor expiration dates
   - Use wildcard certificates for subdomains

3. **Security Headers**
   - Implement CSP headers
   - Add security headers in your backend
   - Use secure cookie settings

## Cost Considerations

- **AWS Certificate Manager**: Free
- **Route 53 Domain**: ~$12/year
- **Elastic Beanstalk**: Same cost as before
- **Data Transfer**: Slightly higher for HTTPS

## Alternative Solutions

### Option 1: Use CloudFront (CDN)
- Provides HTTPS termination
- Improves performance
- Additional cost: ~$0.085/GB

### Option 2: Use Application Load Balancer
- Built-in SSL termination
- More control over routing
- Same cost as current setup

### Option 3: Use API Gateway
- Managed HTTPS endpoints
- Built-in security features
- Additional cost: ~$3.50/million requests

## Next Steps

1. **Choose Your Approach**: HTTPS setup or alternative solution
2. **Implement Changes**: Follow the steps above
3. **Test Thoroughly**: Verify all endpoints work
4. **Update App**: Build new APK with HTTPS
5. **Monitor**: Watch for any issues

## Support

If you encounter issues:
1. Check AWS documentation
2. Review Elastic Beanstalk logs
3. Test endpoints manually
4. Verify certificate status
