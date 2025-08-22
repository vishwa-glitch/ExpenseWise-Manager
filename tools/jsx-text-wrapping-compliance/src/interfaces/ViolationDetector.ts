/**
 * Violation Detector Interface
 * Defines the contract for detecting JSX text wrapping violations
 */

import * as ts from 'typescript';
import { TextWrappingViolation, ComponentRules, TextContent } from '../types';

export interface ViolationDetector {
  /**
   * Detects text wrapping violations in a JSX element
   * @param jsxElement JSX element to analyze
   * @returns Array of detected violations
   */
  detectViolations(jsxElement: ts.JsxElement | ts.JsxSelfClosingElement): TextWrappingViolation[];

  /**
   * Checks if a component is allowed to contain text directly
   * @param componentName Name of the component to check
   * @returns True if component can contain text directly
   */
  isTextContainer(componentName: string): boolean;

  /**
   * Determines if text content should be wrapped in a Text component
   * @param parentComponent Name of the parent component
   * @param textContent Text content to evaluate
   * @returns True if text should be wrapped
   */
  shouldWrapText(parentComponent: string, textContent: string): boolean;

  /**
   * Analyzes text content within JSX to determine if it needs wrapping
   * @param node JSX child node to analyze
   * @returns Text content analysis or null if no text content
   */
  analyzeTextContent(node: ts.JsxChild): TextContent | null;

  /**
   * Sets the component rules for violation detection
   * @param rules Component rules configuration
   */
  setComponentRules(rules: ComponentRules): void;

  /**
   * Gets the current component rules
   * @returns Current component rules
   */
  getComponentRules(): ComponentRules;
}