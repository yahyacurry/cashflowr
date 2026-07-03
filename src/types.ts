export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  color: string; // Hex or Tailwind color class
}

export type ActivePage = 'dashboard' | 'calendar' | 'goals' | 'insights' | 'penny' | 'upgrade';

export interface CategoryBudget {
  category: string;
  budget: number;
  spent: number;
  color: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'INR';

export interface UserAccount {
  name: string;
  email: string;
  password?: string;
  transactions: Transaction[];
  goals: SavingsGoal[];
}

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  INR: '₹'
};

