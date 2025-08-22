/**
 * Main entry point for JSX Text Wrapping Compliance system
 */

// Type exports
export * from './types';

// Interface exports
export * from './interfaces';

// Enum exports (avoid conflicts with types)
export { 
  ViolationType as ViolationTypeEnum,
  ViolationSeverity as ViolationSeverityEnum,
  RecoveryAction as RecoveryActionEnum,
  StyleLocation as StyleLocationEnum,
  ErrorType,
  ComponentType
} from './enums';

// Constants exports
export * from './constants';

// Utility exports
export * from './utils';

// Parser exports
export * from './parser';

// Scanner exports (avoid interface conflicts)
export { JSXScanner as JSXScannerImpl } from './scanner';

// Detector exports (avoid interface conflicts)
export { ViolationDetector as ViolationDetectorImpl } from './detector';

// Version information
export const VERSION = '1.0.0';
export const DESCRIPTION = 'JSX Text Wrapping Compliance system for React Native applications';