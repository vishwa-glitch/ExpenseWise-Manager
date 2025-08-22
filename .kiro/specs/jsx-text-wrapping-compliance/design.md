# Design Document

## Overview

The JSX Text Wrapping Compliance system is designed to systematically identify, analyze, and fix instances where text content is not properly wrapped in React Native Text components. This system will scan the entire codebase, detect violations, and provide automated fixes while preserving existing styling and functionality.

## Architecture

### Core Components

1. **JSX Scanner Engine**
   - Parses TypeScript/JSX files using AST (Abstract Syntax Tree) analysis
   - Identifies React Native components that should not contain direct text
   - Detects string literals, template literals, and numeric values in JSX

2. **Violation Detector**
   - Analyzes JSX elements for text content placement
   - Identifies parent components that need text wrapping
   - Categorizes violations by severity and component type

3. **Style Migration Engine**
   - Extracts relevant text-related styles from parent components
   - Applies appropriate styles to newly created Text components
   - Preserves layout and visual consistency

4. **Code Transformer**
   - Generates corrected JSX with proper Text wrapping
   - Maintains existing code formatting and structure
   - Handles complex nested component scenarios

## Components and Interfaces

### JSXScanner Interface

```typescript
interface JSXScanner {
  scanFile(filePath: string): Promise<ScanResult>;
  scanDirectory(dirPath: string): Promise<ScanResult[]>;
  parseJSXElement(element: JSXElement): ElementAnalysis;
}

interface ScanResult {
  filePath: string;
  violations: TextWrappingViolation[];
  totalElements: number;
  hasViolations: boolean;
}

interface TextWrappingViolation {
  line: number;
  column: number;
  parentComponent: string;
  textContent: string;
  violationType: 'string_literal' | 'template_literal' | 'numeric' | 'expression';
  severity: 'high' | 'medium' | 'low';
  suggestedFix: string;
}
```

### ViolationDetector Interface

```typescript
interface ViolationDetector {
  detectViolations(jsxElement: JSXElement): TextWrappingViolation[];
  isTextContainer(componentName: string): boolean;
  shouldWrapText(parentComponent: string, textContent: string): boolean;
}

interface ComponentRules {
  restrictedComponents: string[]; // View, Pressable, TouchableOpacity, ScrollView
  allowedTextContainers: string[]; // Text, TextInput
  specialCases: Map<string, TextWrappingRule>;
}
```

### StyleMigrator Interface

```typescript
interface StyleMigrator {
  extractTextStyles(parentStyles: StyleObject): TextStyles;
  migrateStyles(violation: TextWrappingViolation): StyleMigration;
  preserveLayout(originalElement: JSXElement, newElement: JSXElement): JSXElement;
}

interface StyleMigration {
  parentStylesRemoved: string[];
  textStylesAdded: StyleObject;
  layoutPreserved: boolean;
}
```

### CodeTransformer Interface

```typescript
interface CodeTransformer {
  transformFile(filePath: string, violations: TextWrappingViolation[]): Promise<TransformResult>;
  wrapTextContent(violation: TextWrappingViolation): string;
  preserveFormatting(originalCode: string, transformedCode: string): string;
}

interface TransformResult {
  success: boolean;
  transformedCode: string;
  appliedFixes: number;
  errors: TransformError[];
}
```

## Data Models

### File Analysis Model

```typescript
interface FileAnalysis {
  filePath: string;
  lastModified: Date;
  totalLines: number;
  jsxElements: JSXElementInfo[];
  violations: TextWrappingViolation[];
  complianceScore: number; // 0-100
}

interface JSXElementInfo {
  componentName: string;
  startLine: number;
  endLine: number;
  hasTextContent: boolean;
  isCompliant: boolean;
  children: JSXElementInfo[];
}
```

### Fix Application Model

```typescript
interface FixApplication {
  violationId: string;
  originalCode: string;
  fixedCode: string;
  styleChanges: StyleChange[];
  confidence: number; // 0-100
  requiresManualReview: boolean;
}

interface StyleChange {
  property: string;
  oldValue: string;
  newValue: string;
  location: 'parent' | 'text';
}
```

## Error Handling

### Error Categories

1. **Parse Errors**
   - Invalid JSX syntax
   - TypeScript compilation errors
   - Malformed component structures

2. **Style Migration Errors**
   - Conflicting style properties
   - Complex style calculations
   - Dynamic style dependencies

3. **Transform Errors**
   - Code generation failures
   - Formatting preservation issues
   - Import statement conflicts

### Error Recovery Strategy

```typescript
interface ErrorHandler {
  handleParseError(error: ParseError): RecoveryAction;
  handleStyleError(error: StyleError): StyleFallback;
  handleTransformError(error: TransformError): TransformFallback;
}

enum RecoveryAction {
  SKIP_FILE = 'skip_file',
  MANUAL_REVIEW = 'manual_review',
  PARTIAL_FIX = 'partial_fix',
  RETRY_WITH_FALLBACK = 'retry_with_fallback'
}
```

## Testing Strategy

### Unit Testing

