/**
 * Create Test Version Entry for Testing Force Update
 * This script adds a test version to your backend database
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function createTestVersion() {
  console.log('🚀 Creating Test Version Entry...\n');
  
  const API_BASE_URL = 'http://localhost:3000';
  
  try {
    // Create a test version that requires force update
    const testVersion = {
      version: '1.0.1',
      platform: 'android',
      min_required_version: '1.0.0',
      force_update: true,
      release_notes: 'Critical security update - Please update immediately!',
      update_url: 'https://play.google.com/store/apps/details?id=com.vishwa567.fintech',
      release_date: new Date().toISOString(),
      update_type: 'critical',
      is_active: true
    };
    
    console.log('📝 Creating version entry:');
    console.log(JSON.stringify(testVersion, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/app/version`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testVersion)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('\n✅ Test version created successfully!');
      console.log(JSON.stringify(result, null, 2));
      
      console.log('\n🧪 Now test the update flow:');
      console.log('1. Open your React Native app');
      console.log('2. The app should detect version 1.0.1 is available');
      console.log('3. Since force_update is true, the update overlay should appear');
      console.log('4. The overlay should block app usage until update');
      console.log('5. Clicking "Update Now" should redirect to Play Store');
      
    } else {
      console.log('\n❌ Failed to create test version:');
      console.log(JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error creating test version:', error);
  }
}

// Run the script
createTestVersion();
