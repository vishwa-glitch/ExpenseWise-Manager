// Define Account interface locally for utility functions
interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: string;
  transaction_count?: number; // Optional as it's not always present
}

export const formatCurrency = (
  amount: number,
  currency: string,
  options?: Intl.NumberFormatOptions
): string => {
  // Handle cases where amount might be undefined, null, or NaN
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }
  
  // Handle cases where currency might be null, undefined, or an empty string
  if (!currency) {
    // Fallback to a default non-currency format
    return new Intl.NumberFormat(undefined, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  }

  try {
    // First try with symbol display
    const formatted = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol',
      ...options,
    }).format(amount);

    // Clean up any remaining currency codes that might appear
    // Remove common currency codes that might still appear
    let cleaned = formatted
      // Remove currency codes at the beginning
      .replace(/^US\s*/, '') // Remove "US " prefix
      .replace(/^EUR\s*/, '') // Remove "EUR " prefix
      .replace(/^GBP\s*/, '') // Remove "GBP " prefix
      .replace(/^JPY\s*/, '') // Remove "JPY " prefix
      .replace(/^INR\s*/, '') // Remove "INR " prefix
      .replace(/^CAD\s*/, '') // Remove "CAD " prefix
      .replace(/^AUD\s*/, '') // Remove "AUD " prefix
      .replace(/^CHF\s*/, '') // Remove "CHF " prefix
      .replace(/^CNY\s*/, '') // Remove "CNY " prefix
      .replace(/^SEK\s*/, '') // Remove "SEK " prefix
      .replace(/^[A-Z]{2,3}\s*/, '') // Remove any other 2-3 letter currency codes
      // Remove currency codes at the end (like $US)
      .replace(/\s*US$/, '') // Remove " US" suffix
      .replace(/\s*EUR$/, '') // Remove " EUR" suffix
      .replace(/\s*GBP$/, '') // Remove " GBP" suffix
      .replace(/\s*JPY$/, '') // Remove " JPY" suffix
      .replace(/\s*INR$/, '') // Remove " INR" suffix
      .replace(/\s*CAD$/, '') // Remove " CAD" suffix
      .replace(/\s*AUD$/, '') // Remove " AUD" suffix
      .replace(/\s*CHF$/, '') // Remove " CHF" suffix
      .replace(/\s*CNY$/, '') // Remove " CNY" suffix
      .replace(/\s*SEK$/, '') // Remove " SEK" suffix
      .replace(/\s*[A-Z]{2,3}$/, '') // Remove any other 2-3 letter currency codes at the end
      // Remove currency codes in the middle (like $US)
      .replace(/\$\s*US\s*/g, '$') // Remove "$ US" pattern
      .replace(/\€\s*EUR\s*/g, '€') // Remove "€ EUR" pattern
      .replace(/\£\s*GBP\s*/g, '£') // Remove "£ GBP" pattern
      .replace(/\¥\s*JPY\s*/g, '¥') // Remove "¥ JPY" pattern
      .replace(/\₹\s*INR\s*/g, '₹') // Remove "₹ INR" pattern
      .replace(/\$\s*CAD\s*/g, 'C$') // Remove "$ CAD" pattern
      .replace(/\$\s*AUD\s*/g, 'A$') // Remove "$ AUD" pattern
      .replace(/\s*[A-Z]{2,3}\s*/g, ''); // Remove any other currency codes in the middle

    return cleaned;
  } catch (error) {
    // Handle invalid currency codes that might still be passed
    console.warn(`Invalid currency code '${currency}' provided to formatCurrency. Formatting as decimal.`);
    return new Intl.NumberFormat(undefined, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  }
};

export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'INR': '₹',
    'CHF': 'CHF',
    'CNY': '¥',
    'SEK': 'kr'
  };
  return symbols[currency] || '$';
};

export const getDefaultCurrency = (): string => 'USD';

export const groupAccountsByCurrency = (accounts: Account[]): Record<string, Account[]> => {
  return accounts.reduce((groups, account) => {
    const currency = account.currency;
    if (!groups[currency]) {
      groups[currency] = [];
    }
    groups[currency].push(account);
    return groups;
  }, {} as Record<string, Account[]>);
};

export const calculateTotalsByCurrency = (accounts: Account[]): Record<string, number> => {
  return accounts.reduce((totals, account) => {
    const currency = account.currency;
    totals[currency] = (totals[currency] || 0) + account.balance;
    return totals;
  }, {} as Record<string, number>);
};

export const getSupportedCurrencies = () => [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
];
