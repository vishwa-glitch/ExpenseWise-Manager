export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  description: string;
  category_name?: string;
  account_name?: string;
  account_currency: string;
  transaction_date: string;
  merchant?: string;
  currency?: string; // Keeping for backward compatibility
  tags?: string[];
  account_id?: string;
  category_id?: string;
  created_at?: string;
  updated_at?: string;
  is_recurring?: boolean;
  recurring_id?: string | null;
  notes?: string;
  attachment_url?: string | null;
  status?: 'completed' | 'pending' | 'cancelled';
  payment_method?: string;
  reference_number?: string;
  runningBalance?: number; // Used for displaying running balance in transaction lists
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    place_id?: string;
  };
  metadata?: Record<string, any>;
  // Add any other fields that might be present in your transaction objects
}
