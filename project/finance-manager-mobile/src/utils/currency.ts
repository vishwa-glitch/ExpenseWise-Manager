import { store } from "../store";

/**
 * Get the currency symbol for a given currency code
 * @param currency The currency code (e.g., USD, EUR)
 * @returns The currency symbol (e.g., $, €)
 */
export const getCurrencySymbol = (currency: string): string => {
  const currencySymbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
    CAD: "C$",
    AUD: "A$",
    CHF: "CHF",
    CNY: "¥",
    SEK: "kr",
    NOK: "kr",
    MXN: "$",
    NZD: "NZ$",
    SGD: "S$",
    HKD: "HK$",
    ZAR: "R",
    BRL: "R$",
    RUB: "₽",
    KRW: "₩",
    TRY: "₺",
  };

  return currencySymbols[currency.toUpperCase()] || currency;
};

export const formatCurrency = (
  amount: number,
  currency?: string,
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const {
    showSymbol = true,
    showCode = false,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  // Use provided currency or get from user preference
  const finalCurrency = currency || getDefaultCurrency();
  const symbol = getCurrencySymbol(finalCurrency);
  const absAmount = Math.abs(amount);

  // Ensure minimumFractionDigits is not greater than maximumFractionDigits
  const safeMinimumFractionDigits = Math.min(
    minimumFractionDigits,
    maximumFractionDigits
  );

  // Format the number with proper locale and safe fraction digits
  const formattedAmount = absAmount.toLocaleString("en-US", {
    minimumFractionDigits: safeMinimumFractionDigits,
    maximumFractionDigits,
  });

  let result = "";

  if (showSymbol) {
    result = `${symbol}${formattedAmount}`;
  } else {
    result = formattedAmount;
  }

  if (showCode) {
    result += ` ${finalCurrency.toUpperCase()}`;
  }

  return result;
};

export const getDefaultCurrency = (): string => {
  // Get currency from Redux store if available
  try {
    const state = store.getState();
    return state.user.preferredCurrency || "USD";
  } catch (error) {
    return "USD";
  }
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
