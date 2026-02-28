# Font Settings System

This document explains how to use the font settings system in the finance mobile app.

## Overview

The font settings system allows users to customize:
- **Font Size**: Small, Medium, Large
- **Font Family**: System, Serif, Monospace
- **Bold Numbers**: ON/OFF toggle for enhanced readability of financial figures

## Architecture

### 1. State Management (`uiSlice.ts`)
Font settings are stored in the Redux UI slice:
```typescript
interface UIState {
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'system' | 'serif' | 'monospace';
  boldNumbers: boolean;
}
```

### 2. Utility Functions (`fontUtils.ts`)
Core functions for applying font settings:
- `applyFontSettings()` - Applies font settings to any text style
- `createNumberStyle()` - Creates styles specifically for numbers
- `getFontSizeMultiplier()` - Gets size multiplier
- `getFontFamily()` - Gets font family string
- `shouldBoldNumbers()` - Checks if numbers should be bold

### 3. Custom Hook (`useFontSettings.ts`)
Easy-to-use hook for components:
```typescript
const { applyFonts, createNumberStyleWithSettings, fontSettings } = useFontSettings();
```

## Usage Examples

### Basic Text Styling
```typescript
import { useFontSettings } from '../hooks/useFontSettings';

const MyComponent = () => {
  const { applyFonts } = useFontSettings();
  
  return (
    <Text style={applyFonts(styles.title)}>
      This text will respect user font settings
    </Text>
  );
};
```

### Number Styling
```typescript
const MyComponent = () => {
  const { createNumberStyleWithSettings } = useFontSettings();
  
  return (
    <Text style={createNumberStyleWithSettings(styles.balance)}>
      $1,234.56
    </Text>
  );
};
```

### Conditional Number Styling
```typescript
const MyComponent = () => {
  const { applyFonts } = useFontSettings();
  
  return (
    <Text style={applyFonts(styles.amount, true)}> // true = isNumber
      $1,234.56
    </Text>
  );
};
```

## Font Size Multipliers

- **Small**: 0.85x (85% of original size)
- **Medium**: 1.0x (100% of original size)
- **Large**: 1.2x (120% of original size)

## Font Family Mappings

- **System**: Uses device default font (undefined)
- **Serif**: Uses 'serif' font family
- **Monospace**: Uses 'monospace' font family

## Settings Screen

The Settings screen (`SettingsScreen.tsx`) provides a user interface for:
- Font size selection with dropdown
- Font family selection with dropdown
- Bold numbers toggle with switch
- Live preview of settings

## Navigation

Users can access font settings through:
1. **More Screen** → **Font & Size** (direct link)
2. **More Screen** → **Settings** → **Font & Size** section

## Best Practices

1. **Always use the hook**: Use `useFontSettings()` instead of directly accessing the store
2. **Apply to all text**: Use `applyFonts()` for regular text
3. **Use number styles for financial data**: Use `createNumberStyleWithSettings()` for amounts, balances, etc.
4. **Test all combinations**: Ensure your component looks good with all font size and family combinations
5. **Consider accessibility**: Larger fonts and bold numbers improve readability

## Testing

The system includes comprehensive tests in `fontUtils.test.ts` covering:
- Font size multipliers
- Font family mappings
- Bold number functionality
- Style preservation

## Example Component

See `FontSettingsExample.tsx` for a complete example of how to use the font settings system in a component.
