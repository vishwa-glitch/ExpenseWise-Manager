/**
 * Jest test setup file
 */

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock file system operations for testing
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
}));

// Mock TypeScript compiler API
jest.mock('typescript', () => ({
  createSourceFile: jest.fn(),
  ScriptTarget: {
    Latest: 'Latest'
  },
  ScriptKind: {
    TSX: 'TSX'
  },
  SyntaxKind: {
    JsxElement: 'JsxElement',
    JsxSelfClosingElement: 'JsxSelfClosingElement',
    JsxText: 'JsxText',
    JsxExpression: 'JsxExpression',
    StringLiteral: 'StringLiteral',
    NumericLiteral: 'NumericLiteral',
    TemplateExpression: 'TemplateExpression'
  },
  isJsxElement: jest.fn(),
  isJsxSelfClosingElement: jest.fn(),
  isJsxText: jest.fn(),
  isJsxExpression: jest.fn(),
  isStringLiteral: jest.fn(),
  isNumericLiteral: jest.fn(),
  isTemplateExpression: jest.fn(),
  forEachChild: jest.fn(),
}));

// Test timeout
jest.setTimeout(10000);