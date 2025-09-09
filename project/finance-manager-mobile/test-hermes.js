// Test file to check if Hermes is working properly
console.log('Testing Hermes compatibility...');

// Test basic functionality
const testObject = { test: 'value' };
console.log('Basic object test:', testObject);

// Test if require is available
try {
  if (typeof require !== 'undefined') {
    console.log('require is available');
  } else {
    console.log('require is NOT available (this is expected in Hermes)');
  }
} catch (error) {
  console.log('Error checking require:', error.message);
}

// Test if global is available
try {
  if (typeof global !== 'undefined') {
    console.log('global is available');
  } else {
    console.log('global is NOT available');
  }
} catch (error) {
  console.log('Error checking global:', error.message);
}

console.log('Hermes test completed');

