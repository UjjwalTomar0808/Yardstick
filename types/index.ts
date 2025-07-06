export interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: 'expense' | 'income';
}

export interface BudgetType {
  _id: string;
  category: string;
  amount: number;
  month: string;
  spent: number;
}

export interface TransactionInput {
  amount: number;
  date: string;
  description: string;
  category: string;
  type: 'expense' | 'income';
}

export interface Budget {
  _id: string;
  category: string;
  amount: number;
  month: string; // Format: YYYY-MM
  spent: number;
}

export interface BudgetInput {
  category: string;
  amount: number;
  month: string;
}

export interface Category {
  name: string;
  color: string;
  icon: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  expenses: number;
  income: number;
  net: number;
}

export interface DashboardStats {
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyData: MonthlyData[];
}

export interface BudgetComparison {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'under' | 'over' | 'near';
}

export interface SpendingInsight {
  type: 'warning' | 'tip' | 'success';
  title: string;
  description: string;
  action?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}