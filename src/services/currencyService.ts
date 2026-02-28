import { apiService } from './api';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface CurrencyConversion {
  original_amount: number;
  from_currency: string;
  to_currency: string;
  converted_amount: number;
  timestamp: string;
}

export const currencyService = {
  async getSupportedCurrencies(): Promise<Currency[]> {
    try {
      const response = await apiService.getSupportedCurrencies();
      return response.currencies || [];
    } catch (error) {
      console.error('Failed to fetch supported currencies:', error);
      // Fallback to a comprehensive list based on backend response
      return [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
        { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
        { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
        { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
        { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
        { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
        { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
        { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
        { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
      ];
    }
  },

  async getExchangeRates(baseCurrency = 'USD'): Promise<ExchangeRates> {
    try {
      const response = await apiService.getExchangeRates(baseCurrency);
      return response;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      throw error;
    }
  },

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<CurrencyConversion> {
    try {
      const response = await apiService.convertCurrency(amount, fromCurrency, toCurrency);
      return response;
    } catch (error) {
      console.error('Failed to convert currency:', error);
      throw error;
    }
  },

  async changeUserCurrency(newCurrency: string, convertData = true) {
    try {
      const response = await apiService.changeUserCurrency(newCurrency, convertData);
      return response;
    } catch (error) {
      console.error('Failed to change user currency:', error);
      throw error;
    }
  },
};
