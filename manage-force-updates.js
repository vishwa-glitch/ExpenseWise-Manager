/**
 * Force Update Management Script
 * Use this script to quickly manage force updates in production
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuration
const BACKEND_URL = 'http://localhost:3000'; // Change to your production URL when deploying
const PLATFORM = 'android'; // or 'ios'

async function createForceUpdate(version, releaseNotes) {
  console.log(`🚨 Creating FORCE UPDATE for version ${version}...`);
  
  const versionData = {
    version: version,
    platform: PLATFORM,
    force_update: true,
    release_notes: releaseNotes,
    update_type: 'critical',
    is_active: true
  };
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/app/version`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(versionData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Force update created successfully!');
      console.log(`   Version: ${version}`);
      console.log(`   Platform: ${PLATFORM}`);
      console.log(`   Force Update: ${result.data?.force_update ? 'YES' : 'NO'}`);
      console.log(`   Release Notes: ${releaseNotes}`);
    } else {
      console.log('❌ Failed to create force update:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function createOptionalUpdate(version, releaseNotes) {
  console.log(`📢 Creating OPTIONAL UPDATE for version ${version}...`);
  
  const versionData = {
    version: version,
    platform: PLATFORM,
    force_update: false,
    release_notes: releaseNotes,
    update_type: 'recommended',
    is_active: true
  };
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/app/version`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(versionData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Optional update created successfully!');
      console.log(`   Version: ${version}`);
      console.log(`   Platform: ${PLATFORM}`);
      console.log(`   Force Update: ${result.data?.force_update ? 'YES' : 'NO'}`);
      console.log(`   Release Notes: ${releaseNotes}`);
    } else {
      console.log('❌ Failed to create optional update:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function listVersions() {
  console.log('📋 Listing all versions...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/app/versions`);
    const result = await response.json();
    
    if (response.ok && result.versions) {
      console.log('\n📱 Current Versions:');
      result.versions.forEach(version => {
        const status = version.force_update ? '🚨 FORCE' : '📢 OPTIONAL';
        console.log(`   ${status} v${version.version} (${version.platform}) - ${version.release_notes}`);
      });
    } else {
      console.log('❌ Failed to list versions:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Command line interface
const command = process.argv[2];
const version = process.argv[3];
const releaseNotes = process.argv[4] || 'Update available';

switch (command) {
  case 'force':
    if (!version) {
      console.log('❌ Usage: node manage-force-updates.js force <version> [release_notes]');
      console.log('   Example: node manage-force-updates.js force 1.0.2 "Critical security update"');
      break;
    }
    createForceUpdate(version, releaseNotes);
    break;
    
  case 'optional':
    if (!version) {
      console.log('❌ Usage: node manage-force-updates.js optional <version> [release_notes]');
      console.log('   Example: node manage-force-updates.js optional 1.1.0 "New features available"');
      break;
    }
    createOptionalUpdate(version, releaseNotes);
    break;
    
  case 'list':
    listVersions();
    break;
    
  default:
    console.log('🚀 Force Update Management Script');
    console.log('');
    console.log('Usage:');
    console.log('  node manage-force-updates.js force <version> [release_notes]');
    console.log('  node manage-force-updates.js optional <version> [release_notes]');
    console.log('  node manage-force-updates.js list');
    console.log('');
    console.log('Examples:');
    console.log('  node manage-force-updates.js force 1.0.2 "Critical security update"');
    console.log('  node manage-force-updates.js optional 1.1.0 "New features available"');
    console.log('  node manage-force-updates.js list');
    console.log('');
    console.log('⚠️  Remember to update BACKEND_URL to your production URL!');
    break;
}
