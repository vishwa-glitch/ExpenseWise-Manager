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
    const formatted = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol',
      ...options,
    }).format(amount);

    // Remove currency code like 'US' from the beginning of the string
    return formatted.replace(/^[A-Z]{2,3}/, '');
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
    'INR': '₹'
  };
  return symbols[currency] || currency;
};

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
