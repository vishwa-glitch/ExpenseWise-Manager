/**
 * JSXScanner - Service for scanning files and directories for JSX text wrapping violations
 * 
 * This service provides functionality to scan individual files or entire directories
 * for JSX text wrapping compliance issues, with progress tracking and error handling.
 */

import * as fs from 'fs';
import * as path from 'path';
import { JSXParser } from '../parser/JSXParser';
import { 
  ScanResult, 
  ElementAnalysis, 
  ScannerConfig,
  TextWrappingViolation
} from '../types';
import { JSXScanner as IJSXScanner } from '../interfaces/JSXScanner';

export class JSXScanner implements IJSXScanner {
  private parser: JSXParser;
  private config: ScannerConfig;

  constructor(config?: Partial<ScannerConfig>) {
    this.parser = new JSXParser();
    this.config = {
      sourceDirectory: 'src',
      fileExtensions: ['.tsx', '.ts'],
      excludePatterns: ['node_modules/**', '**/*.test.*', '**/*.spec.*', '**/dist/**'],
      includePatterns: ['**/*.tsx', '**/*.ts'],
      maxFileSize: 1024 * 1024, // 1MB
      enableCaching: true,
      ...config
    };
  }

  /**
   * Scans a single file for JSX text wrapping violations
   * @param filePath Path to the file to scan
   * @returns Promise resolving to scan results
   */
  public async scanFile(filePath: string): Promise<ScanResult> {
    try {
      // Validate file exists and is readable
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const stats = fs.statSync(filePath);
      if (stats.size > this.config.maxFileSize) {
        throw new Error(`File too large: ${filePath} (${stats.size} bytes)`);
      }

      // Check if file should be processed
      if (!this.shouldProcessFile(filePath)) {
        return this.createEmptyScanResult(filePath);
      }

      // Parse the file
      const sourceFile = this.parser.parseFile(filePath);
      
      // Traverse and analyze JSX elements
      const elements = this.parser.traverseJSXElements(sourceFile);
      
      // Collect all violations
      const violations: TextWrappingViolation[] = [];
      elements.forEach(element => {
        violations.push(...element.violations);
      });

      // Calculate compliance score
      const totalElements = elements.length;
      const compliantElements = elements.filter(el => el.isCompliant).length;
      const complianceScore = totalElements > 0 ? (compliantElements / totalElements) * 100 : 100;

      return {
        filePath,
        violations,
        totalElements,
        hasViolations: violations.length > 0,
        complianceScore,
        scanTimestamp: new Date()
      };

    } catch (error) {
      // Return error result
      return {
        filePath,
        violations: [],
        totalElements: 0,
        hasViolations: false,
        complianceScore: 0,
        scanTimestamp: new Date()
      };
    }
  }

  /**
   * Scans all files in a directory for JSX text wrapping violations
   * @param dirPath Path to the directory to scan
   * @returns Promise resolving to array of scan results
   */
  public async scanDirectory(dirPath: string): Promise<ScanResult[]> {
    try {
      if (!fs.existsSync(dirPath)) {
        throw new Error(`Directory not found: ${dirPath}`);
      }

      const stats = fs.statSync(dirPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${dirPath}`);
      }

      // Get all files to process
      const filesToProcess = this.getFilesToProcess(dirPath);
      
      // Process files with progress tracking
      const results: ScanResult[] = [];
      let processedCount = 0;

      for (const filePath of filesToProcess) {
        try {
          const result = await this.scanFile(filePath);
          results.push(result);
          processedCount++;

          // Log progress every 10 files
          if (processedCount % 10 === 0) {
            console.log(`Processed ${processedCount}/${filesToProcess.length} files`);
          }
        } catch (error) {
          console.warn(`Error processing file ${filePath}:`, error);
          // Continue processing other files
        }
      }

      console.log(`Scan complete: ${processedCount} files processed`);
      return results;

    } catch (error) {
      console.error('Error scanning directory:', error);
      return [];
    }
  }

  /**
   * Parses and analyzes a JSX element for text content violations
   * @param element JSX element to analyze
   * @returns Analysis results for the element
   */
  public parseJSXElement(element: any): ElementAnalysis {
    return this.parser.analyzeJSXElement(element);
  }

  /**
   * Configures the scanner with specific settings
   * @param config Scanner configuration options
   */
  public configure(config: Partial<ScannerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current scanner configuration
   * @returns Current scanner configuration
   */
  public getConfiguration(): ScannerConfig {
    return { ...this.config };
  }

  /**
   * Determines if a file should be processed based on configuration
   * @param filePath Path to the file
   * @returns True if file should be processed
   */
  private shouldProcessFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    
    // Check file extension
    if (!this.config.fileExtensions.includes(ext)) {
      return false;
    }

    // Check exclude patterns
    for (const pattern of this.config.excludePatterns) {
      if (this.matchesPattern(filePath, pattern)) {
        return false;
      }
    }

    // Check include patterns
    if (this.config.includePatterns.length > 0) {
      let matches = false;
      for (const pattern of this.config.includePatterns) {
        if (this.matchesPattern(filePath, pattern)) {
          matches = true;
          break;
        }
      }
      if (!matches) {
        return false;
      }
    }

    // Check if file contains JSX content (basic check)
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.includes('<') && content.includes('>');
    } catch {
      return false;
    }
  }

  /**
   * Simple pattern matching for file paths
   * @param filePath File path to test
   * @param pattern Glob-like pattern
   * @returns True if path matches pattern
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(regexPattern);
    return regex.test(filePath.replace(/\\/g, '/'));
  }

  /**
   * Gets all files to process in a directory
   * @param dirPath Directory path
   * @returns Array of file paths to process
   */
  private getFilesToProcess(dirPath: string): string[] {
    const files: string[] = [];
    
    const traverse = (currentPath: string) => {
      try {
        const entries = fs.readdirSync(currentPath);
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry);
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory()) {
            // Skip excluded directories
            if (!this.shouldProcessFile(fullPath)) {
              continue;
            }
            traverse(fullPath);
          } else if (stats.isFile()) {
            if (this.shouldProcessFile(fullPath)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Error reading directory ${currentPath}:`, error);
      }
    };

    traverse(dirPath);
    return files;
  }

  /**
   * Creates an empty scan result for files that don't need processing
   * @param filePath File path
   * @returns Empty scan result
   */
  private createEmptyScanResult(filePath: string): ScanResult {
    return {
      filePath,
      violations: [],
      totalElements: 0,
      hasViolations: false,
      complianceScore: 100,
      scanTimestamp: new Date()
    };
  }

  /**
   * Gets summary statistics for scan results
   * @param results Array of scan results
   * @returns Summary statistics
   */
  public getScanSummary(results: ScanResult[]): {
    totalFiles: number;
    filesWithViolations: number;
    totalViolations: number;
    averageComplianceScore: number;
    worstFiles: ScanResult[];
  } {
    const totalFiles = results.length;
    const filesWithViolations = results.filter(r => r.hasViolations).length;
    const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);
    const averageComplianceScore = results.length > 0 
      ? results.reduce((sum, r) => sum + r.complianceScore, 0) / results.length 
      : 100;
    
    // Get worst 5 files by compliance score
    const worstFiles = results
      .filter(r => r.hasViolations)
      .sort((a, b) => a.complianceScore - b.complianceScore)
      .slice(0, 5);

    return {
      totalFiles,
      filesWithViolations,
      totalViolations,
      averageComplianceScore,
      worstFiles
    };
  }
}