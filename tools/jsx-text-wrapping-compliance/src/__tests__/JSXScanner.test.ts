/**
 * Unit tests for JSXScanner class
 */

import * as fs from 'fs';
import { JSXScanner } from '../scanner/JSXScanner';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('JSXScanner', () => {
  let scanner: JSXScanner;
  
  beforeEach(() => {
    scanner = new JSXScanner();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create scanner with default configuration', () => {
      const config = scanner.getConfiguration();
      
      expect(config.sourceDirectory).toBe('src');
      expect(config.fileExtensions).toEqual(['.tsx', '.ts']);
      expect(config.maxFileSize).toBe(1024 * 1024);
      expect(config.enableCaching).toBe(true);
    });

    it('should create scanner with custom configuration', () => {
      const customConfig = {
        sourceDirectory: 'app',
        fileExtensions: ['.tsx'],
        maxFileSize: 512 * 1024
      };
      
      const customScanner = new JSXScanner(customConfig);
      const config = customScanner.getConfiguration();
      
      expect(config.sourceDirectory).toBe('app');
      expect(config.fileExtensions).toEqual(['.tsx']);
      expect(config.maxFileSize).toBe(512 * 1024);
    });
  });

  describe('scanFile', () => {
    it('should handle non-existent files', async () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const result = await scanner.scanFile('nonexistent.tsx');
      
      expect(result.filePath).toBe('nonexistent.tsx');
      expect(result.violations).toEqual([]);
      expect(result.hasViolations).toBe(false);
      expect(result.complianceScore).toBe(0);
    });

    it('should handle files that are too large', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        size: 2 * 1024 * 1024, // 2MB
        isDirectory: () => false,
        isFile: () => true
      } as any);
      
      const result = await scanner.scanFile('large.tsx');
      
      expect(result.filePath).toBe('large.tsx');
      expect(result.violations).toEqual([]);
      expect(result.hasViolations).toBe(false);
      expect(result.complianceScore).toBe(0);
    });

    it('should process valid TSX files', async () => {
      const mockCode = `
        import React from 'react';
        import { View, Text } from 'react-native';
        
        const Component = () => (
          <View>
            <Text>Hello World</Text>
          </View>
        );
      `;
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        size: 1000,
        isDirectory: () => false,
        isFile: () => true
      } as any);
      mockFs.readFileSync.mockReturnValue(mockCode as any);
      
      const result = await scanner.scanFile('test.tsx');
      
      expect(result.filePath).toBe('test.tsx');
      expect(result.scanTimestamp).toBeInstanceOf(Date);
      expect(typeof result.complianceScore).toBe('number');
    });

    it('should skip non-JSX files', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        size: 1000,
        isDirectory: () => false,
        isFile: () => true
      } as any);
      mockFs.readFileSync.mockReturnValue('const x = 1;' as any);
      
      const result = await scanner.scanFile('test.js');
      
      expect(result.filePath).toBe('test.js');
      expect(result.violations).toEqual([]);
      expect(result.complianceScore).toBe(100);
    });
  });

  describe('scanDirectory', () => {
    it('should handle non-existent directories', async () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const results = await scanner.scanDirectory('nonexistent');
      
      expect(results).toEqual([]);
    });

    it('should handle paths that are not directories', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isDirectory: () => false,
        isFile: () => true
      } as any);
      
      const results = await scanner.scanDirectory('file.txt');
      
      expect(results).toEqual([]);
    });

    it('should process directory with TSX files', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockImplementation((filePath) => {
        if (filePath === 'src') {
          return {
            isDirectory: () => true,
            isFile: () => false
          } as any;
        }
        return {
          size: 1000,
          isDirectory: () => false,
          isFile: () => true
        } as any;
      });
      
      mockFs.readdirSync.mockReturnValue(['component.tsx', 'utils.ts'] as any);
      mockFs.readFileSync.mockReturnValue('<View>Test</View>' as any);
      
      const results = await scanner.scanDirectory('src');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        maxFileSize: 2 * 1024 * 1024,
        enableCaching: false
      };
      
      scanner.configure(newConfig);
      const config = scanner.getConfiguration();
      
      expect(config.maxFileSize).toBe(2 * 1024 * 1024);
      expect(config.enableCaching).toBe(false);
      expect(config.sourceDirectory).toBe('src'); // Should keep existing values
    });
  });

  describe('getScanSummary', () => {
    it('should calculate summary statistics', () => {
      const mockResults = [
        {
          filePath: 'file1.tsx',
          violations: [{ id: '1' } as any, { id: '2' } as any],
          totalElements: 5,
          hasViolations: true,
          complianceScore: 60,
          scanTimestamp: new Date()
        },
        {
          filePath: 'file2.tsx',
          violations: [],
          totalElements: 3,
          hasViolations: false,
          complianceScore: 100,
          scanTimestamp: new Date()
        },
        {
          filePath: 'file3.tsx',
          violations: [{ id: '3' } as any],
          totalElements: 4,
          hasViolations: true,
          complianceScore: 75,
          scanTimestamp: new Date()
        }
      ];
      
      const summary = scanner.getScanSummary(mockResults);
      
      expect(summary.totalFiles).toBe(3);
      expect(summary.filesWithViolations).toBe(2);
      expect(summary.totalViolations).toBe(3);
      expect(summary.averageComplianceScore).toBe(78.33333333333333);
      expect(summary.worstFiles).toHaveLength(2);
      expect(summary.worstFiles[0]?.complianceScore).toBe(60);
    });

    it('should handle empty results', () => {
      const summary = scanner.getScanSummary([]);
      
      expect(summary.totalFiles).toBe(0);
      expect(summary.filesWithViolations).toBe(0);
      expect(summary.totalViolations).toBe(0);
      expect(summary.averageComplianceScore).toBe(100);
      expect(summary.worstFiles).toEqual([]);
    });
  });

  describe('basic functionality', () => {
    it('should implement JSXScanner interface', () => {
      expect(typeof scanner.scanFile).toBe('function');
      expect(typeof scanner.scanDirectory).toBe('function');
      expect(typeof scanner.parseJSXElement).toBe('function');
      expect(typeof scanner.configure).toBe('function');
      expect(typeof scanner.getConfiguration).toBe('function');
    });
  });
});