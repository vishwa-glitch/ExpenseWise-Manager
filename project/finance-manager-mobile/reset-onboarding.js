/**
 * Reset Onboarding Utility
 * 
 * This script helps reset the onboarding state to test the full 8-step flow.
 * Run this to clear any cached onboarding state.
 */

const { execSync } = require('child_process');

console.log('🔄 Resetting onboarding state...');

try {
  // Clear React Native cache
  console.log('📱 Clearing React Native cache...');
  execSync('npx react-native start --reset-cache', { stdio: 'inherit' });
  
  console.log('✅ Onboarding state reset complete!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Close and restart your app');
  console.log('2. Create a new user account');
  console.log('3. Complete currency selection');
  console.log('4. You should now see the full 8-step onboarding overlay');
  console.log('');
  console.log('🎯 Expected 8 steps:');
  console.log('   1. Dashboard Welcome');
  console.log('   2. Account Creation');
  console.log('   3. Transaction Tracking');
  console.log('   4. Calendar View');
  console.log('   5. Budget Management');
  console.log('   6. Custom Categories');
  console.log('   7. Financial Goals');
  console.log('   8. Completion');
  
} catch (error) {
  console.error('❌ Error resetting onboarding:', error.message);
  console.log('');
  console.log('💡 Manual reset instructions:');
  console.log('1. Uninstall and reinstall the app');
  console.log('2. Or clear app data from device settings');
  console.log('3. Create a new user account to test the full flow');
}
