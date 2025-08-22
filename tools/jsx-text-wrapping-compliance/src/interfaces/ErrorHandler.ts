/**
 * Error Handler Interface
 * Defines the contract for handling errors during JSX text wrapping compliance operations
 */

import { ParseError, StyleError, TransformError, RecoveryAction, ComplianceError } from '../types';

export interface ErrorHandler {
  /**
   * Handles parse errors that occur during JSX analysis
   * @param error Parse error details
   * @returns Recovery action to take
   */
  handleParseError(error: ParseError): RecoveryAction;

  /**
   * Handles style migration errors
   * @param error Style error details
   * @returns Fallback style configuration
   */
  handleStyleError(error: StyleError): StyleFallback;

  /**
   * Handles code transformation errors
   * @param error Transform error details
   * @returns Fallback transformation approach
   */
  handleTransformError(error: TransformError): TransformFallback;

  /**
   * Logs error details for debugging and analysis
   * @param error Error to log
   * @param context Additional context information
   */
  logError(error: ComplianceError, context?: Record<string, any>): void;

  /**
   * Determines if an error is recoverable
   * @param error Error to evaluate
   * @returns True if error can be recovered from
   */
  isRecoverable(error: ComplianceError): boolean;

  /**
   * Gets error statistics for reporting
   * @returns Error statistics summary
   */
  getErrorStatistics(): ErrorStatistics;
}

export interface StyleFallback {
  useDefaultStyles: boolean;
  skipStyleMigration: boolean;
  fallbackStyles: Record<string, any>;
}

export interface TransformFallback {
  skipTransformation: boolean;
  useSimpleWrapper: boolean;
  requireManualReview: boolean;
}

export interface ErrorStatistics {
  totalErrors: number;
  parseErrors: number;
  styleErrors: number;
  transformErrors: number;
  recoveredErrors: number;
  unrecoverableErrors: number;
}