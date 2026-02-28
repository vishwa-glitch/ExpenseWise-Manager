# Smart Scroll Implementation for Auth Screens

## Overview

Implemented intelligent keyboard scrolling for Register and Login screens. Instead of always scrolling to the bottom, the screen now scrolls to the appropriate section based on which input field the user is interacting with.

## Changes Made

### RegisterScreen.tsx

**Added Section Refs:**
- `nameRowRef` - For First Name and Last Name inputs
- `emailRef` - For Email input
- `passwordRef` - For Password and Confirm Password inputs

**Updated `handleInputFocus` Function:**
- Now accepts a parameter: `'name' | 'email' | 'password'`
- Uses `measureLayout` to calculate the exact position of each section
- Scrolls to the specific section with a 100px offset for better visibility

**Input Grouping:**
- First Name & Last Name → Scroll to name section
- Email → Scroll to email section  
- Password & Confirm Password → Scroll to password section

### LoginScreen.tsx

**Added Section Refs:**
- `emailRef` - For Email input
- `passwordRef` - For Password input

**Updated `handleInputFocus` Function:**
- Now accepts a parameter: `'email' | 'password'`
- Uses `measureLayout` to calculate the exact position of each section
- Scrolls to the specific section with a 100px offset

**Input Grouping:**
- Email → Scroll to email section
- Password → Scroll to password section

## How It Works

1. Each input section is wrapped in a `View` with a ref
2. When an input is focused, `handleInputFocus` is called with the section type
3. The function measures the Y position of the target section relative to the ScrollView
4. ScrollView scrolls to that position minus 100px offset (to show some content above)
5. Animation is smooth with `animated: true`

## Benefits

- **Better UX**: Users see the relevant section, not just the bottom of the form
- **Context Awareness**: Related fields (like name fields or password fields) scroll together
- **Smooth Animation**: 300ms delay ensures keyboard is visible before scrolling
- **Fallback Handling**: Console logs if measurement fails (rare edge case)

## Testing Recommendations

1. Test on both iOS and Android
2. Test with different keyboard types (email, default)
3. Test with different screen sizes
4. Verify the 100px offset provides good visibility
5. Check that password requirements box doesn't interfere with scrolling
