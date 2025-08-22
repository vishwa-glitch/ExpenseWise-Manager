/**
 * Utility functions for JSX Text Wrapping Compliance system
 */

import { ViolationSeverity, TextWrappingViolation } from '../types';

/**
 * Generates a unique ID for a violation
 * @param filePath File path where violation occurs
 * @param line Line number of violation
 * @param column Column number of violation
 * @returns Unique violation ID
 */
export function generateViolationId(filePath: string, line: number, column: number): string {
  const fileHash = filePath.split('/').pop() || 'unknown';
  return `${fileHash}-${line}-${column}-${Date.now()}`;
}

/**
 * Determines violation severity based on component type and content
 * @param componentName Name of the parent component
 * @param textContent Text content that needs wrapping
 * @returns Violation severity level
 */
export function calculateViolationSeverity(componentName: string, _textContent: string): ViolationSeverity {
  // High severity for interactive components
  if (['TouchableOpacity', 'Pressable', 'TouchableHighlight'].includes(componentName)) {
    return 'high';
  }
  
  // Medium severity for layout components
  if (['View', 'ScrollView', 'SafeAreaView'].includes(componentName)) {
    return 'medium';
  }
  
  // Low severity for other cases
  return 'low';
}

/**
 * Calculates compliance score based on violations
 * @param totalElements Total number of JSX elements
 * @param violations Array of violations found
 * @returns Compliance score from 0-100
 */
export function calculateComplianceScore(totalElements: number, violations: TextWrappingViolation[]): number {
  if (totalElements === 0) return 100;
  
  const violationCount = violations.length;
  const complianceRatio = Math.max(0, (totalElements - violationCount) / totalElements);
  return Math.round(complianceRatio * 100);
}

/**
 * Checks if a string contains only whitespace
 * @param text Text to check
 * @returns True if text is only whitespace
 */
export function isWhitespaceOnly(text: string): boolean {
  return text.trim().length === 0;
}

/**
 * Extracts component name from JSX element
 * @param elementName JSX element name (could be namespaced)
 * @returns Clean component name
 */
export function extractComponentName(elementName: string): string {
  // Handle namespaced components like 'React.Text' or 'RN.View'
  const parts = elementName.split('.');
  return parts[parts.length - 1] || elementName;
}

/**
 * Formats file path for display in reports
 * @param filePath Full file path
 * @param maxLength Maximum length for display
 * @returns Formatted file path
 */
export function formatFilePath(filePath: string, maxLength: number = 50): string {
  if (filePath.length <= maxLength) return filePath;
  
  const parts = filePath.split('/');
  if (parts.length <= 2) return filePath;
  
  // Show first and last parts with ellipsis
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first}/.../${last}`;
}

/**
 * Validates that a string is a valid React component name
 * @param name Component name to validate
 * @returns True if valid component name
 */
export function isValidComponentName(name: string): boolean {
  // React component names must start with uppercase letter
  return /^[A-Z][a-zA-Z0-9]*(\.[A-Z][a-zA-Z0-9]*)*$/.test(name);
}

/**
 * Escapes special characters in text content for JSX
 * @param text Text content to escape
 * @returns Escaped text content
 */
export function escapeJSXText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Unescapes JSX text content
 * @param text Escaped text content
 * @returns Unescaped text content
 */
export function unescapeJSXText(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

/**
 * Generates indentation string based on depth
 * @param depth Indentation depth
 * @param useSpaces Whether to use spaces instead of tabs
 * @param spaceCount Number of spaces per indent level
 * @returns Indentation string
 */
export function generateIndentation(depth: number, useSpaces: boolean = true, spaceCount: number = 2): string {
  if (useSpaces) {
    return ' '.repeat(depth * spaceCount);
  }
  return '\t'.repeat(depth);
}

// Export TextContentAnalyzer
export { TextContentAnalyzer } from './TextContentAnalyzer';