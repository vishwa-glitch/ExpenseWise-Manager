import { TextStyle } from 'react-native';

export interface FontSettings {
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'system' | 'serif' | 'monospace';
  boldNumbers: boolean;
}

// Font size multipliers
const FONT_SIZE_MULTIPLIERS = {
  small: 0.85,
  medium: 1.0,
  large: 1.2,
};

// Font family mappings
const FONT_FAMILY_MAPPINGS = {
  system: undefined, // Use system default
  serif: 'serif',
  monospace: 'monospace',
};

/**
 * Applies font settings to a text style
 */
export const applyFontSettings = (
  baseStyle: TextStyle,
  fontSettings: FontSettings,
  isNumber: boolean = false
): TextStyle => {
  const { fontSize, fontFamily, boldNumbers } = fontSettings;
  
  let updatedStyle: TextStyle = { ...baseStyle };
  
  // Apply font size multiplier
  if (baseStyle.fontSize) {
    updatedStyle.fontSize = baseStyle.fontSize * FONT_SIZE_MULTIPLIERS[fontSize];
  }
  
  // Apply font family
  const mappedFontFamily = FONT_FAMILY_MAPPINGS[fontFamily];
  if (mappedFontFamily) {
    updatedStyle.fontFamily = mappedFontFamily;
  }
  
  // Apply bold numbers if enabled and this is a number
  if (boldNumbers && isNumber) {
    updatedStyle.fontWeight = 'bold';
  }
  
  return updatedStyle;
};

/**
 * Creates a number-specific text style with font settings applied
 */
export const createNumberStyle = (
  baseStyle: TextStyle,
  fontSettings: FontSettings
): TextStyle => {
  return applyFontSettings(baseStyle, fontSettings, true);
};

/**
 * Gets the font size multiplier for the current settings
 */
export const getFontSizeMultiplier = (fontSize: FontSettings['fontSize']): number => {
  return FONT_SIZE_MULTIPLIERS[fontSize];
};

/**
 * Gets the font family string for the current settings
 */
export const getFontFamily = (fontFamily: FontSettings['fontFamily']): string | undefined => {
  return FONT_FAMILY_MAPPINGS[fontFamily];
};

/**
 * Checks if numbers should be bold based on settings
 */
export const shouldBoldNumbers = (boldNumbers: boolean): boolean => {
  return boldNumbers;
};
