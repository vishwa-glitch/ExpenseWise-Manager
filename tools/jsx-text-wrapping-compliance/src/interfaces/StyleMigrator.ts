/**
 * Style Migrator Interface
 * Defines the contract for migrating styles when wrapping text in Text components
 */

import * as ts from 'typescript';
import { StyleObject, TextStyles, StyleMigration, TextWrappingViolation } from '../types';

export interface StyleMigrator {
  /**
   * Extracts text-related styles from parent component styles
   * @param parentStyles Style object from parent component
   * @returns Extracted text styles
   */
  extractTextStyles(parentStyles: StyleObject): TextStyles;

  /**
   * Migrates styles for a specific text wrapping violation
   * @param violation The violation being fixed
   * @returns Style migration details
   */
  migrateStyles(violation: TextWrappingViolation): StyleMigration;

  /**
   * Preserves layout by ensuring parent component retains necessary styles
   * @param originalElement Original JSX element
   * @param newElement New JSX element with Text wrapper
   * @returns Modified JSX element with preserved layout
   */
  preserveLayout(originalElement: ts.JsxElement, newElement: ts.JsxElement): ts.JsxElement;

  /**
   * Determines which styles should be moved from parent to Text component
   * @param parentStyles Parent component styles
   * @returns Object with styles to move and styles to keep
   */
  categorizeStyles(parentStyles: StyleObject): {
    textStyles: StyleObject;
    layoutStyles: StyleObject;
  };

  /**
   * Validates that style migration maintains visual consistency
   * @param originalStyles Original parent styles
   * @param migration Applied style migration
   * @returns True if migration is valid
   */
  validateStyleMigration(originalStyles: StyleObject, migration: StyleMigration): boolean;
}