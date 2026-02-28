import {
  applyFontSettings,
  createNumberStyle,
  getFontSizeMultiplier,
  getFontFamily,
  shouldBoldNumbers,
  FontSettings,
} from '../fontUtils';

describe('fontUtils', () => {
  const baseStyle = {
    fontSize: 16,
    color: '#000000',
  };

  const defaultFontSettings: FontSettings = {
    fontSize: 'medium',
    fontFamily: 'system',
    boldNumbers: false,
  };

  describe('applyFontSettings', () => {
    it('should apply medium font size correctly', () => {
      const result = applyFontSettings(baseStyle, defaultFontSettings);
      expect(result.fontSize).toBe(16); // 16 * 1.0 = 16
    });

    it('should apply small font size correctly', () => {
      const settings = { ...defaultFontSettings, fontSize: 'small' as const };
      const result = applyFontSettings(baseStyle, settings);
      expect(result.fontSize).toBe(13.6); // 16 * 0.85 = 13.6
    });

    it('should apply large font size correctly', () => {
      const settings = { ...defaultFontSettings, fontSize: 'large' as const };
      const result = applyFontSettings(baseStyle, settings);
      expect(result.fontSize).toBe(19.2); // 16 * 1.2 = 19.2
    });

    it('should apply serif font family correctly', () => {
      const settings = { ...defaultFontSettings, fontFamily: 'serif' as const };
      const result = applyFontSettings(baseStyle, settings);
      expect(result.fontFamily).toBe('serif');
    });

    it('should apply monospace font family correctly', () => {
      const settings = { ...defaultFontSettings, fontFamily: 'monospace' as const };
      const result = applyFontSettings(baseStyle, settings);
      expect(result.fontFamily).toBe('monospace');
    });

    it('should not apply font family for system', () => {
      const result = applyFontSettings(baseStyle, defaultFontSettings);
      expect(result.fontFamily).toBeUndefined();
    });

    it('should make numbers bold when boldNumbers is true and isNumber is true', () => {
      const settings = { ...defaultFontSettings, boldNumbers: true };
      const result = applyFontSettings(baseStyle, settings, true);
      expect(result.fontWeight).toBe('bold');
    });

    it('should not make text bold when boldNumbers is false', () => {
      const result = applyFontSettings(baseStyle, defaultFontSettings, true);
      expect(result.fontWeight).toBeUndefined();
    });

    it('should not make text bold when isNumber is false', () => {
      const settings = { ...defaultFontSettings, boldNumbers: true };
      const result = applyFontSettings(baseStyle, settings, false);
      expect(result.fontWeight).toBeUndefined();
    });

    it('should preserve other style properties', () => {
      const result = applyFontSettings(baseStyle, defaultFontSettings);
      expect(result.color).toBe('#000000');
    });
  });

  describe('createNumberStyle', () => {
    it('should create number style with bold numbers enabled', () => {
      const settings = { ...defaultFontSettings, boldNumbers: true };
      const result = createNumberStyle(baseStyle, settings);
      expect(result.fontWeight).toBe('bold');
    });

    it('should create number style with bold numbers disabled', () => {
      const result = createNumberStyle(baseStyle, defaultFontSettings);
      expect(result.fontWeight).toBeUndefined();
    });
  });

  describe('getFontSizeMultiplier', () => {
    it('should return correct multiplier for small', () => {
      expect(getFontSizeMultiplier('small')).toBe(0.85);
    });

    it('should return correct multiplier for medium', () => {
      expect(getFontSizeMultiplier('medium')).toBe(1.0);
    });

    it('should return correct multiplier for large', () => {
      expect(getFontSizeMultiplier('large')).toBe(1.2);
    });
  });

  describe('getFontFamily', () => {
    it('should return undefined for system', () => {
      expect(getFontFamily('system')).toBeUndefined();
    });

    it('should return serif for serif', () => {
      expect(getFontFamily('serif')).toBe('serif');
    });

    it('should return monospace for monospace', () => {
      expect(getFontFamily('monospace')).toBe('monospace');
    });
  });

  describe('shouldBoldNumbers', () => {
    it('should return true when boldNumbers is true', () => {
      expect(shouldBoldNumbers(true)).toBe(true);
    });

    it('should return false when boldNumbers is false', () => {
      expect(shouldBoldNumbers(false)).toBe(false);
    });
  });
});
