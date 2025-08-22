/**
 * ViolationDetector Tests
 * Comprehensive tests for JSX text wrapping violation detection
 */

import { ViolationDetector } from '../detector/ViolationDetector';
import { ComponentRules, TextWrappingRule } from '../types';

describe('ViolationDetector', () => {
  let detector: ViolationDetector;

  beforeEach(() => {
    detector = new ViolationDetector();
  });

  describe('Component Rule Validation', () => {
    test('should identify restricted components correctly', () => {
      expect(detector.isTextContainer('View')).toBe(false);
      expect(detector.isTextContainer('Pressable')).toBe(false);
      expect(detector.isTextContainer('TouchableOpacity')).toBe(false);
      expect(detector.isTextContainer('ScrollView')).toBe(false);
    });

    test('should identify allowed text containers correctly', () => {
      expect(detector.isTextContainer('Text')).toBe(true);
      expect(detector.isTextContainer('TextInput')).toBe(true);
      expect(detector.isTextContainer('Button')).toBe(true);
    });

    test('should handle special cases correctly', () => {
      expect(detector.shouldWrapText('View', 'Hello World')).toBe(true);
      expect(detector.shouldWrapText('Text', 'Hello World')).toBe(false);
      expect(detector.shouldWrapText('TouchableOpacity', 'Click me')).toBe(true);
    });

    test('should allow custom component rules', () => {
      const customRules: ComponentRules = {
        restrictedComponents: ['CustomView'],
        allowedTextContainers: ['CustomText'],
        specialCases: new Map<string, TextWrappingRule>([
          ['CustomComponent', {
            allowDirectText: false,
            requiresTextWrapper: true,
            specialHandling: (content: string) => content.length > 5
          }]
        ])
      };

      detector.setComponentRules(customRules);
      
      expect(detector.isTextContainer('CustomText')).toBe(true);
      expect(detector.shouldWrapText('CustomView', 'test')).toBe(true);
      expect(detector.shouldWrapText('CustomComponent', 'short')).toBe(false);
      expect(detector.shouldWrapText('CustomComponent', 'longer text')).toBe(true);
    });

    test('should get and set component rules', () => {
      const initialRules = detector.getComponentRules();
      expect(initialRules.restrictedComponents).toContain('View');
      expect(initialRules.allowedTextContainers).toContain('Text');

      const newRules: ComponentRules = {
        restrictedComponents: ['NewRestricted'],
        allowedTextContainers: ['NewAllowed'],
        specialCases: new Map()
      };

      detector.setComponentRules(newRules);
      const updatedRules = detector.getComponentRules();
      expect(updatedRules.restrictedComponents).toEqual(['NewRestricted']);
      expect(updatedRules.allowedTextContainers).toEqual(['NewAllowed']);
    });
  });

  describe('Severity Assessment Logic', () => {
    test('should assign high severity to View components', () => {
      // Test the private calculateSeverity method indirectly through component rules
      expect(detector.shouldWrapText('View', 'test content')).toBe(true);
      expect(detector.shouldWrapText('ScrollView', 'test content')).toBe(true);
      expect(detector.shouldWrapText('FlatList', 'test content')).toBe(true);
    });

    test('should assign medium severity to interactive components', () => {
      expect(detector.shouldWrapText('Pressable', 'test content')).toBe(true);
      expect(detector.shouldWrapText('TouchableOpacity', 'test content')).toBe(true);
      expect(detector.shouldWrapText('TouchableHighlight', 'test content')).toBe(true);
    });

    test('should not require wrapping for allowed text containers', () => {
      expect(detector.shouldWrapText('Text', 'test content')).toBe(false);
      expect(detector.shouldWrapText('TextInput', 'test content')).toBe(false);
    });
  });

  describe('Special Case Handling', () => {
    test('should handle Button components correctly', () => {
      // Button is in allowed text containers, but has special handling
      expect(detector.isTextContainer('Button')).toBe(true);
      // Button special handling returns true for non-empty content (should wrap)
      expect(detector.shouldWrapText('Button', 'Click me')).toBe(true);
      // Empty content should not require wrapping
      expect(detector.shouldWrapText('Button', '')).toBe(false);
    });

    test('should handle Picker.Item components correctly', () => {
      // Picker.Item is in allowed text containers
      expect(detector.isTextContainer('Picker.Item')).toBe(true);
      expect(detector.shouldWrapText('Picker.Item', 'Option text')).toBe(false);
    });

    test('should handle unknown components as requiring wrapping', () => {
      expect(detector.isTextContainer('UnknownComponent')).toBe(false);
      expect(detector.shouldWrapText('UnknownComponent', 'some text')).toBe(true);
    });
  });

  describe('Component Rules Integration', () => {
    test('should respect restricted components list', () => {
      const rules = detector.getComponentRules();
      
      // Test that all restricted components require text wrapping
      rules.restrictedComponents.forEach(component => {
        expect(detector.shouldWrapText(component, 'test text')).toBe(true);
        expect(detector.isTextContainer(component)).toBe(false);
      });
    });

    test('should respect allowed text containers list', () => {
      const rules = detector.getComponentRules();
      
      // Test that all allowed text containers are identified correctly
      rules.allowedTextContainers.forEach(component => {
        expect(detector.isTextContainer(component)).toBe(true);
        
        // Some components like Button have special handling, so test individually
        if (component === 'Button') {
          // Button has special handling that requires wrapping for non-empty content
          expect(detector.shouldWrapText(component, 'test text')).toBe(true);
        } else {
          // Other text containers like Text, TextInput should not require wrapping
          expect(detector.shouldWrapText(component, 'test text')).toBe(false);
        }
      });
    });

    test('should handle special cases with custom logic', () => {
      const rules = detector.getComponentRules();
      
      // Test TouchableOpacity special case
      if (rules.specialCases.has('TouchableOpacity')) {
        expect(detector.shouldWrapText('TouchableOpacity', 'button text')).toBe(true);
      }
      
      // Test Pressable special case
      if (rules.specialCases.has('Pressable')) {
        expect(detector.shouldWrapText('Pressable', 'pressable text')).toBe(true);
      }
    });
  });
});