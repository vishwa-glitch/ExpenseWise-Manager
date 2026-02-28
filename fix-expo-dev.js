#!/usr/bin/env node

/**
 * Fix Expo Development Issues
 * This script fixes common Expo Go development issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function removeFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️  Removed: ${filePath}`);
  }
}

function removeDirIfExists(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`🗑️  Removed directory: ${dirPath}`);
  }
}

function clearMetroCache() {
  console.log('🧹 Clearing Metro bundler cache...');
  
  // Remove problematic files
  removeFileIfExists('InternalBytecode.js');
  removeFileIfExists('.expo/web/cache/development/babel-loader');
  removeDirIfExists('.expo/web');
  removeDirIfExists('node_modules/.cache');
  
  // Clear various caches
  try {
    execSync('npx expo install --fix', { stdio: 'inherit' });
    console.log('✅ Fixed Expo dependencies');
  } catch (error) {
    console.log('⚠️  Could not fix dependencies automatically');
  }
  
  try {
    execSync('npx react-native start --reset-cache', { stdio: 'pipe' });
    console.log('✅ Reset React Native cache');
  } catch (error) {
    // This is expected to fail in Expo managed workflow
  }
}

function main() {
  console.log('🔧 Fixing Expo Go development issues...\n');
  
  clearMetroCache();
  
  console.log('\n✅ Fix complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Next steps:');
  console.log('1. Run: npm run dev-setup');
  console.log('2. Run: npm run mock-server (in a separate terminal)');
  console.log('3. Run: npm run dev');
  console.log('4. Scan QR code with Expo Go');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

if (require.main === module) {
  main();
}