1. **Scanner Tests**
   - Test JSX parsing accuracy
   - Verify violation detection logic
   - Test edge cases with complex JSX structures

2. **Style Migration Tests**
   - Test style extraction and application
   - Verify layout preservation
   - Test with various style configurations

3. **Transformer Tests**
   - Test code generation accuracy
   - Verify formatting preservation
   - Test with different component patterns

### Integration Testing

1. **End-to-End Workflow Tests**
   - Test complete scan-to-fix pipeline
   - Verify file system operations
   - Test batch processing capabilities

2. **Real Codebase Tests**
   - Test against actual project files
   - Verify no functional regressions
   - Test visual consistency preservation

### Performance Testing

1. **Large File Handling**
   - Test with files containing hundreds of components
   - Measure memory usage during processing
   - Test concurrent file processing

2. **Batch Processing Performance**
   - Test directory scanning speed
   - Measure transformation throughput
   - Test resource utilization

## Implementation Details

### AST Parsing Strategy

The system will use TypeScript's compiler API to parse JSX files:

```typescript
import * as ts from 'typescript';

class JSXParser {
  parseFile(filePath: string): ts.SourceFile {
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    return ts.createSourceFile(
      filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
  }

  visitJSXElements(node: ts.Node): JSXElementInfo[] {
    const elements: JSXElementInfo[] = [];
    
    const visit = (node: ts.Node) => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        elements.push(this.analyzeJSXElement(node));
      }
      ts.forEachChild(node, visit);
    };
    
    visit(node);
    return elements;
  }
}
```

### Text Content Detection

The system will identify various forms of text content:

```typescript
class TextContentDetector {
  detectTextContent(node: ts.JsxChild): TextContent | null {
    if (ts.isJsxText(node)) {
      return {
        type: 'text_literal',
        content: node.text.trim(),
        needsWrapping: node.text.trim().length > 0
      };
    }
    
    if (ts.isJsxExpression(node) && node.expression) {
      return this.analyzeExpression(node.expression);
    }
    
    return null;
  }
  
  analyzeExpression(expr: ts.Expression): TextContent | null {
    if (ts.isStringLiteral(expr) || ts.isNumericLiteral(expr)) {
      return {
        type: 'literal_expression',
        content: expr.text,
        needsWrapping: true
      };
    }
    
    if (ts.isTemplateExpression(expr)) {
      return {
        type: 'template_literal',
        content: this.extractTemplateContent(expr),
        needsWrapping: true
      };
    }
    
    return null;
  }
}
```

### Style Migration Logic

The system will intelligently migrate text-related styles:

```typescript
class StyleMigrator {
  private textRelatedStyles = [
    'color', 'fontSize', 'fontWeight', 'fontFamily', 'fontStyle',
    'textAlign', 'textDecorationLine', 'textTransform', 'lineHeight',
    'letterSpacing', 'textShadowColor', 'textShadowOffset', 'textShadowRadius'
  ];
  
  migrateStyles(parentStyles: StyleObject): StyleMigration {
    const textStyles: StyleObject = {};
    const remainingParentStyles: StyleObject = {};
    
    Object.entries(parentStyles).forEach(([key, value]) => {
      if (this.textRelatedStyles.includes(key)) {
        textStyles[key] = value;
      } else {
        remainingParentStyles[key] = value;
      }
    });
    
    return {
      textStyles,
      remainingParentStyles,
      migrationApplied: Object.keys(textStyles).length > 0
    };
  }
}
```

### Code Generation

The system will generate properly formatted JSX:

```typescript
class CodeGenerator {
  wrapTextInComponent(
    textContent: string,
    textStyles: StyleObject,
    indentation: string
  ): string {
    const styleString = this.generateStyleString(textStyles);
    const hasStyles = Object.keys(textStyles).length > 0;
    
    if (hasStyles) {
      return `${indentation}<Text style={${styleString}}>${textContent}</Text>`;
    } else {
      return `${indentation}<Text>${textContent}</Text>`;
    }
  }
  
  generateStyleString(styles: StyleObject): string {
    if (Object.keys(styles).length === 0) return '{}';
    
    const styleEntries = Object.entries(styles)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
    
    return `{${styleEntries}}`;
  }
}
```

## Security Considerations

1. **File System Access**
   - Validate file paths to prevent directory traversal
   - Implement read/write permission checks
   - Create backup files before modifications

2. **Code Injection Prevention**
   - Sanitize generated code content
   - Validate JSX structure before transformation
   - Prevent execution of dynamic code during analysis

3. **Data Validation**
   - Validate all input parameters
   - Sanitize file content before processing
   - Implement bounds checking for array operations

## Performance Optimizations

1. **Caching Strategy**
   - Cache parsed AST results for unchanged files
   - Store violation detection results
   - Cache style migration patterns

2. **Parallel Processing**
   - Process multiple files concurrently
   - Use worker threads for CPU-intensive operations
   - Implement queue-based batch processing

3. **Memory Management**
   - Stream large files instead of loading entirely
   - Dispose of AST objects after processing
   - Implement garbage collection hints