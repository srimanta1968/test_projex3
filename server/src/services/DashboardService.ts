import { query } from '../config/database';
import { DashboardOverview, DashboardMetric, Transaction, FinancialSummary } from '../models/Dashboard';
import logger from '../utils/logger';
import { NotFoundError } from '../utils/errors';

/**
 * Dashboard service for financial data
 */
export class DashboardService {
  /**
   * Get dashboard overview for a user
   */
  async getDashboardOverview(userId: string): Promise<DashboardOverview> {
    try {
      // Get total balance from all accounts
      const balanceResult = await query<{ total: number }>(
        'SELECT COALESCE(SUM(balance), 0) as total FROM bank_account WHERE user_id = $1 AND is_active = true',
        [userId]
      );
      const currentBalance = Number(balanceResult.rows[0]?.total || 0);

      // Get income and expenses for current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const incomeResult = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transaction
         WHERE user_id = $1 AND type = 'income'
         AND transaction_date >= $2 AND status = 'completed'`,
        [userId, firstDayOfMonth]
      );
      const totalIncome = Number(incomeResult.rows[0]?.total || 0);

      const expensesResult = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transaction
         WHERE user_id = $1 AND type = 'expense'
         AND transaction_date >= $2 AND status = 'completed'`,
        [userId, firstDayOfMonth]
      );
      const totalExpenses = Number(expensesResult.rows[0]?.total || 0);

      // Calculate net worth (simplified: balance + total assets - total liabilities)
      const netWorth = currentBalance;

      // Get recent transactions
      const transactionsResult = await query<Transaction>(
        `SELECT * FROM transaction
         WHERE user_id = $1
         ORDER BY transaction_date DESC
         LIMIT 10`,
        [userId]
      );
      const recentTransactions = transactionsResult.rows;

      // Calculate trends (compare with previous month)
      const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const prevIncomeResult = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transaction
         WHERE user_id = $1 AND type = 'income'
         AND transaction_date >= $2 AND transaction_date <= $3 AND status = 'completed'`,
        [userId, firstDayOfPrevMonth, lastDayOfPrevMonth]
      );
      const prevIncome = Number(prevIncomeResult.rows[0]?.total || 0);

      const prevExpensesResult = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transaction
         WHERE user_id = $1 AND type = 'expense'
         AND transaction_date >= $2 AND transaction_date <= $3 AND status = 'completed'`,
        [userId, firstDayOfPrevMonth, lastDayOfPrevMonth]
      );
      const prevExpenses = Number(prevExpensesResult.rows[0]?.total || 0);

      const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
      const expensesChange = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;
      const netWorthChange = 0; // Simplified for now

      return {
        currentBalance,
        totalIncome,
        totalExpenses,
        netWorth,
        incomeVsExpenses: {
          income: totalIncome,
          expenses: totalExpenses,
          period: 'month',
        },
        recentTransactions,
        trends: {
          incomeChange,
          expensesChange,
          netWorthChange,
        },
      };
    } catch (error) {
      logger.error('Dashboard overview error', { error, userId });
      throw error;
    }
  }

  /**
   * Get financial summary for a date range
   */
  async getFinancialSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FinancialSummary> {
    try {
      // Get totals
      const incomeResult = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transaction
         WHERE user_id = $1 AND type = 'income'
         AND transaction_date >= $2 AND transaction_date <= $3 AND status = 'completed'`,
        [userId, startDate, endDate]
      );
      const totalIncome = Number(incomeResult.rows[0]?.total || 0);

      const expensesResult = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM transaction
         WHERE user_id = $1 AND type = 'expense'
         AND transaction_date >= $2 AND transaction_date <= $3 AND status = 'completed'`,
        [userId, startDate, endDate]
      );
      const totalExpenses = Number(expensesResult.rows[0]?.total || 0);

      const countResult = await query<{ count: string }>(
        `SELECT COUNT(*) as count
         FROM transaction
         WHERE user_id = $1
         AND transaction_date >= $2 AND transaction_date <= $3 AND status = 'completed'`,
        [userId, startDate, endDate]
      );
      const transactionCount = parseInt(countResult.rows[0]?.count || '0');

      // Get category breakdown
      const categoryResult = await query<{ category: string; amount: number }>(
        `SELECT tc.name as category, COALESCE(SUM(t.amount), 0) as amount
         FROM transaction t
         LEFT JOIN transaction_category tc ON t.category_id = tc.id
         WHERE t.user_id = $1 AND t.type = 'expense'
         AND t.transaction_date >= $2 AND t.transaction_date <= $3
         AND t.status = 'completed'
         GROUP BY tc.name
         ORDER BY amount DESC`,
        [userId, startDate, endDate]
      );

      const categoryBreakdown = categoryResult.rows.map(row => ({
        category: row.category || 'Uncategorized',
        amount: Number(row.amount),
        percentage: totalExpenses > 0 ? (Number(row.amount) / totalExpenses) * 100 : 0,
      }));

      return {
        period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        totalIncome,
        totalExpenses,
        netChange: totalIncome - totalExpenses,
        transactionCount,
        categoryBreakdown,
      };
    } catch (error) {
      logger.error('Financial summary error', { error, userId });
      throw error;
    }
  }

  /**
   * Update dashboard metrics (background job)
   */
  async updateMetrics(userId: string): Promise<void> {
    try {
      const overview = await this.getDashboardOverview(userId);

      // Update or insert metrics
      const metrics = [
        { type: 'balance', value: overview.currentBalance },
        { type: 'income', value: overview.totalIncome },
        { type: 'expenses', value: overview.totalExpenses },
        { type: 'net_worth', value: overview.netWorth },
      ];

      for (const metric of metrics) {
        await query(
          `INSERT INTO dashboard_metric (user_id, metric_type, period, value, calculated_at)
           VALUES ($1, $2, 'month', $3, NOW())
           ON CONFLICT (user_id, metric_type, period)
           DO UPDATE SET value = $3, calculated_at = NOW()`,
          [userId, metric.type, metric.value]
        );
      }

      logger.info('Metrics updated', { userId });
    } catch (error) {
      logger.error('Metrics update error', { error, userId });
      throw error;
    }
  }
}
