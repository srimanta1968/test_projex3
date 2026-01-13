import { dataService } from './dataService';

export interface BillingRecord {
  id: string;
  type: 'payment' | 'trip_charge' | 'refund';
  description: string;
  amount: number;
  status: string;
  created_at: Date;
  reference_id: string;
}

export interface BillingSummary {
  totalSpent: number;
  recordCount: number;
  lastBillingDate: Date | null;
}

export interface BillingHistoryResponse {
  records: BillingRecord[];
  summary: BillingSummary;
}

export interface BillingFilters {
  type?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Billing service for aggregating user billing records
 */
export const billingService = {
  /**
   * Get user's billing history with optional filters
   */
  async getBillingHistory(
    userId: string,
    filters?: BillingFilters
  ): Promise<BillingHistoryResponse> {
    // Build query for payments
    let paymentQuery = `
      SELECT
        id,
        'payment' as type,
        CASE
          WHEN payment_status = 'completed' THEN 'Payment completed'
          WHEN payment_status = 'pending' THEN 'Payment pending'
          WHEN payment_status = 'failed' THEN 'Payment failed'
          ELSE 'Payment ' || payment_status
        END as description,
        amount,
        payment_status as status,
        created_at,
        payment_id as reference_id
      FROM payments
      WHERE user_id = $1
    `;

    const params: (string | number | Date)[] = [userId];
    let paramIndex = 2;

    // Apply filters
    if (filters?.startDate) {
      paymentQuery += ` AND created_at >= $${paramIndex}`;
      params.push(new Date(filters.startDate));
      paramIndex++;
    }

    if (filters?.endDate) {
      paymentQuery += ` AND created_at <= $${paramIndex}`;
      params.push(new Date(filters.endDate));
      paramIndex++;
    }

    if (filters?.minAmount) {
      paymentQuery += ` AND amount >= $${paramIndex}`;
      params.push(filters.minAmount);
      paramIndex++;
    }

    if (filters?.maxAmount) {
      paymentQuery += ` AND amount <= $${paramIndex}`;
      params.push(filters.maxAmount);
      paramIndex++;
    }

    paymentQuery += ' ORDER BY created_at DESC';

    const payments = await dataService.query<BillingRecord>(paymentQuery, params);

    // Filter by type if specified
    let records = payments;
    if (filters?.type && filters.type !== 'all') {
      records = payments.filter((r) => r.type === filters.type);
    }

    // Calculate summary
    const completedPayments = payments.filter((p) => p.status === 'completed');
    const totalSpent = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const lastBillingDate = records.length > 0 ? records[0].created_at : null;

    return {
      records,
      summary: {
        totalSpent,
        recordCount: records.length,
        lastBillingDate,
      },
    };
  },

  /**
   * Get billing record by ID
   */
  async getBillingRecord(
    recordId: string,
    userId: string
  ): Promise<BillingRecord | null> {
    const result = await dataService.query<BillingRecord>(
      `SELECT
        id,
        'payment' as type,
        'Payment' as description,
        amount,
        payment_status as status,
        created_at,
        payment_id as reference_id
      FROM payments
      WHERE id = $1 AND user_id = $2`,
      [recordId, userId]
    );

    return result[0] || null;
  },
};

export default billingService;
