#!/usr/bin/env node

/**
 * Development Setup Script
 * This script helps you start the development environment for Expo Go testing
 */

const { execSync, spawn } = require('child_process');
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

function updateDevConfig(ip) {
  const fs = require('fs');
  const path = require('path');
  
  const configPath = path.join(__dirname, 'src', 'config', 'dev-config.ts');
  let config = fs.readFileSync(configPath, 'utf8');
  
  // Update the IP address in the config
  config = config.replace(
    /const LOCAL_IP = "[^"]*";/,
    `const LOCAL_IP = "${ip}";`
  );
  
  fs.writeFileSync(configPath, config);
  console.log(`✅ Updated dev config with IP: ${ip}`);
}

function clearMetroCache() {
  console.log('🧹 Clearing Metro cache...');
  try {
    execSync('npx expo start --clear', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Could not clear cache automatically. Run: npx expo start --clear');
  }
}

function startMockServer() {
  console.log('🚀 Starting mock backend server...');
  const mockServer = spawn('node', ['test-mock-backend.js'], {
    stdio: 'inherit',
    detached: false
  });
  
  return mockServer;
}

async function main() {
  console.log('🔧 Setting up development environment...\n');
  
  // Get local IP
  const localIP = getLocalIP();
  console.log(`📡 Detected local IP: ${localIP}`);
  
  // Update dev config
  updateDevConfig(localIP);
  
  console.log('\n📋 Development Setup Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 API Endpoint: http://${localIP}:3001`);
  console.log('📱 Mock data enabled for development');
  console.log('\n🚀 Next steps:');
  console.log('1. Start the mock server: node test-mock-backend.js');
  console.log('2. Clear Metro cache: npx expo start --clear');
  console.log('3. Open Expo Go and scan the QR code');
  console.log('\n💡 Tip: Make sure your phone and computer are on the same WiFi network');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getLocalIP, updateDevConfig };