import { pool, query } from '../config/database';
import { logger } from '../utils/logger';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import {
  Dispute,
  DisputeMessage,
  CreateDisputeDTO,
  UpdateDisputeDTO,
  AddMessageDTO,
  DisputeResponseDTO,
  DisputeStatistics,
  DisputeStatus,
} from '../models/Dispute';
import { webSocketServer, WebSocketEventType } from '../websocket/WebSocketServer';

/**
 * Service for handling dispute operations
 */
class DisputeService {
  /**
   * Create a new dispute
   */
  async createDispute(userId: string, data: CreateDisputeDTO): Promise<DisputeResponseDTO> {
    const { transaction_id, disputed_user_id, dispute_type, reason, description, evidence_urls } = data;

    // If transaction_id is provided, verify user owns it
    if (transaction_id) {
      const txResult = await query(
        'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
        [transaction_id, userId]
      );
      if (txResult.rows.length === 0) {
        throw new ValidationError('Transaction not found or not owned by user');
      }
    }

    const result = await query(
      `INSERT INTO disputes (user_id, transaction_id, disputed_user_id, dispute_type, reason, description, evidence_urls, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
       RETURNING *`,
      [userId, transaction_id || null, disputed_user_id || null, dispute_type, reason, description || null, evidence_urls || []]
    );

    const dispute = result.rows[0] as Dispute;
    logger.info('Dispute created', { disputeId: dispute.id, userId, type: dispute_type });

    // Notify via WebSocket
    webSocketServer.notifyUser(userId, 'Dispute Created', `Your dispute #${dispute.id.slice(0, 8)} has been created`);

    return this.getDisputeById(dispute.id, userId);
  }

  /**
   * Get a dispute by ID
   */
  async getDisputeById(disputeId: string, userId: string): Promise<DisputeResponseDTO> {
    const result = await query(
      `SELECT d.*,
              u1.name as user_name,
              u2.name as disputed_user_name,
              (SELECT COUNT(*) FROM dispute_messages WHERE dispute_id = d.id) as message_count
       FROM disputes d
       LEFT JOIN users u1 ON d.user_id = u1.id
       LEFT JOIN users u2 ON d.disputed_user_id = u2.id
       WHERE d.id = $1`,
      [disputeId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Dispute not found');
    }

    const dispute = result.rows[0];

    // Verify ownership or involved party
    if (dispute.user_id !== userId && dispute.disputed_user_id !== userId) {
      throw new ForbiddenError('Not authorized to view this dispute');
    }

    // Get messages
    const messagesResult = await query(
      `SELECT dm.*, u.name as user_name
       FROM dispute_messages dm
       LEFT JOIN users u ON dm.user_id = u.id
       WHERE dm.dispute_id = $1
       ORDER BY dm.created_at ASC`,
      [disputeId]
    );

    return {
      ...dispute,
      messages: messagesResult.rows,
    };
  }

  /**
   * Get user's disputes
   */
  async getUserDisputes(userId: string, status?: DisputeStatus): Promise<DisputeResponseDTO[]> {
    let queryText = `
      SELECT d.*,
             u1.name as user_name,
             u2.name as disputed_user_name,
             (SELECT COUNT(*) FROM dispute_messages WHERE dispute_id = d.id) as message_count
      FROM disputes d
      LEFT JOIN users u1 ON d.user_id = u1.id
      LEFT JOIN users u2 ON d.disputed_user_id = u2.id
      WHERE d.user_id = $1 OR d.disputed_user_id = $1
    `;
    const params: (string | undefined)[] = [userId];

    if (status) {
      queryText += ' AND d.status = $2';
      params.push(status);
    }

    queryText += ' ORDER BY d.created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Update dispute status
   */
  async updateDispute(disputeId: string, userId: string, data: UpdateDisputeDTO): Promise<DisputeResponseDTO> {
    const dispute = await this.getDisputeById(disputeId, userId);

    if (dispute.user_id !== userId) {
      throw new ForbiddenError('Only dispute creator can update it');
    }

    // Prevent updating resolved or closed disputes
    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      throw new ValidationError('Cannot update resolved or closed disputes');
    }

    const updates: string[] = [];
    const values: (string | Date | null)[] = [];
    let paramCount = 1;

    if (data.status) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);

      if (data.status === 'resolved' || data.status === 'closed') {
        updates.push(`resolved_at = $${paramCount++}`);
        values.push(new Date());
      }
    }

