/**
 * Test utility to verify currency formatting
 */
import { formatCurrency, getCurrencySymbol } from './currency';

export const testCurrencyFormatting = () => {
  console.log('🧪 Testing currency formatting...');
  
  const testCases = [
    { amount: 1234.56, currency: 'USD', expected: '$1,234.56' },
    { amount: 1234.56, currency: 'EUR', expected: '€1,234.56' },
    { amount: 1234.56, currency: 'GBP', expected: '£1,234.56' },
    { amount: 1234.56, currency: 'INR', expected: '₹1,234.56' },
    { amount: 1234.56, currency: 'JPY', expected: '¥1,234.56' },
    { amount: 1234.56, currency: 'CAD', expected: 'C$1,234.56' },
    { amount: 1234.56, currency: 'AUD', expected: 'A$1,234.56' },
  ];
  
  testCases.forEach(({ amount, currency, expected }) => {
    const result = formatCurrency(amount, currency);
    const symbol = getCurrencySymbol(currency);
    
    console.log(`✅ ${currency}: ${result} (symbol: ${symbol})`);
    
    // Check if result contains currency codes that should be removed
    const hasCurrencyCode = /^[A-Z]{2,3}\s/.test(result);
    if (hasCurrencyCode) {
      console.warn(`⚠️  ${currency} still contains currency code: "${result}"`);
    }
  });
  
  // Test specific cases that might be problematic
  console.log('\n🔍 Testing specific cases:');
  
  const problematicCases = [
    { amount: 1000, currency: 'USD' },
    { amount: 1000, currency: 'EUR' },
    { amount: 1000, currency: 'GBP' },
    { amount: 1000, currency: 'INR' },
  ];
  
  problematicCases.forEach(({ amount, currency }) => {
    const result = formatCurrency(amount, currency);
    console.log(`${currency}: ${result}`);
    
    // Check for common currency code patterns
    const patterns = [
      /^US\s/, /^EUR\s/, /^GBP\s/, /^INR\s/, /^JPY\s/, /^CAD\s/, /^AUD\s/
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(result)) {
        console.warn(`⚠️  Found currency code pattern in ${currency}: "${result}"`);
      }
    });
  });
  
  console.log('🎉 Currency formatting test completed!');
};

/**
 * Test the Intl.NumberFormat behavior directly
 */
export const testIntlNumberFormat = () => {
  console.log('🧪 Testing Intl.NumberFormat directly...');
  
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];
  
  currencies.forEach(currency => {
    try {
      const formatted = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol',
      }).format(1234.56);
      
      console.log(`${currency}: "${formatted}"`);
    } catch (error) {
      console.error(`❌ Error formatting ${currency}:`, error);
    }
  });
};
