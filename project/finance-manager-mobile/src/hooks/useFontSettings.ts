import { useTypedSelector } from './useTypedSelector';
import { applyFontSettings, createNumberStyle, FontSettings } from '../utils/fontUtils';
import { TextStyle } from 'react-native';

/**
 * Custom hook to access font settings and utility functions
 */
export const useFontSettings = () => {
  const { fontSize, fontFamily, boldNumbers } = useTypedSelector((state) => state.ui);

  const fontSettings: FontSettings = {
    fontSize,
    fontFamily,
    boldNumbers,
  };

  /**
   * Applies current font settings to a text style
   */
  const applyFonts = (baseStyle: TextStyle, isNumber: boolean = false): TextStyle => {
    return applyFontSettings(baseStyle, fontSettings, isNumber);
  };

  /**
   * Creates a style specifically for numbers with current font settings
   */
  const createNumberStyleWithSettings = (baseStyle: TextStyle): TextStyle => {
    return createNumberStyle(baseStyle, fontSettings);
  };

  /**
   * Checks if numbers should be bold based on current settings
   */
  const shouldBoldNumbers = (): boolean => {
    return boldNumbers;
  };

  return {
    fontSettings,
    applyFonts,
    createNumberStyleWithSettings,
    shouldBoldNumbers,
  };
};
