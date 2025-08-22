/**
 * Code Transformer Interface
 * Defines the contract for transforming JSX code to fix text wrapping violations
 */

import { TransformResult, TextWrappingViolation, TransformerConfig, FixApplication } from '../types';

export interface CodeTransformer {
  /**
   * Transforms a file to fix all text wrapping violations
   * @param filePath Path to the file to transform
   * @param violations Array of violations to fix
   * @returns Promise resolving to transformation results
   */
  transformFile(filePath: string, violations: TextWrappingViolation[]): Promise<TransformResult>;

  /**
   * Wraps text content in a Text component for a specific violation
   * @param violation The violation to fix
   * @returns Generated JSX code with Text wrapper
   */
  wrapTextContent(violation: TextWrappingViolation): string;

  /**
   * Preserves original code formatting after transformation
   * @param originalCode Original source code
   * @param transformedCode Transformed source code
   * @returns Formatted transformed code
   */
  preserveFormatting(originalCode: string, transformedCode: string): string;

  /**
   * Applies a single fix to source code
   * @param sourceCode Original source code
   * @param fix Fix to apply
   * @returns Modified source code
   */
  applyFix(sourceCode: string, fix: FixApplication): string;

  /**
   * Validates that transformed code is syntactically correct
   * @param transformedCode Code to validate
   * @returns True if code is valid
   */
  validateTransformedCode(transformedCode: string): boolean;

  /**
   * Creates a backup of the original file before transformation
   * @param filePath Path to the file to backup
   * @returns Path to the backup file
   */
  createBackup(filePath: string): Promise<string>;

  /**
   * Configures the transformer with specific settings
   * @param config Transformer configuration options
   */
  configure(config: Partial<TransformerConfig>): void;

  /**
   * Gets the current transformer configuration
   * @returns Current transformer configuration
   */
  getConfiguration(): TransformerConfig;
}