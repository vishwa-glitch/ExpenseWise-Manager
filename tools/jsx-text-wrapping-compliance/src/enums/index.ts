/**
 * Enums for JSX Text Wrapping Compliance system
 */

export enum ViolationType {
  STRING_LITERAL = 'string_literal',
  TEMPLATE_LITERAL = 'template_literal',
  NUMERIC = 'numeric',
  EXPRESSION = 'expression'
}

export enum ViolationSeverity {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum RecoveryAction {
  SKIP_FILE = 'skip_file',
  MANUAL_REVIEW = 'manual_review',
  PARTIAL_FIX = 'partial_fix',
  RETRY_WITH_FALLBACK = 'retry_with_fallback'
}

export enum StyleLocation {
  PARENT = 'parent',
  TEXT = 'text'
}

export enum ErrorType {
  PARSE_ERROR = 'parse_error',
  STYLE_ERROR = 'style_error',
  TRANSFORM_ERROR = 'transform_error'
}

export enum ComponentType {
  RESTRICTED = 'restricted',
  TEXT_CONTAINER = 'text_container',
  SPECIAL_CASE = 'special_case'
}