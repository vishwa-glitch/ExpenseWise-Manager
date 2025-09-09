/**
 * Test script to verify the backend API integration
 * Run this script to test the API endpoint before testing in the app
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:3000';
const TEST_ENDPOINTS = [
  {
    name: 'Version Check - Android',
    url: `${API_BASE_URL}/api/app/version?platform=android&current_version=1.0.0`,
    expectedFields: ['success', 'data']
  },
  {
    name: 'Version Check - iOS',
    url: `${API_BASE_URL}/api/app/version?platform=ios&current_version=1.0.0`,
    expectedFields: ['success', 'data']
  },
  {
    name: 'Version Statistics',
    url: `${API_BASE_URL}/api/app/version/stats`,
    expectedFields: ['success', 'data']
  }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🧪 Testing: ${endpoint.name}`);
    console.log(`📡 URL: ${endpoint.url}`);
    
    const response = await fetch(endpoint.url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Response:`, JSON.stringify(data, null, 2));
      
      // Check if expected fields are present
      const missingFields = endpoint.expectedFields.filter(field => !(field in data));
      if (missingFields.length > 0) {
        console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`✅ All expected fields present`);
      }
      
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllEndpoints() {
  console.log('🚀 Starting API Integration Tests...\n');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const endpoint of TEST_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push({ endpoint: endpoint.name, ...result });
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 Test Summary:');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.endpoint}`);
  });
  
  console.log(`\n🎯 Results: ${successCount}/${totalCount} tests passed`);
  
  if (successCount === totalCount) {
    console.log('🎉 All tests passed! Backend API is ready for integration.');
  } else {
    console.log('⚠️  Some tests failed. Check the backend server and try again.');
  }
  
  return results;
}

// Test specific scenarios
async function testVersionScenarios() {
  console.log('\n🔍 Testing Version Scenarios...\n');
  
  const scenarios = [
    {
      name: 'Current version equals latest',
      currentVersion: '1.0.1',
      expectedUpdate: false
    },
    {
      name: 'Current version is older',
      currentVersion: '1.0.0',
      expectedUpdate: true
    },
    {
      name: 'Current version is newer (beta)',
      currentVersion: '1.0.2-beta',
      expectedUpdate: false
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n📱 Scenario: ${scenario.name}`);
    const url = `${API_BASE_URL}/api/app/version?platform=android&current_version=${scenario.currentVersion}`;
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const needsUpdate = data.data?.needsUpdate || false;
        const forceUpdate = data.data?.forceUpdate || false;
        
        console.log(`   Current: ${scenario.currentVersion}`);
        console.log(`   Latest: ${data.data?.latestVersion || 'N/A'}`);
        console.log(`   Needs Update: ${needsUpdate ? 'Yes' : 'No'}`);
        console.log(`   Force Update: ${forceUpdate ? 'Yes' : 'No'}`);
        console.log(`   Expected: ${scenario.expectedUpdate ? 'Yes' : 'No'}`);
        
        if (needsUpdate === scenario.expectedUpdate) {
          console.log(`   ✅ Result matches expectation`);
        } else {
          console.log(`   ⚠️  Result doesn't match expectation`);
        }
      } else {
        console.log(`   ❌ API Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  try {
    await testAllEndpoints();
    await testVersionScenarios();
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Run the tests
if (require.main === module) {
  main();
}

module.exports = { testAllEndpoints, testVersionScenarios };
