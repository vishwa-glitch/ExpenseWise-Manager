/**
 * Text Content Analysis Utilities
 * Advanced utilities for analyzing JSX text content and expressions
 */

import * as ts from 'typescript';
import { TextContent } from '../types';

export class TextContentAnalyzer {
  /**
   * Analyzes JSX child nodes to detect text content that needs wrapping
   */
  static analyzeJSXChild(node: ts.JsxChild): TextContent | null {
    if (ts.isJsxText(node)) {
      return this.analyzeJSXText(node);
    }

    if (ts.isJsxExpression(node) && node.expression) {
      return this.analyzeJSXExpression(node.expression);
    }

    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      // Nested JSX elements don't need text wrapping at this level
      return null;
    }

    return null;
  }

  /**
   * Analyzes JSX text nodes for content that needs wrapping
   */
  static analyzeJSXText(node: ts.JsxText): TextContent | null {
    const text = node.text.trim();
    
    // Ignore whitespace-only content
    if (text.length === 0) {
      return null;
    }

    return {
      type: 'text_literal',
      content: text,
      needsWrapping: true
    };
  }

  /**
   * Analyzes JSX expressions for text content
   */
  static analyzeJSXExpression(expr: ts.Expression): TextContent | null {
    // String literals
    if (ts.isStringLiteral(expr)) {
      return {
        type: 'literal_expression',
        content: expr.text,
        needsWrapping: true
      };
    }

    // Numeric literals
    if (ts.isNumericLiteral(expr)) {
      return {
        type: 'literal_expression',
        content: expr.text,
        needsWrapping: true
      };
    }

    // Template literals
    if (ts.isTemplateExpression(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      const content = this.extractTemplateContent(expr);
      return {
        type: 'template_literal',
        content,
        needsWrapping: true
      };
    }

    // Skip array.map() and other JSX-returning expressions
    if (this.isJSXReturningExpression(expr)) {
      return null;
    }

    // Check for problematic conditional patterns
    const conditionalIssue = this.analyzeConditionalPatterns(expr);
    if (conditionalIssue) {
      return conditionalIssue;
    }

    // Check for potential runtime text rendering issues
    const runtimeIssue = this.analyzeForRuntimeIssues(expr);
    if (runtimeIssue) {
      return runtimeIssue;
    }

    // Complex expressions that might evaluate to text
    if (this.isLikelyTextExpression(expr)) {
      return {
        type: 'literal_expression',
        content: this.getExpressionPreview(expr),
        needsWrapping: true
      };
    }

    return null;
  }

  /**
   * Detects mapped array content that renders text
   */
  static analyzeMappedArrayContent(expr: ts.Expression): TextContent | null {
    if (!ts.isCallExpression(expr)) {
      return null;
    }

    // Check for array.map() calls
    if (ts.isPropertyAccessExpression(expr.expression) && 
        ts.isIdentifier(expr.expression.name) && 
        expr.expression.name.text === 'map') {
      
      // Analyze the callback function
      const callback = expr.arguments[0];
      if (callback && (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))) {
        const returnStatement = this.findReturnStatement(callback);
        if (returnStatement) {
          return this.analyzeJSXExpression(returnStatement);
        }
      }
    }

    return null;
  }

  /**
   * Detects complex expressions that evaluate to text content
   */
  static analyzeComplexExpression(expr: ts.Expression): TextContent | null {
    // Conditional expressions (ternary)
    if (ts.isConditionalExpression(expr)) {
      const whenTrue = this.analyzeJSXExpression(expr.whenTrue);
      const whenFalse = this.analyzeJSXExpression(expr.whenFalse);
      
      if (whenTrue || whenFalse) {
        return {
          type: 'literal_expression',
          content: this.getExpressionPreview(expr),
          needsWrapping: true
        };
      }
    }

    // Binary expressions (string concatenation)
    if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const left = this.analyzeJSXExpression(expr.left);
      const right = this.analyzeJSXExpression(expr.right);
      
      if (left || right) {
        return {
          type: 'literal_expression',
          content: this.getExpressionPreview(expr),
          needsWrapping: true
        };
      }
    }

    // Logical expressions (&&, ||)
    if (ts.isBinaryExpression(expr) && 
        (expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
         expr.operatorToken.kind === ts.SyntaxKind.BarBarToken)) {
      
      const right = this.analyzeJSXExpression(expr.right);
      if (right) {
        return {
          type: 'literal_expression',
          content: this.getExpressionPreview(expr),
          needsWrapping: true
        };
      }
    }

    return null;
  }

  /**
   * Filters out whitespace-only content and valid Text components
   */
  static shouldIgnoreContent(node: ts.JsxChild): boolean {
    if (ts.isJsxText(node)) {
      return node.text.trim().length === 0;
    }

    if (ts.isJsxElement(node)) {
      const tagName = this.getJSXElementName(node);
      return tagName === 'Text' || tagName === 'TextInput';
    }

    if (ts.isJsxSelfClosingElement(node)) {
      const tagName = this.getJSXElementName(node);
      return tagName === 'Text' || tagName === 'TextInput';
    }

    return false;
  }

  /**
   * Analyzes nested components for text content violations
   */
  static analyzeNestedComponents(node: ts.JsxElement | ts.JsxSelfClosingElement): TextContent[] {
    const textContents: TextContent[] = [];

    if (ts.isJsxElement(node)) {
      node.children.forEach(child => {
        if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
          // Recursively analyze nested components
          const nestedContent = this.analyzeNestedComponents(child);
          textContents.push(...nestedContent);
        } else {
          const content = this.analyzeJSXChild(child);
          if (content) {
            textContents.push(content);
          }
        }
      });
    }

    return textContents;
  }

  /**
   * Handles conditional rendering patterns
   */
  static analyzeConditionalRendering(expr: ts.Expression): TextContent | null {
    // Handle condition && <JSX>
    if (ts.isBinaryExpression(expr) && 
        expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      
      const rightSide = expr.right;
      if (ts.isJsxElement(rightSide) || ts.isJsxSelfClosingElement(rightSide)) {
        const nestedContent = this.analyzeNestedComponents(rightSide);
        if (nestedContent.length > 0) {
          return nestedContent[0] || null; // Return first text content found
        }
      }
    }

    // Handle ternary operator with JSX
    if (ts.isConditionalExpression(expr)) {
      const trueContent = this.analyzeConditionalBranch(expr.whenTrue);
      const falseContent = this.analyzeConditionalBranch(expr.whenFalse);
      
      return trueContent || falseContent;
    }

    return null;
  }

  /**
   * Extracts content from template literals
   */
  private static extractTemplateContent(expr: ts.TemplateExpression | ts.NoSubstitutionTemplateLiteral): string {
    if (ts.isNoSubstitutionTemplateLiteral(expr)) {
      return expr.text;
    }

    if (ts.isTemplateExpression(expr)) {
      let content = expr.head.text;
      expr.templateSpans.forEach(span => {
        content += '${...}' + span.literal.text;
      });
      return content;
    }

    return '';
  }

  /**
   * Detects problematic conditional rendering patterns
   */
  static analyzeConditionalPatterns(expr: ts.Expression): TextContent | null {
    // Check for chained && expressions: condition && text && <JSX>
    if (ts.isBinaryExpression(expr) && 
        expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      
      const rightExpr = expr.right;
      
      // Check if right side is another && expression
      if (ts.isBinaryExpression(rightExpr) && 
          rightExpr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
        
        const middleExpr = rightExpr.left;
        
        // If middle expression is a function call that returns text
        if (ts.isCallExpression(middleExpr)) {
          const callText = middleExpr.getText();
          if (/get\w*Text|format\w*|toString/.test(callText)) {
            return {
              type: 'literal_expression',
              content: `Conditional pattern: ${expr.getText().substring(0, 50)}...`,
              needsWrapping: true
            };
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Analyzes JSX expressions for potential runtime text rendering issues
   */
  static analyzeForRuntimeIssues(expr: ts.Expression): TextContent | null {
    // Check for object property access that might return text at runtime
    if (ts.isPropertyAccessExpression(expr)) {
      const propertyName = expr.name.text;
      // Common properties that might contain text
      const textProperties = ['title', 'description', 'name', 'text', 'label', 'message', 'error'];
      if (textProperties.includes(propertyName)) {
        return {
          type: 'literal_expression',
          content: expr.getText(),
          needsWrapping: true
        };
      }
    }

    // Check for element access that might return text
    if (ts.isElementAccessExpression(expr)) {
      return {
        type: 'literal_expression',
        content: expr.getText(),
        needsWrapping: true
      };
    }

    // Check for function calls that might return text
    if (ts.isCallExpression(expr)) {
      const callText = expr.getText();
      // Functions that commonly return strings
      if (/\.(toString|toFixed|toLocaleString|format|trim|substring|slice)\s*\(/.test(callText)) {
        return {
          type: 'literal_expression',
          content: callText,
          needsWrapping: true
        };
      }
    }

    return null;
  }

  /**
   * Determines if an expression returns JSX elements (not text)
   */
  private static isJSXReturningExpression(expr: ts.Expression): boolean {
    // Check for array.map() calls that typically return JSX
    if (ts.isCallExpression(expr)) {
      if (ts.isPropertyAccessExpression(expr.expression) && 
          ts.isIdentifier(expr.expression.name) && 
          expr.expression.name.text === 'map') {
        return true; // array.map() typically returns JSX elements
      }
      
      // Check for other common JSX-returning function calls
      const callText = expr.getText();
      if (/\.(map|filter|reduce)\s*\(/.test(callText)) {
        return true;
      }
    }

    // Check for conditional expressions that return JSX
    if (ts.isConditionalExpression(expr)) {
      const trueExpr = expr.whenTrue;
      const falseExpr = expr.whenFalse;
      
      // If either branch returns JSX, consider the whole expression as JSX-returning
      if ((ts.isJsxElement(trueExpr) || ts.isJsxSelfClosingElement(trueExpr)) ||
          (ts.isJsxElement(falseExpr) || ts.isJsxSelfClosingElement(falseExpr))) {
        return true;
      }
    }

    // Check for logical AND expressions with JSX
    if (ts.isBinaryExpression(expr) && 
        expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      const rightExpr = expr.right;
      if (ts.isJsxElement(rightExpr) || ts.isJsxSelfClosingElement(rightExpr)) {
        return true;
      }
      
      // Check for chained && expressions that might render text
      if (ts.isBinaryExpression(rightExpr) && 
          rightExpr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
        // This is a pattern like: condition && text && <JSX>
        // The middle part might render as text if JSX fails
        return false; // Don't skip this, let it be analyzed for potential text rendering
      }
    }

    return false;
  }

  /**
   * Determines if an expression likely evaluates to text content
   */
  private static isLikelyTextExpression(expr: ts.Expression): boolean {
    // Property access (obj.prop)
    if (ts.isPropertyAccessExpression(expr)) {
      return true;
    }

    // Element access (obj[key])
    if (ts.isElementAccessExpression(expr)) {
      return true;
    }

    // Function calls that commonly return strings
    if (ts.isCallExpression(expr)) {
      const callText = expr.getText();
      return /\.(toString|toFixed|toLocaleString|join|slice|substring|replace)\s*\(/.test(callText);
    }

    // String concatenation
    if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      return true;
    }

    // Conditional expressions
    if (ts.isConditionalExpression(expr)) {
      return this.isLikelyTextExpression(expr.whenTrue) || 
             this.isLikelyTextExpression(expr.whenFalse);
    }

    return false;
  }

  /**
   * Gets a preview of an expression for display purposes
   */
  private static getExpressionPreview(expr: ts.Expression): string {
    const text = expr.getText();
    return text.length > 50 ? text.substring(0, 47) + '...' : text;
  }

  /**
   * Finds return statement in a function
   */
  private static findReturnStatement(func: ts.ArrowFunction | ts.FunctionExpression): ts.Expression | null {
    if (ts.isArrowFunction(func)) {
      // Arrow function with expression body
      if (!ts.isBlock(func.body)) {
        return func.body;
      }
      
      // Arrow function with block body
      const returnStmt = this.findReturnInBlock(func.body);
      return returnStmt?.expression || null;
    }

    if (ts.isFunctionExpression(func) && func.body) {
      const returnStmt = this.findReturnInBlock(func.body);
      return returnStmt?.expression || null;
    }

    return null;
  }

  /**
   * Finds return statement in a block
   */
  private static findReturnInBlock(block: ts.Block): ts.ReturnStatement | null {
    for (const statement of block.statements) {
      if (ts.isReturnStatement(statement)) {
        return statement;
      }
    }
    return null;
  }

  /**
   * Analyzes a conditional branch for text content
   */
  private static analyzeConditionalBranch(expr: ts.Expression): TextContent | null {
    if (ts.isJsxElement(expr) || ts.isJsxSelfClosingElement(expr)) {
      const nestedContent = this.analyzeNestedComponents(expr);
      return nestedContent.length > 0 ? (nestedContent[0] || null) : null;
    }

    return this.analyzeJSXExpression(expr);
  }

  /**
   * Gets the name of a JSX element
   */
  private static getJSXElementName(element: ts.JsxElement | ts.JsxSelfClosingElement): string {
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
}