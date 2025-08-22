/**
 * Core types and interfaces for JSX Text Wrapping Compliance system
 */

// Violation Types
export type ViolationType = 'string_literal' | 'template_literal' | 'numeric' | 'expression';
export type ViolationSeverity = 'high' | 'medium' | 'low';
export type RecoveryAction = 'skip_file' | 'manual_review' | 'partial_fix' | 'retry_with_fallback';
export type StyleLocation = 'parent' | 'text';

// Core Data Structures
export interface TextWrappingViolation {
  id: string;
  line: number;
  column: number;
  parentComponent: string;
  textContent: string;
  violationType: ViolationType;
  severity: ViolationSeverity;
  suggestedFix: string;
}

export interface ScanResult {
  filePath: string;
  violations: TextWrappingViolation[];
  totalElements: number;
  hasViolations: boolean;
  complianceScore: number;
  scanTimestamp: Date;
}

export interface JSXElementInfo {
  componentName: string;
  startLine: number;
  endLine: number;
  hasTextContent: boolean;
  isCompliant: boolean;
  children: JSXElementInfo[];
}

export interface FileAnalysis {
  filePath: string;
  lastModified: Date;
  totalLines: number;
  jsxElements: JSXElementInfo[];
  violations: TextWrappingViolation[];
  complianceScore: number;
}

// Style Migration Types
export interface StyleObject {
  [key: string]: any;
}

export interface TextStyles extends StyleObject {
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: string;
  textAlign?: string;
  textDecorationLine?: string;
  textTransform?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textShadowColor?: string;
  textShadowOffset?: { width: number; height: number };
  textShadowRadius?: number;
}

export interface StyleMigration {
  parentStylesRemoved: string[];
  textStylesAdded: StyleObject;
  layoutPreserved: boolean;
}

export interface StyleChange {
  property: string;
  oldValue: string;
  newValue: string;
  location: StyleLocation;
}

// Transform Types
export interface TransformResult {
  success: boolean;
  transformedCode: string;
  appliedFixes: number;
  errors: TransformError[];
}

export interface FixApplication {
  violationId: string;
  originalCode: string;
  fixedCode: string;
  styleChanges: StyleChange[];
  confidence: number;
  requiresManualReview: boolean;
}

// Error Types
export interface ParseError {
  type: 'parse_error';
  message: string;
  filePath: string;
  line?: number;
  column?: number;
}

export interface StyleError {
  type: 'style_error';
  message: string;
  property: string;
  value: any;
}

export interface TransformError {
  type: 'transform_error';
  message: string;
  violationId: string;
  originalCode: string;
}

export type ComplianceError = ParseError | StyleError | TransformError;

// Component Rules
export interface TextWrappingRule {
  allowDirectText: boolean;
  requiresTextWrapper: boolean;
  specialHandling?: (content: string) => boolean;
}

export interface ComponentRules {
  restrictedComponents: string[];
  allowedTextContainers: string[];
  specialCases: Map<string, TextWrappingRule>;
}

// Text Content Analysis
export interface TextContent {
  type: 'text_literal' | 'literal_expression' | 'template_literal';
  content: string;
  needsWrapping: boolean;
}

export interface ElementAnalysis {
  componentName: string;
  hasDirectText: boolean;
  textContent: TextContent[];
  violations: TextWrappingViolation[];
  isCompliant: boolean;
}

// Configuration Types
export interface ScannerConfig {
  sourceDirectory: string;
  fileExtensions: string[];
  excludePatterns: string[];
  includePatterns: string[];
  maxFileSize: number;
  enableCaching: boolean;
}

export interface TransformerConfig {
  createBackups: boolean;
  preserveFormatting: boolean;
  validateAfterTransform: boolean;
  dryRun: boolean;
}

export interface ComplianceConfig {
  scanner: ScannerConfig;
  transformer: TransformerConfig;
  componentRules: ComponentRules;
}