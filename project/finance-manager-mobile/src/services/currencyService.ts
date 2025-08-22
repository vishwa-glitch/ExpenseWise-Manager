import { apiService } from './api';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const currencyService = {
  async getSupportedCurrencies(): Promise<Currency[]> {
    try {
      const response = await apiService.get('/currency/supported');
      return response.data.currencies;
    } catch (error) {
      console.error('Failed to fetch supported currencies:', error);
      // Fallback to a default list in case of an error
      return [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      ];
    }
  },
};
