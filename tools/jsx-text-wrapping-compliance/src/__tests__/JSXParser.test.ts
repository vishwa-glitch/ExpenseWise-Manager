/**
 * Unit tests for JSXParser class
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import { JSXParser } from '../parser/JSXParser';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('JSXParser', () => {
  let parser: JSXParser;
  
  beforeEach(() => {
    parser = new JSXParser();
    jest.clearAllMocks();
  });

  describe('parseFile', () => {
    it('should throw error for non-existent file', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      expect(() => parser.parseFile('nonexistent.tsx')).toThrow('File not found: nonexistent.tsx');
    });

    it('should have TypeScript compiler API available', () => {
      expect(ts).toBeDefined();
      expect(typeof ts.createSourceFile).toBe('function');
      expect(typeof ts.forEachChild).toBe('function');
      expect(typeof ts.ScriptTarget).toBe('object');
    });
  });

  describe('basic functionality', () => {
    it('should create parser instance', () => {
      expect(parser).toBeDefined();
      expect(typeof parser.parseFile).toBe('function');
      expect(typeof parser.traverseJSXElements).toBe('function');
      expect(typeof parser.analyzeJSXElement).toBe('function');
      expect(typeof parser.detectTextContent).toBe('function');
    });

    it('should handle empty source files', () => {
      const sourceFile = ts.createSourceFile('empty.tsx', '', ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const elements = parser.traverseJSXElements(sourceFile);
      
      expect(elements).toBeDefined();
      expect(Array.isArray(elements)).toBe(true);
      expect(elements.length).toBe(0);
    });
  });
});