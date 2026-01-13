import { dataService } from './dataService';
import { v4 as uuidv4 } from 'uuid';

export interface Dispute {
  id: string;
  dispute_id: string;
  user_id: string;
  payment_id: string;
  trip_id?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  resolution?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDisputeInput {
  payment_id: string;
  trip_id?: string;
  reason: string;
  details?: string;
}

export interface DisputeResult {
  dispute: Dispute;
}

/**
 * Dispute service for managing charge disputes
 */
export const disputeService = {
  /**
   * Create a new dispute
   */
  async createDispute(userId: string, input: CreateDisputeInput): Promise<DisputeResult> {
    const disputeId = uuidv4();
    const id = uuidv4();
    const now = new Date();

    const result = await dataService.query<Dispute>(
      `INSERT INTO disputes (id, dispute_id, user_id, payment_id, trip_id, reason, details, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
       RETURNING id, dispute_id, user_id, payment_id, trip_id, reason, details, status, resolution, created_at, updated_at`,
      [id, disputeId, userId, input.payment_id, input.trip_id || null, input.reason, input.details || null, 'pending', now]
    );

    return {
      dispute: result[0],
    };
  },

  /**
   * Get dispute by ID
   */
  async getDisputeById(disputeId: string, userId: string): Promise<Dispute | null> {
    const result = await dataService.query<Dispute>(
      `SELECT id, dispute_id, user_id, payment_id, trip_id, reason, details, status, resolution, created_at, updated_at
       FROM disputes
       WHERE id = $1 AND user_id = $2`,
      [disputeId, userId]
    );

    return result[0] || null;
  },

  /**
   * Get all disputes for a user
   */
  async getUserDisputes(userId: string): Promise<Dispute[]> {
    const disputes = await dataService.query<Dispute>(
      `SELECT id, dispute_id, user_id, payment_id, trip_id, reason, details, status, resolution, created_at, updated_at
       FROM disputes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return disputes;
  },

  /**
   * Update dispute status
   */
  async updateDisputeStatus(
    disputeId: string,
    userId: string,
    status: Dispute['status'],
    resolution?: string
  ): Promise<Dispute | null> {
    const now = new Date();

    const result = await dataService.query<Dispute>(
      `UPDATE disputes
       SET status = $1, resolution = $2, updated_at = $3
       WHERE id = $4 AND user_id = $5
       RETURNING id, dispute_id, user_id, payment_id, trip_id, reason, details, status, resolution, created_at, updated_at`,
      [status, resolution || null, now, disputeId, userId]
    );

    return result[0] || null;
  },
};

export default disputeService;
