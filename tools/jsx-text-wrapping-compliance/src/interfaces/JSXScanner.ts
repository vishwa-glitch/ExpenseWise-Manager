/**
 * JSX Scanner Interface
 * Defines the contract for scanning JSX files and detecting text wrapping violations
 */

import * as ts from 'typescript';
import { ScanResult, ElementAnalysis, ScannerConfig } from '../types';

export interface JSXScanner {
  /**
   * Scans a single file for JSX text wrapping violations
   * @param filePath Path to the file to scan
   * @returns Promise resolving to scan results
   */
  scanFile(filePath: string): Promise<ScanResult>;

  /**
   * Scans all files in a directory for JSX text wrapping violations
   * @param dirPath Path to the directory to scan
   * @returns Promise resolving to array of scan results
   */
  scanDirectory(dirPath: string): Promise<ScanResult[]>;

  /**
   * Parses and analyzes a JSX element for text content violations
   * @param element JSX element to analyze
   * @returns Analysis results for the element
   */
  parseJSXElement(element: ts.JsxElement | ts.JsxSelfClosingElement): ElementAnalysis;

  /**
   * Configures the scanner with specific settings
   * @param config Scanner configuration options
   */
  configure(config: Partial<ScannerConfig>): void;

  /**
   * Gets the current scanner configuration
   * @returns Current scanner configuration
   */
  getConfiguration(): ScannerConfig;
}