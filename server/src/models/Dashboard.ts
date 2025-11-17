/**
 * Dashboard metric interface
 */
export interface DashboardMetric {
  id: string;
  user_id: string;
  metric_type: string;
  period: string;
  value: number;
  previous_value?: number;
  change_percentage?: number;
  trend?: string;
  metadata?: any;
  calculated_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Transaction interface
 */
export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string;
  transaction_date: Date;
  amount: number;
  type: string;
  description?: string;
  merchant?: string;
  reference_number?: string;
  status: string;
  is_recurring: boolean;
  tags?: any;
  notes?: string;
  external_id?: string;
  is_flagged: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Dashboard overview data
 */
export interface DashboardOverview {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  incomeVsExpenses: {
    income: number;
    expenses: number;
    period: string;
  };
  recentTransactions: Transaction[];
  trends: {
    incomeChange: number;
    expensesChange: number;
    netWorthChange: number;
  };
}

/**
 * Financial summary for a period
 */
export interface FinancialSummary {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netChange: number;
  transactionCount: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}
