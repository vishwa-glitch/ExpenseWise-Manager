#!/usr/bin/env node
/**
 * CLI tool for JSX Text Wrapping Compliance checking
 * Scans React Native projects for text wrapping violations
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { ViolationDetector } from './detector/ViolationDetector';
import { TextWrappingViolation } from './types';

interface ScanOptions {
  sourceDir: string;
  extensions: string[];
  excludePatterns: string[];
  verbose: boolean;
}

class JSXComplianceChecker {
  private detector: ViolationDetector;
  private options: ScanOptions;

  constructor(options: ScanOptions) {
    this.detector = new ViolationDetector();
    this.options = options;
  }

  /**
   * Scans the project for JSX text wrapping violations
   */
  async scan(): Promise<{ violations: TextWrappingViolation[]; filesScanned: number }> {
    const violations: TextWrappingViolation[] = [];
    let filesScanned = 0;

    const files = this.findFiles(this.options.sourceDir);
    
    for (const filePath of files) {
      if (this.shouldSkipFile(filePath)) {
        continue;
      }

      try {
        const fileViolations = await this.scanFile(filePath);
        violations.push(...fileViolations);
        filesScanned++;
        
        if (this.options.verbose) {
          console.log(`✓ Scanned: ${filePath} (${fileViolations.length} violations)`);
        }
      } catch (error) {
        if (this.options.verbose) {
          console.warn(`⚠ Error scanning ${filePath}:`, error);
        }
      }
    }

    return { violations, filesScanned };
  }

  /**
   * Scans a single file for violations
   */
  private async scanFile(filePath: string): Promise<TextWrappingViolation[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const violations: TextWrappingViolation[] = [];

    const visitNode = (node: ts.Node) => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const nodeViolations = this.detector.detectViolations(node);
        violations.push(...nodeViolations);
      }
      ts.forEachChild(node, visitNode);
    };

    visitNode(sourceFile);
    return violations;
  }

  /**
   * Finds all relevant files in the source directory
   */
  private findFiles(dir: string): string[] {
    const files: string[] = [];
    
    const scanDirectory = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          if (!this.shouldSkipDirectory(entry.name)) {
            scanDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          if (this.isRelevantFile(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    };

    scanDirectory(dir);
    return files;
  }

  /**
   * Checks if a file should be skipped
   */
  private shouldSkipFile(filePath: string): boolean {
    return this.options.excludePatterns.some(pattern => 
      filePath.includes(pattern)
    );
  }

  /**
   * Checks if a directory should be skipped
   */
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = ['node_modules', '.git', '.expo', 'dist', 'build', '__tests__', '.next'];
    return skipDirs.includes(dirName);
  }

  /**
   * Checks if a file is relevant for scanning
   */
  private isRelevantFile(fileName: string): boolean {
    return this.options.extensions.some(ext => fileName.endsWith(ext));
  }

  /**
   * Formats violations for console output
   */
  static formatViolations(violations: TextWrappingViolation[]): string {
    if (violations.length === 0) {
      return '✅ No JSX text wrapping violations found!';
    }

    let output = `\n❌ Found ${violations.length} JSX text wrapping violation(s):\n\n`;
    
    // Group violations by file
    const violationsByFile = violations.reduce((acc, violation) => {
      const fileName = violation.id.split('-')[0] || 'unknown';
      if (!acc[fileName]) {
        acc[fileName] = [];
      }
      acc[fileName].push(violation);
      return acc;
    }, {} as Record<string, TextWrappingViolation[]>);

    for (const [fileName, fileViolations] of Object.entries(violationsByFile)) {
      output += `📄 ${fileName}:\n`;
      
      for (const violation of fileViolations) {
        output += `  ⚠ Line ${violation.line}:${violation.column} - ${violation.severity.toUpperCase()}\n`;
        output += `    Component: <${violation.parentComponent}>\n`;
        output += `    Text: "${violation.textContent}"\n`;
        output += `    Fix: ${violation.suggestedFix}\n\n`;
      }
    }

    output += `\n💡 These violations will cause "Text strings must be rendered within a <Text> component" errors at runtime.\n`;
    output += `   Fix them by wrapping text content in <Text> components.\n`;

    return output;
  }
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  const sourceDir = args[0] || './src';
  const verbose = args.includes('--verbose') || args.includes('-v');

  console.log('🔍 JSX Text Wrapping Compliance Checker');
  console.log(`📂 Scanning: ${path.resolve(sourceDir)}\n`);

  const options: ScanOptions = {
    sourceDir: path.resolve(sourceDir),
    extensions: ['.tsx', '.jsx', '.ts', '.js'],
    excludePatterns: ['node_modules', '.git', '__tests__', '.test.', '.spec.'],
    verbose
  };

  const checker = new JSXComplianceChecker(options);
  
  try {
    const { violations, filesScanned } = await checker.scan();
    
    console.log(`📊 Scanned ${filesScanned} files`);
    console.log(JSXComplianceChecker.formatViolations(violations));
    
    if (violations.length > 0) {
      process.exit(1); // Exit with error code to prevent app start
    } else {
      console.log('🎉 Ready to start your app!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error during compliance check:', error);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { JSXComplianceChecker, main };