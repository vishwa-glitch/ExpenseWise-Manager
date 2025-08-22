# JSX Text Wrapping Compliance

A comprehensive system for detecting and fixing JSX text wrapping violations in React Native applications.

## Overview

React Native requires all text content to be wrapped in `<Text>` components. This tool systematically scans your codebase to identify instances where strings, numbers, or other text content is directly placed inside non-Text components like `View`, `Pressable`, `TouchableOpacity`, and `ScrollView`.

## Features

- **Comprehensive Scanning**: Analyzes TypeScript/JSX files using AST parsing
- **Intelligent Detection**: Identifies various forms of text content (literals, expressions, templates)
- **Style Migration**: Automatically migrates text-related styles from parent components
- **Code Transformation**: Generates corrected JSX with proper Text wrapping
- **Error Handling**: Robust error recovery and fallback mechanisms
- **Performance Optimized**: Caching and parallel processing for large codebases

## Installation

```bash
npm install jsx-text-wrapping-compliance
```

## Quick Start

```typescript
import { JSXScanner, ViolationDetector, CodeTransformer } from 'jsx-text-wrapping-compliance';

// Scan a file for violations
const scanner = new JSXScanner();
const result = await scanner.scanFile('./src/components/MyComponent.tsx');

console.log(`Found ${result.violations.length} violations`);
console.log(`Compliance score: ${result.complianceScore}%`);
```

## Architecture

The system consists of four main components:

1. **JSX Scanner Engine**: Parses TypeScript/JSX files using AST analysis
2. **Violation Detector**: Analyzes JSX elements for text content placement
3. **Style Migration Engine**: Extracts and migrates text-related styles
4. **Code Transformer**: Generates corrected JSX with proper Text wrapping

## Component Rules

### Restricted Components (Cannot contain direct text)
- `View`
- `Pressable`
- `TouchableOpacity`
- `TouchableHighlight`
- `ScrollView`
- `SafeAreaView`
- And more...

### Allowed Text Containers
- `Text`
- `TextInput`
- `Button` (special case)

## Usage Examples

### Scanning a Directory

```typescript
import { JSXScanner } from 'jsx-text-wrapping-compliance';

const scanner = new JSXScanner();
const results = await scanner.scanDirectory('./src');

results.forEach(result => {
  if (result.hasViolations) {
    console.log(`${result.filePath}: ${result.violations.length} violations`);
  }
});
```

### Transforming Code

```typescript
import { CodeTransformer } from 'jsx-text-wrapping-compliance';

const transformer = new CodeTransformer();
const result = await transformer.transformFile('./src/MyComponent.tsx', violations);

if (result.success) {
  console.log(`Applied ${result.appliedFixes} fixes`);
} else {
  console.error('Transformation failed:', result.errors);
}
```

### Custom Component Rules

```typescript
import { ViolationDetector, ComponentRules } from 'jsx-text-wrapping-compliance';

const customRules: ComponentRules = {
  restrictedComponents: ['View', 'CustomContainer'],
  allowedTextContainers: ['Text', 'CustomText'],
  specialCases: new Map([
    ['CustomButton', {
      allowDirectText: true,
      requiresTextWrapper: false
    }]
  ])
};

const detector = new ViolationDetector();
detector.setComponentRules(customRules);
```

## Configuration

### Scanner Configuration

```typescript
interface ScannerConfig {
  sourceDirectory: string;
  fileExtensions: string[];
  excludePatterns: string[];
  includePatterns: string[];
  maxFileSize: number;
  enableCaching: boolean;
}
```

### Transformer Configuration

```typescript
interface TransformerConfig {
  createBackups: boolean;
  preserveFormatting: boolean;
  validateAfterTransform: boolean;
  dryRun: boolean;
}
```

## Error Handling

The system provides comprehensive error handling with recovery strategies:

- **Parse Errors**: Skip file, manual review, or retry with fallback
- **Style Errors**: Use default styles or skip style migration
- **Transform Errors**: Simple wrapper or manual review required

## Performance

- **Caching**: AST parsing results and violation detection
- **Parallel Processing**: Concurrent file processing
- **Memory Management**: Efficient handling of large codebases

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Development

```bash
# Build the project
npm run build

# Build in watch mode
npm run build:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on the GitHub repository.