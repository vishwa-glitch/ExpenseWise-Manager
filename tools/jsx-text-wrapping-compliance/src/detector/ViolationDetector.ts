/**
 * ViolationDetector Implementation
 * Detects JSX text wrapping violations in React Native components
 */

import * as ts from 'typescript';
import { ViolationDetector as IViolationDetector } from '../interfaces/ViolationDetector';
import { 
  TextWrappingViolation, 
  ComponentRules, 
  TextContent, 
  ViolationType, 
  ViolationSeverity 
} from '../types';
import { ViolationType as ViolationTypeEnum, ViolationSeverity as ViolationSeverityEnum } from '../enums';
import { DEFAULT_COMPONENT_RULES } from '../constants/ComponentRules';
import { generateViolationId } from '../utils';
import { TextContentAnalyzer } from '../utils/TextContentAnalyzer';

export class ViolationDetector implements IViolationDetector {
  private componentRules: ComponentRules;

  constructor(rules?: ComponentRules) {
    this.componentRules = rules || DEFAULT_COMPONENT_RULES;
  }

  /**
   * Detects text wrapping violations in a JSX element
   */
  detectViolations(jsxElement: ts.JsxElement | ts.JsxSelfClosingElement): TextWrappingViolation[] {
    const violations: TextWrappingViolation[] = [];
    const componentName = this.getComponentName(jsxElement);

    // Skip if this is already a text container
    if (this.isTextContainer(componentName)) {
      return violations;
    }

    // For JSX elements with children, check each child
    if (ts.isJsxElement(jsxElement)) {
      jsxElement.children.forEach((child) => {
        const textContent = this.analyzeTextContent(child);
        if (textContent && textContent.needsWrapping) {
          const violation = this.createViolation(
            jsxElement,
            componentName,
            textContent,
            child
          );
          if (violation) {
            violations.push(violation);
          }
        }
      });
    }

    return violations;
  }

  /**
   * Checks if a component is allowed to contain text directly
   */
  isTextContainer(componentName: string): boolean {
    return this.componentRules.allowedTextContainers.includes(componentName);
  }

  /**
   * Determines if text content should be wrapped in a Text component
   */
  shouldWrapText(parentComponent: string, textContent: string): boolean {
    // Check if parent is a restricted component
    if (this.componentRules.restrictedComponents.includes(parentComponent)) {
      return true;
    }

    // Check special cases
    const specialRule = this.componentRules.specialCases.get(parentComponent);
    if (specialRule) {
      if (specialRule.specialHandling) {
        return specialRule.specialHandling(textContent);
      }
      return specialRule.requiresTextWrapper;
    }

    // Default: if not explicitly allowed, require wrapping
    return !this.isTextContainer(parentComponent);
  }

  /**
   * Analyzes text content within JSX to determine if it needs wrapping
   */
  analyzeTextContent(node: ts.JsxChild): TextContent | null {
    // Use the enhanced TextContentAnalyzer
    return TextContentAnalyzer.analyzeJSXChild(node);
  }

  /**
   * Sets the component rules for violation detection
   */
  setComponentRules(rules: ComponentRules): void {
    this.componentRules = rules;
  }

  /**
   * Gets the current component rules
   */
  getComponentRules(): ComponentRules {
    return this.componentRules;
  }



  /**
   * Gets the component name from a JSX element
   */
  private getComponentName(jsxElement: ts.JsxElement | ts.JsxSelfClosingElement): string {
    const tagName = ts.isJsxElement(jsxElement) 
      ? jsxElement.openingElement.tagName 
      : jsxElement.tagName;

    if (ts.isIdentifier(tagName)) {
      return tagName.text;
    }

    if (ts.isPropertyAccessExpression(tagName)) {
      // Handle cases like Picker.Item
      return tagName.getText();
    }

    return 'Unknown';
  }

  /**
   * Creates a violation object from detected text content
   */
  private createViolation(
    jsxElement: ts.JsxElement | ts.JsxSelfClosingElement,
    componentName: string,
    textContent: TextContent,
    childNode: ts.JsxChild
  ): TextWrappingViolation | null {
    const sourceFile = jsxElement.getSourceFile();
    if (!sourceFile) {
      return null;
    }

    const { line, character } = sourceFile.getLineAndCharacterOfPosition(childNode.getStart());
    
    const violationType = this.mapTextContentToViolationType(textContent.type);
    const severity = this.calculateSeverity(componentName, textContent);
    const suggestedFix = this.generateSuggestedFix(textContent, componentName);

    return {
      id: generateViolationId(sourceFile.fileName, line, character),
      line: line + 1, // Convert to 1-based line numbers
      column: character + 1, // Convert to 1-based column numbers
      parentComponent: componentName,
      textContent: textContent.content,
      violationType,
      severity,
      suggestedFix
    };
  }

  /**
   * Maps TextContent type to ViolationType
   */
  private mapTextContentToViolationType(type: string): ViolationType {
    switch (type) {
      case 'text_literal':
        return ViolationTypeEnum.STRING_LITERAL;
      case 'template_literal':
        return ViolationTypeEnum.TEMPLATE_LITERAL;
      case 'literal_expression':
        return ViolationTypeEnum.NUMERIC;
      default:
        return ViolationTypeEnum.EXPRESSION;
    }
  }

  /**
   * Calculates violation severity based on component and content
   */
  private calculateSeverity(componentName: string, _textContent: TextContent): ViolationSeverity {
    // High severity for components that commonly cause rendering issues
    const highSeverityComponents = ['View', 'ScrollView', 'FlatList', 'SectionList'];
    if (highSeverityComponents.includes(componentName)) {
      return ViolationSeverityEnum.HIGH;
    }

    // Medium severity for interactive components
    const mediumSeverityComponents = ['Pressable', 'TouchableOpacity', 'TouchableHighlight'];
    if (mediumSeverityComponents.includes(componentName)) {
      return ViolationSeverityEnum.MEDIUM;
    }

    // Low severity for other cases
    return ViolationSeverityEnum.LOW;
  }

  /**
   * Generates a suggested fix for the violation
   */
  private generateSuggestedFix(textContent: TextContent, _componentName: string): string {
    const content = textContent.content;
    
    if (textContent.type === 'text_literal') {
      return `<Text>${content}</Text>`;
    }
    
    if (textContent.type === 'template_literal') {
      return `<Text>${content}</Text>`;
    }
    
    if (textContent.type === 'literal_expression') {
      return `<Text>{${content}}</Text>`;
    }
    
    return `<Text>{${content}}</Text>`;
  }
}