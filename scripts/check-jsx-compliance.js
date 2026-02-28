#!/usr/bin/env node
/**
 * JSX Text Wrapping Compliance Check Script
 * Runs before app start to catch text wrapping violations
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Checking JSX Text Wrapping Compliance...\n');

try {
  // Run the compliance checker on the src directory
  const complianceToolPath = path.join(__dirname, '../../../tools/jsx-text-wrapping-compliance/dist/cli.js');
  const srcPath = path.join(__dirname, '../src');
  
  execSync(`node "${complianceToolPath}" "${srcPath}" --verbose`, {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ JSX compliance check passed! Starting app...\n');
} catch (error) {
  console.error('\n❌ JSX compliance check failed!');
  console.error('Please fix the violations above before starting the app.\n');
  process.exit(1);
}