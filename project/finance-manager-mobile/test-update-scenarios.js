const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://192.168.102.131:3000';

async function testUpdateScenarios() {
  console.log('🧪 Testing Update Scenarios\n');

  // Test 1: Optional Update (current version 1.0.0, latest 1.1.0, force=false)
  console.log('📱 Test 1: Optional Update');
  try {
    const response = await fetch(`${API_BASE_URL}/api/app/version/check?platform=android&current_version=1.0.0`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Optional Update Response:');
      console.log(`   - Update Available: ${data.data.updateAvailable}`);
      console.log(`   - Force Update Required: ${data.data.forceUpdateRequired}`);
      console.log(`   - Latest Version: ${data.data.latestVersion}`);
      console.log(`   - Current Version: ${data.data.currentVersion}`);
      console.log(`   - Update Type: ${data.data.updateType}`);
      console.log(`   - Release Notes: ${data.data.releaseNotes}`);
      console.log('   - Expected UI: Shows "Update" and "Remind Me Later" buttons\n');
    }
  } catch (error) {
    console.error('❌ Error testing optional update:', error.message);
  }

  // Test 2: Force Update (current version 0.9.0, latest 1.1.0, force=true)
  console.log('🔄 Test 2: Force Update');
  try {
    const response = await fetch(`${API_BASE_URL}/api/app/version/check?platform=android&current_version=0.9.0`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Force Update Response:');
      console.log(`   - Update Available: ${data.data.updateAvailable}`);
      console.log(`   - Force Update Required: ${data.data.forceUpdateRequired}`);
      console.log(`   - Latest Version: ${data.data.latestVersion}`);
      console.log(`   - Current Version: ${data.data.currentVersion}`);
      console.log(`   - Update Type: ${data.data.updateType}`);
      console.log(`   - Release Notes: ${data.data.releaseNotes}`);
      console.log('   - Expected UI: Shows only "Update Now" button (no "Remind Later")\n');
    }
  } catch (error) {
    console.error('❌ Error testing force update:', error.message);
  }

  // Test 3: No Update Needed (current version 1.1.0, latest 1.1.0)
  console.log('✅ Test 3: No Update Needed');
  try {
    const response = await fetch(`${API_BASE_URL}/api/app/version/check?platform=android&current_version=1.1.0`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ No Update Response:');
      console.log(`   - Update Available: ${data.data.updateAvailable}`);
      console.log(`   - Force Update Required: ${data.data.forceUpdateRequired}`);
      console.log(`   - Latest Version: ${data.data.latestVersion}`);
      console.log(`   - Current Version: ${data.data.currentVersion}`);
      console.log('   - Expected UI: No update overlay shown\n');
    }
  } catch (error) {
    console.error('❌ Error testing no update:', error.message);
  }

  console.log('🎯 Summary:');
  console.log('   - Optional updates show "Update" and "Remind Me Later" buttons');
  console.log('   - Force updates show only "Update Now" button');
  console.log('   - "Remind Me Later" dismisses the overlay and schedules a 24-hour reminder');
  console.log('   - Force updates cannot be dismissed and require immediate action');
}

testUpdateScenarios().catch(console.error);
