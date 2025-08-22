/**
 * JSXParser - TypeScript AST-based JSX parser for text wrapping compliance
 * 
 * This class provides functionality to parse JSX files using TypeScript's compiler API,
 * traverse JSX elements, and detect text content that needs to be wrapped in Text components.
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { 
  ElementAnalysis, 
  TextContent, 
  TextWrappingViolation, 
  ViolationType, 
  ViolationSeverity 
} from '../types';
import { ViolationType as ViolationTypeEnum, ViolationSeverity as ViolationSeverityEnum } from '../enums';

export class JSXParser {
  private restrictedComponents = new Set(['View', 'Pressable', 'TouchableOpacity', 'ScrollView']);

  /**
   * Parses a TypeScript/JSX file and returns the AST
   * @param filePath Path to the file to parse
   * @returns TypeScript SourceFile AST
   */
  public parseFile(filePath: string): ts.SourceFile {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    return ts.createSourceFile(
      fileName,
      sourceCode,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
  }

  /**
   * Traverses JSX elements in the AST and extracts component information
   * @param sourceFile TypeScript SourceFile to traverse
   * @returns Array of JSX element analyses
   */
  public traverseJSXElements(sourceFile: ts.SourceFile): ElementAnalysis[] {
    const elements: ElementAnalysis[] = [];
    
    const visit = (node: ts.Node) => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const analysis = this.analyzeJSXElement(node);
        elements.push(analysis);
      }
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    return elements;
  }

  /**
   * Analyzes a JSX element for text content violations
   * @param element JSX element to analyze
   * @returns Element analysis with violation information
   */
  public analyzeJSXElement(element: ts.JsxElement | ts.JsxSelfClosingElement): ElementAnalysis {
    const componentName = this.getComponentName(element);
    const textContent = this.extractTextContent(element);
    const violations = this.detectViolations(element, componentName, textContent);
    
    return {
      componentName,
      hasDirectText: textContent.length > 0,
      textContent,
      violations,
      isCompliant: violations.length === 0
    };
  }

  /**
   * Detects JSX text content in various forms (literals, expressions, templates)
   * @param element JSX element to analyze
   * @returns Array of detected text content
   */
  public detectTextContent(element: ts.JsxElement | ts.JsxSelfClosingElement): TextContent[] {
    return this.extractTextContent(element);
  }

  /**
   * Gets the component name from a JSX element
   * @param element JSX element
   * @returns Component name as string
   */
  private getComponentName(element: ts.JsxElement | ts.JsxSelfClosingElement): string {
    const tagName = ts.isJsxElement(element) 
      ? element.openingElement.tagName 
      : element.tagName;
    
    if (ts.isIdentifier(tagName)) {
      return tagName.text;
    }
    
    if (ts.isPropertyAccessExpression(tagName)) {
      return tagName.getText();
    }
    
    return 'Unknown';
  }

  /**
   * Extracts text content from JSX element children
   * @param element JSX element to analyze
   * @returns Array of text content found
   */
  private extractTextContent(element: ts.JsxElement | ts.JsxSelfClosingElement): TextContent[] {
    const textContent: TextContent[] = [];
    
    if (ts.isJsxSelfClosingElement(element)) {
      return textContent; // Self-closing elements don't have text content
    }
    
    // Analyze children of JSX element
    element.children.forEach(child => {
      const content = this.analyzeJSXChild(child);
      if (content) {
        textContent.push(content);
      }
    });
    
    return textContent;
  }

  /**
   * Analyzes a JSX child node for text content
   * @param child JSX child node
   * @returns Text content if found, null otherwise
   */
  private analyzeJSXChild(child: ts.JsxChild): TextContent | null {
    if (ts.isJsxText(child)) {
      const text = child.text.trim();
      if (text.length > 0) {
        return {
          type: 'text_literal',
          content: text,
          needsWrapping: true
        };
      }
    }
    
    if (ts.isJsxExpression(child) && child.expression) {
      return this.analyzeExpression(child.expression);
    }
    
    return null;
  }

  /**
   * Analyzes a JSX expression for text content
   * @param expr Expression to analyze
   * @returns Text content if expression contains text, null otherwise
   */
  private analyzeExpression(expr: ts.Expression): TextContent | null {
    if (ts.isStringLiteral(expr)) {
      return {
        type: 'literal_expression',
        content: expr.text,
        needsWrapping: true
      };
    }
    
    if (ts.isNumericLiteral(expr)) {
      return {
        type: 'literal_expression',
        content: expr.text,
        needsWrapping: true
      };
    }
    
    if (ts.isTemplateExpression(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      return {
        type: 'template_literal',
        content: this.extractTemplateContent(expr),
        needsWrapping: true
      };
    }
    
    // Check for simple variable references that might contain text
    if (ts.isIdentifier(expr)) {
      return {
        type: 'literal_expression',
        content: expr.text,
        needsWrapping: true
      };
    }
    
    // Check for property access expressions (e.g., item.name)
    if (ts.isPropertyAccessExpression(expr)) {
      return {
        type: 'literal_expression',
        content: expr.getText(),
        needsWrapping: true
      };
    }
    
    return null;
  }

  /**
   * Extracts content from template literals
   * @param template Template literal expression
   * @returns String representation of template content
   */
  private extractTemplateContent(template: ts.TemplateExpression | ts.NoSubstitutionTemplateLiteral): string {
    if (ts.isNoSubstitutionTemplateLiteral(template)) {
      return template.text;
    }
    
    // For template expressions, return a simplified representation
    return template.getText();
  }

  /**
   * Detects violations in JSX elements
   * @param element JSX element
   * @param componentName Name of the component
   * @param textContent Array of text content found
   * @returns Array of violations detected
   */
  private detectViolations(
    element: ts.JsxElement | ts.JsxSelfClosingElement,
    componentName: string,
    textContent: TextContent[]
  ): TextWrappingViolation[] {
    const violations: TextWrappingViolation[] = [];
    
    // Only check restricted components
    if (!this.restrictedComponents.has(componentName)) {
      return violations;
    }
    
    textContent.forEach((content, index) => {
      const sourceFile = element.getSourceFile();
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(element.getStart());
      
      const violation: TextWrappingViolation = {
        id: `${sourceFile.fileName}-${line}-${character}-${index}`,
        line: line + 1, // Convert to 1-based line numbers
        column: character + 1, // Convert to 1-based column numbers
        parentComponent: componentName,
        textContent: content.content,
        violationType: this.mapContentTypeToViolationType(content.type),
        severity: this.determineSeverity(componentName, content),
        suggestedFix: this.generateSuggestedFix(content)
      };
      
      violations.push(violation);
    });
    
    return violations;
  }

  /**
   * Maps content type to violation type
   * @param contentType Type of text content
   * @returns Corresponding violation type
   */
  private mapContentTypeToViolationType(contentType: string): ViolationType {
    switch (contentType) {
      case 'text_literal':
        return ViolationTypeEnum.STRING_LITERAL;
      case 'template_literal':
        return ViolationTypeEnum.TEMPLATE_LITERAL;
      case 'literal_expression':
        // Check if it's numeric
        return ViolationTypeEnum.EXPRESSION;
      default:
        return ViolationTypeEnum.EXPRESSION;
    }
  }

  /**
   * Determines the severity of a violation
   * @param componentName Name of the parent component
   * @param content Text content that violates the rule
   * @returns Severity level
   */
  private determineSeverity(componentName: string, content: TextContent): ViolationSeverity {
    // High severity for components that commonly cause rendering issues
    if (['View', 'ScrollView'].includes(componentName)) {
      return ViolationSeverityEnum.HIGH;
    }
    
    // Medium severity for interactive components
    if (['Pressable', 'TouchableOpacity'].includes(componentName)) {
      return ViolationSeverityEnum.MEDIUM;
    }
    
    // Low severity for simple text content
    if (content.content.length < 10) {
      return ViolationSeverityEnum.LOW;
    }
    
    return ViolationSeverityEnum.MEDIUM;
  }

  /**
   * Generates a suggested fix for a text wrapping violation
   * @param content Text content that needs wrapping
   * @returns Suggested fix as string
   */
  private generateSuggestedFix(content: TextContent): string {
    const textContent = content.content;
    
    if (content.type === 'text_literal') {
      return `<Text>${textContent}</Text>`;
    }
    
    if (content.type === 'template_literal') {
      return `<Text>{${textContent}}</Text>`;
    }
    
    return `<Text>{${textContent}}</Text>`;
  }
}