    if (data.resolution !== undefined) {
      updates.push(`resolution = $${paramCount++}`);
      values.push(data.resolution);
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(new Date());

    values.push(disputeId);

    await query(
      `UPDATE disputes SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    logger.info('Dispute updated', { disputeId, userId, updates: data });

    return this.getDisputeById(disputeId, userId);
  }

  /**
   * Add message to dispute
   */
  async addMessage(disputeId: string, userId: string, data: AddMessageDTO): Promise<DisputeMessage> {
    // Verify user can access dispute
    await this.getDisputeById(disputeId, userId);

    const result = await query(
      `INSERT INTO dispute_messages (dispute_id, user_id, message, is_admin)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [disputeId, userId, data.message]
    );

    const message = result.rows[0] as DisputeMessage;
    logger.info('Dispute message added', { disputeId, userId });

    // Update dispute status to awaiting_response if it was under_review
    await query(
      `UPDATE disputes SET status = 'awaiting_response', updated_at = NOW()
       WHERE id = $1 AND status = 'under_review'`,
      [disputeId]
    );

    return message;
  }

  /**
   * Get messages for a dispute
   */
  async getDisputeMessages(disputeId: string, userId: string): Promise<DisputeMessage[]> {
    // Verify user can access dispute
    await this.getDisputeById(disputeId, userId);

    const result = await query(
      `SELECT dm.*, u.name as user_name
       FROM dispute_messages dm
       LEFT JOIN users u ON dm.user_id = u.id
       WHERE dm.dispute_id = $1
       ORDER BY dm.created_at ASC`,
      [disputeId]
    );

    return result.rows;
  }

  /**
   * Close a dispute (by user)
   */
  async closeDispute(disputeId: string, userId: string): Promise<DisputeResponseDTO> {
    const dispute = await this.getDisputeById(disputeId, userId);

    if (dispute.user_id !== userId) {
      throw new ForbiddenError('Only dispute creator can close it');
    }

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      throw new ValidationError('Dispute is already resolved or closed');
    }

    await query(
      `UPDATE disputes
       SET status = 'closed', resolved_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [disputeId]
    );

    logger.info('Dispute closed by user', { disputeId, userId });

    return this.getDisputeById(disputeId, userId);
  }

  /**
   * Escalate a dispute
   */
  async escalateDispute(disputeId: string, userId: string): Promise<DisputeResponseDTO> {
    const dispute = await this.getDisputeById(disputeId, userId);

    if (dispute.user_id !== userId) {
      throw new ForbiddenError('Only dispute creator can escalate it');
    }

    if (dispute.status === 'resolved' || dispute.status === 'closed' || dispute.status === 'escalated') {
      throw new ValidationError('Cannot escalate this dispute');
    }

    await query(
      `UPDATE disputes
       SET status = 'escalated', updated_at = NOW()
       WHERE id = $1`,
      [disputeId]
    );

    logger.info('Dispute escalated', { disputeId, userId });

    // Add system message
    await query(
      `INSERT INTO dispute_messages (dispute_id, message, is_admin)
       VALUES ($1, $2, true)`,
      [disputeId, 'This dispute has been escalated for priority review.']
    );

    return this.getDisputeById(disputeId, userId);
  }

  /**
   * Get dispute statistics for user
   */
  async getUserDisputeStats(userId: string): Promise<DisputeStatistics> {
    const result = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'open') as open,
        COUNT(*) FILTER (WHERE status = 'under_review' OR status = 'awaiting_response') as under_review,
        COUNT(*) FILTER (WHERE status = 'resolved' OR status = 'closed') as resolved
       FROM disputes
       WHERE user_id = $1 OR disputed_user_id = $1`,
      [userId]
    );

    const stats = result.rows[0];

    // Get counts by type
    const typeResult = await query(
      `SELECT dispute_type, COUNT(*) as count
       FROM disputes
       WHERE user_id = $1 OR disputed_user_id = $1
       GROUP BY dispute_type`,
      [userId]
    );

    const byType: Record<string, number> = {
      payment: 0,
      ride: 0,
      service: 0,
      driver: 0,
      passenger: 0,
      other: 0,
    };

    typeResult.rows.forEach((row: { dispute_type: string; count: string }) => {
      byType[row.dispute_type] = parseInt(row.count, 10);
    });

    return {
      total: parseInt(stats.total, 10),
      open: parseInt(stats.open, 10),
      under_review: parseInt(stats.under_review, 10),
      resolved: parseInt(stats.resolved, 10),
      by_type: byType as Record<any, number>,
    };
  }
}

export const disputeService = new DisputeService();
