/**
 * TextContentAnalyzer Tests
 * Focused tests for text content analysis utilities
 */

import { TextContentAnalyzer } from '../utils/TextContentAnalyzer';

describe('TextContentAnalyzer', () => {
  describe('JSX Text Analysis', () => {
    test('should detect non-empty text content', () => {
      // Mock JSX text node
      const mockJsxText = {
        text: '  Hello World  ',
        kind: 'JsxText'
      } as any;

      const result = TextContentAnalyzer.analyzeJSXText(mockJsxText);
      
      expect(result).toEqual({
        type: 'text_literal',
        content: 'Hello World',
        needsWrapping: true
      });
    });

    test('should ignore whitespace-only content', () => {
      const mockJsxText = {
        text: '   \n\t  ',
        kind: 'JsxText'
      } as any;

      const result = TextContentAnalyzer.analyzeJSXText(mockJsxText);
      expect(result).toBeNull();
    });

    test('should ignore empty content', () => {
      const mockJsxText = {
        text: '',
        kind: 'JsxText'
      } as any;

      const result = TextContentAnalyzer.analyzeJSXText(mockJsxText);
      expect(result).toBeNull();
    });

    test('should handle text with mixed whitespace', () => {
      const mockJsxText = {
        text: '\n  Hello\t World  \n',
        kind: 'JsxText'
      } as any;

      const result = TextContentAnalyzer.analyzeJSXText(mockJsxText);
      
      expect(result).toEqual({
        type: 'text_literal',
        content: 'Hello\t World',
        needsWrapping: true
      });
    });
  });

  describe('Utility Methods', () => {
    test('should handle text trimming correctly', () => {
      const testCases = [
        { input: '  hello  ', expected: 'hello' },
        { input: '\n\tworld\n\t', expected: 'world' },
        { input: '   ', expected: '' },
        { input: '', expected: '' },
        { input: 'no-trim', expected: 'no-trim' }
      ];

      testCases.forEach(({ input, expected }) => {
        const mockJsxText = { text: input } as any;
        const result = TextContentAnalyzer.analyzeJSXText(mockJsxText);
        
        if (expected === '') {
          expect(result).toBeNull();
        } else {
          expect(result?.content).toBe(expected);
        }
      });
    });

    test('should create proper text content objects', () => {
      const mockJsxText = { text: 'test content' } as any;
      const result = TextContentAnalyzer.analyzeJSXText(mockJsxText);
      
      expect(result).toHaveProperty('type', 'text_literal');
      expect(result).toHaveProperty('content', 'test content');
      expect(result).toHaveProperty('needsWrapping', true);
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should handle various text patterns', () => {
      const testCases = [
        { text: 'simple text', shouldBeNull: false },
        { text: '123', shouldBeNull: false },
        { text: 'text with\nnewlines', shouldBeNull: false },
        { text: '   ', shouldBeNull: true },
        { text: '\n\t\r', shouldBeNull: true },
        { text: '', shouldBeNull: true }
      ];

      testCases.forEach(({ text, shouldBeNull }) => {
        const mockJsxText = { text } as any;
        const result = TextContentAnalyzer.analyzeJSXText(mockJsxText);
        
        if (shouldBeNull) {
          expect(result).toBeNull();
        } else {
          expect(result).not.toBeNull();
          expect(result?.type).toBe('text_literal');
          expect(result?.needsWrapping).toBe(true);
        }
      });
    });

    test('should maintain consistent return structure', () => {
      const mockJsxText = { text: 'test' } as any;
      const result = TextContentAnalyzer.analyzeJSXText(mockJsxText);
      
      expect(result).toMatchObject({
        type: expect.any(String),
        content: expect.any(String),
        needsWrapping: expect.any(Boolean)
      });
    });

    test('should handle special characters in text', () => {
      const specialTexts = [
        'text with "quotes"',
        "text with 'apostrophes'",
        'text with <brackets>',
        'text with & ampersands',
        'text with émojis 🎉',
        'text with unicode ñ ü ç'
      ];

      specialTexts.forEach(text => {
        const mockJsxText = { text } as any;
        const result = TextContentAnalyzer.analyzeJSXText(mockJsxText);
        
        expect(result).not.toBeNull();
        expect(result?.content).toBe(text);
      });
    });
  });
});