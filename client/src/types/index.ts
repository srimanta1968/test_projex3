export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  status: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  last_login_at?: Date;
  created_at: Date;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

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

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string;
  transaction_date: string;
  amount: number;
  type: string;
  description?: string;
  merchant?: string;
  status: string;
}
