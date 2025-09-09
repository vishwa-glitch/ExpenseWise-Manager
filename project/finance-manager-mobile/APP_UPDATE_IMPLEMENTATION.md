# App Update Implementation Guide

This guide explains how to implement and configure the app update checker feature that forces users to update the app before they can use it.

## Overview

The app update feature includes:
- Automatic version checking on app start and when app comes to foreground
- Forced update overlay that blocks app usage
- Direct redirect to Play Store for app updates
- Configurable update intervals and UI elements
- Testing mode for development

## Features

### 🔒 Force Update Protection
- Users cannot use the app until they install the latest version
- Update overlay appears immediately when an update is required
- No way to bypass the update requirement

### 🔄 Automatic Update Checking
- Checks for updates every 6 hours (configurable)
- Checks when app starts
- Checks when app comes to foreground
- Background update monitoring

### 🎯 Smart Version Comparison
- Semantic version comparison (e.g., 1.0.0 vs 1.0.1)
- Handles complex version formats
- Accurate update requirement detection

### 🎨 Beautiful Update UI
- Modern overlay design with gradient backgrounds
- Version information display
- Release notes support
- Direct Play Store integration

## Configuration

### 1. Update `appUpdateConfig.ts`

Edit `src/config/appUpdateConfig.ts` with your app details:

```typescript
export const appUpdateConfig = {
  // Replace with your actual Play Store bundle ID
  APP_BUNDLE_ID: 'com.yourcompany.financemanager',
  
  // Your backend API endpoint for version checking
  BACKEND_API: {
    VERSION_CHECK_ENDPOINT: 'https://your-api.com/app/version',
    TIMEOUT: 10000,
  },
  
  // Production settings
  FORCE_UPDATE_ENABLED: true,
  TESTING: {
    ENABLED: false, // Set to false in production
  },
};
```

### 2. Backend API Requirements

Your backend should return a JSON response like:

```json
{
  "latestVersion": "1.0.1",
  "minRequiredVersion": "1.0.0",
  "releaseNotes": "Bug fixes and performance improvements",
  "forceUpdate": true
}
```

### 3. Play Store Configuration

Ensure your app's Play Store listing has:
- Correct bundle ID matching `APP_BUNDLE_ID`
- Proper version codes
- Public listing (not internal testing)

## Implementation Details

### File Structure

```
src/
├── services/
│   └── appUpdateService.ts          # Core update logic
├── store/
│   └── slices/
│       └── appUpdateSlice.ts        # Redux state management
├── components/
│   └── common/
│       ├── AppUpdateOverlay.tsx     # Update UI overlay
│       └── AppWrapper.tsx           # App wrapper with update logic
├── hooks/
│   └── useAppUpdate.ts              # Custom hook for update logic
└── config/
    └── appUpdateConfig.ts           # Configuration settings
```

### Key Components

#### AppUpdateService
- Singleton service for update management
- Version comparison logic
- Play Store integration
- Background update checking

#### AppUpdateOverlay
- Full-screen overlay blocking app usage
- Beautiful UI with version information
- Direct Play Store redirect button
- Configurable UI elements

#### AppWrapper
- Wraps the main app
- Shows update overlay when needed
- Manages update state

## Testing

### 1. Enable Testing Mode

Set in `appUpdateConfig.ts`:

```typescript
TESTING: {
  ENABLED: true,
  MOCK_LATEST_VERSION: '1.0.1', // Higher than current version
  MOCK_UPDATE_REQUIRED: true,
}
```

### 2. Test Scenarios

- **No Update Required**: Set `MOCK_LATEST_VERSION` to current version
- **Update Required**: Set `MOCK_LATEST_VERSION` higher than current
- **Force Update**: Set `FORCE_UPDATE_ENABLED: true`

### 3. Test Update Flow

1. Launch app with testing enabled
2. Update overlay should appear
3. Tap "Update Now" to test Play Store redirect
4. Verify overlay blocks app usage

## Production Deployment

### 1. Disable Testing Mode

```typescript
TESTING: {
  ENABLED: false,
}
```

### 2. Configure Backend API

- Set up your version checking endpoint
- Ensure it returns correct version information
- Test API reliability and performance

### 3. Update Bundle ID

Replace `com.yourcompany.financemanager` with your actual bundle ID in:
- `appUpdateConfig.ts`
- `android/app/build.gradle`
- `eas.json`

### 4. Test on Real Device

- Test with actual Play Store app
- Verify version comparison works correctly
- Test update flow end-to-end

## Customization

### UI Customization

Modify `AppUpdateOverlay.tsx` to:
- Change colors and styling
- Add custom branding
- Modify layout and spacing
- Add animations

### Behavior Customization

Modify `appUpdateService.ts` to:
- Change update check frequency
- Add custom update logic
- Implement different update strategies
- Add analytics and logging

### Configuration Options

Available settings in `appUpdateConfig.ts`:
- Update check intervals
- Force update behavior
- UI element visibility
- Backend API settings
- Testing configurations

## Troubleshooting

### Common Issues

1. **Update Overlay Not Showing**
   - Check `FORCE_UPDATE_ENABLED` setting
   - Verify version comparison logic
   - Check Redux store state

2. **Play Store Not Opening**
   - Verify bundle ID is correct
   - Check device has Play Store installed
   - Test URL construction

3. **Version Check Failing**
   - Check backend API endpoint
   - Verify API response format
   - Check network connectivity

### Debug Mode

Enable debug logging by checking console output:
- Version check results
- Update requirement status
- Service initialization
- Error messages

## Security Considerations

### Version Validation
- Always validate version strings from backend
- Implement proper error handling
- Use HTTPS for API calls
- Validate bundle ID matches

### Update Enforcement
- Ensure update requirement cannot be bypassed
- Validate app signature after updates
- Implement proper state management
- Handle edge cases gracefully

## Performance Optimization

### Update Check Frequency
- Balance between responsiveness and battery life
- Use background app refresh efficiently
- Implement smart update checking
- Cache version information when appropriate

### UI Performance
- Optimize overlay rendering
- Minimize memory usage
- Use efficient state updates
- Implement proper cleanup

## Future Enhancements

### Planned Features
- In-app update support (for supported devices)
- Delta update notifications
- Update progress tracking
- Custom update channels
- A/B testing support

### Integration Opportunities
- Analytics and crash reporting
- User engagement metrics
- Update success tracking
- Feedback collection

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs and error messages
3. Verify configuration settings
4. Test with different scenarios
5. Check backend API functionality

## License

This implementation is part of the Finance Manager Mobile App project.
