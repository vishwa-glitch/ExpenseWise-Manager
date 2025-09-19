# Onboarding Screens

This directory contains the three introductory onboarding screens that are shown to all users when they first launch the app (before login/register).

## Screens

### OnboardingScreen1 - "Welcome"
- **Headline**: "Welcome to Your Money. Crystal Clear."
- **Subline**: "All your accounts, budgets, and goals in one clean view. Let's get started!"
- **Emoji**: 💰 (placeholder for illustration)

### OnboardingScreen2 - "Smart Organization"
- **Headline**: "Every Transaction, Right Where It Belongs."
- **Subline**: "Smart categorization and a sleek calendar view keep your finances organized."
- **Emoji**: 📊 (placeholder for illustration)

### OnboardingScreen3 - "Data Control"
- **Headline**: "Your Data, Your Way."
- **Subline**: "Export reports in Excel, PDF, or CSV and stay in total control."
- **Emoji**: 📈 (placeholder for illustration)

## Design Features

### Color Palette
- **Background**: White (#FFFFFF) or very light grey (#F8F9FA)
- **Headline Text**: Dark charcoal (#212121) for high contrast
- **Subline Text**: Secondary text color (#6C757D)
- **Primary Button**: Green (#2E7D57) with white text
- **Secondary Button**: Light grey background (#F8F9FA) with dark text
- **Progress Indicators**: Green for active, light grey for inactive

### Layout
- Clean, minimal design with plenty of white space
- Large illustration placeholder (60% screen width, 30% screen height)
- Centered content with proper spacing
- Progress dots at the bottom
- Navigation buttons (Back/Next/Get Started)
- Skip option available on all screens

### Navigation Flow
1. **Screen 1**: Next button only (+ Skip)
2. **Screen 2**: Back and Next buttons (+ Skip)
3. **Screen 3**: Back and Get Started buttons (+ Skip)

## Integration

The onboarding screens are integrated into the app navigation flow:

1. **App Launch** → **Onboarding Screens** → Login/Register → Main App
2. **Returning Users** → Main App (if onboarding already completed)

### State Management
- Uses Redux `onboardingSlice` to manage completion state
- Persists completion status in SecureStore
- Automatically shows for all users at app launch (if not completed)

### Navigation
- Handled by `OnboardingNavigator.tsx`
- Integrated into `AppNavigator.tsx`
- Automatically transitions to main app after completion

## Customization

### Adding Illustrations
Replace the emoji placeholders in each screen with actual illustrations:

```tsx
// Replace this:
<View style={styles.illustrationPlaceholder}>
  <Text style={styles.placeholderText}>💰</Text>
</View>

// With this:
<View style={styles.illustrationContainer}>
  <Image source={require('../../assets/onboarding/screen1.png')} style={styles.illustration} />
</View>
```

### Modifying Content
Update the headlines and sublines in each screen component:

```tsx
<Text style={styles.headline}>Your Custom Headline</Text>
<Text style={styles.subline}>Your custom description text.</Text>
```

### Styling
All styles follow the app's design system using:
- `colors` from `../../constants/colors`
- `typography` for consistent text styling
- `spacing` for consistent margins and padding

## Testing

Basic tests are included in `__tests__/OnboardingScreens.test.tsx`:
- Renders correctly with proper content
- Button interactions work as expected
- Proper callback functions are called

## Future Enhancements

1. **Animations**: Add smooth transitions between screens
2. **Illustrations**: Replace emoji placeholders with custom illustrations
3. **Personalization**: Customize content based on user preferences
4. **Analytics**: Track onboarding completion rates and drop-off points
5. **A/B Testing**: Test different headlines and content variations