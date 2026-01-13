import { dataService } from './dataService';
import { v4 as uuidv4 } from 'uuid';

export interface Refund {
  id: string;
  refund_id: string;
  user_id: string;
  payment_id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface CreateRefundInput {
  payment_id: string;
  amount: number;
  reason: string;
}

export interface RefundResult {
  refund: Refund;
}

/**
 * Refund service for managing refund requests
 */
export const refundService = {
  /**
   * Create a new refund request
   */
  async createRefund(userId: string, input: CreateRefundInput): Promise<RefundResult> {
    const refundId = uuidv4();
    const id = uuidv4();
    const now = new Date();

    const result = await dataService.query<Refund>(
      `INSERT INTO refunds (id, refund_id, user_id, payment_id, amount, reason, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
       RETURNING id, refund_id, user_id, payment_id, amount, reason, status, created_at, updated_at`,
      [id, refundId, userId, input.payment_id, input.amount, input.reason, 'pending', now]
    );

    return {
      refund: result[0],
    };
  },

  /**
   * Get refund by ID
   */
  async getRefundById(refundId: string, userId: string): Promise<Refund | null> {
    const result = await dataService.query<Refund>(
      `SELECT id, refund_id, user_id, payment_id, amount, reason, status, created_at, updated_at
       FROM refunds
       WHERE id = $1 AND user_id = $2`,
      [refundId, userId]
    );

    return result[0] || null;
  },

  /**
   * Get all refunds for a user
   */
  async getUserRefunds(userId: string): Promise<Refund[]> {
    const refunds = await dataService.query<Refund>(
      `SELECT id, refund_id, user_id, payment_id, amount, reason, status, created_at, updated_at
       FROM refunds
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return refunds;
  },

  /**
   * Update refund status
   */
  async updateRefundStatus(
    refundId: string,
    userId: string,
    status: Refund['status']
  ): Promise<Refund | null> {
    const now = new Date();

    const result = await dataService.query<Refund>(
      `UPDATE refunds
       SET status = $1, updated_at = $2
       WHERE id = $3 AND user_id = $4
       RETURNING id, refund_id, user_id, payment_id, amount, reason, status, created_at, updated_at`,
      [status, now, refundId, userId]
    );

    return result[0] || null;
  },

  /**
   * Process approved refund (update payment status)
   */
  async processRefund(refundId: string, userId: string): Promise<Refund | null> {
    const refund = await this.getRefundById(refundId, userId);

    if (!refund || refund.status !== 'approved') {
      return null;
    }

    // Update payment status to refunded
    await dataService.query(
      `UPDATE payments
       SET payment_status = 'refunded', updated_at = $1
       WHERE id = $2 AND user_id = $3`,
      [new Date(), refund.payment_id, userId]
    );

    // Mark refund as processed
    return this.updateRefundStatus(refundId, userId, 'processed');
  },

  /**
   * Cancel a pending refund request
   * Only pending refunds can be cancelled
   */
  async cancelRefund(refundId: string, userId: string): Promise<Refund | null> {
    const refund = await this.getRefundById(refundId, userId);

    if (!refund) {
      return null;
    }

    // Only pending refunds can be cancelled
    if (refund.status !== 'pending') {
      return null;
    }

    return this.updateRefundStatus(refundId, userId, 'cancelled');
  },
};

export default refundService;
