import { query, transaction } from '../config/database';
import {
  PaymentMethod,
  Transaction,
  Refund,
  CreatePaymentMethodDTO,
  CreateTransactionDTO,
  CreateRefundDTO,
  PaymentMethodResponseDTO,
  TransactionResponseDTO,
  RefundResponseDTO,
  TransactionStatus,
  RefundStatus,
  toPaymentMethodResponse,
  toTransactionResponse,
  toRefundResponse,
} from '../models/Payment';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Payment Service - handles payment methods, transactions, and refunds
 */
export class PaymentService {
  // ==================== Payment Methods ====================

  /**
   * Add a payment method for user
   */
  async addPaymentMethod(userId: string, data: CreatePaymentMethodDTO): Promise<PaymentMethodResponseDTO> {
    // Create expiry date from month/year
    const expiryDate = new Date(data.expiry_year, data.expiry_month - 1, 1);

    // Store only last 4 digits as the card number (for demo purposes)
    const cardNumber = parseInt(data.card_last_four, 10);

    const result = await query<PaymentMethod>(
      `INSERT INTO payment_methods (user_id, card_number, expiry_date, cardholder_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, cardNumber, expiryDate, data.cardholder_name]
    );

    logger.info('Payment method added', { userId, cardLastFour: data.card_last_four });

    return toPaymentMethodResponse(result.rows[0]);
  }

  /**
   * Get all payment methods for user
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethodResponseDTO[]> {
    const result = await query<PaymentMethod>(
      'SELECT * FROM payment_methods WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return result.rows.map(toPaymentMethodResponse);
  }

  /**
   * Get payment method by ID
   */
  async getPaymentMethodById(userId: string, methodId: string): Promise<PaymentMethodResponseDTO> {
    const result = await query<PaymentMethod>(
      'SELECT * FROM payment_methods WHERE id = $1 AND user_id = $2',
      [methodId, userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Payment method not found');
    }

    return toPaymentMethodResponse(result.rows[0]);
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(userId: string, methodId: string): Promise<void> {
    const result = await query(
      'DELETE FROM payment_methods WHERE id = $1 AND user_id = $2',
      [methodId, userId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Payment method not found');
    }

    logger.info('Payment method deleted', { userId, methodId });
  }

  // ==================== Transactions ====================

  /**
   * Create a transaction
   */
  async createTransaction(userId: string, data: CreateTransactionDTO): Promise<TransactionResponseDTO> {
    const result = await query<Transaction>(
      `INSERT INTO transactions (user_id, amount, transaction_date, status)
       VALUES ($1, $2, CURRENT_TIMESTAMP, 'pending')
       RETURNING *`,
      [userId, data.amount]
    );

    logger.info('Transaction created', { userId, transactionId: result.rows[0].id, amount: data.amount });

    return toTransactionResponse(result.rows[0]);
  }

  /**
   * Get user's transactions
   */
  async getTransactions(userId: string, limit: number = 20): Promise<TransactionResponseDTO[]> {
    const result = await query<Transaction>(
      `SELECT * FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map(toTransactionResponse);
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(userId: string, transactionId: string): Promise<TransactionResponseDTO> {
    const result = await query<Transaction>(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [transactionId, userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Transaction not found');
    }

    return toTransactionResponse(result.rows[0]);
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus
  ): Promise<TransactionResponseDTO> {
    const result = await query<Transaction>(
      `UPDATE transactions
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, transactionId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Transaction not found');
    }

    logger.info('Transaction status updated', { transactionId, status });

    return toTransactionResponse(result.rows[0]);
  }

  /**
   * Process a payment (complete transaction)
   */
  async processPayment(userId: string, transactionId: string): Promise<TransactionResponseDTO> {
    // Verify ownership
    const check = await query(
      'SELECT id FROM transactions WHERE id = $1 AND user_id = $2 AND status = $3',
      [transactionId, userId, 'pending']
    );

    if (check.rows.length === 0) {
      throw new NotFoundError('Transaction not found or not pending');
    }

    return this.updateTransactionStatus(transactionId, 'completed');
  }

  // ==================== Refunds ====================

  /**
   * Request a refund
   */
  async requestRefund(userId: string, data: CreateRefundDTO): Promise<RefundResponseDTO> {
    return transaction(async (client) => {
      // Verify transaction exists and belongs to user
      const txResult = await client.query(
        'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
        [data.transaction_id, userId]
      );

      if (txResult.rows.length === 0) {
        throw new NotFoundError('Transaction not found');
      }

      const tx = txResult.rows[0];

      if (tx.status !== 'completed') {
        throw new BadRequestError('Can only refund completed transactions');
      }

      if (data.amount > tx.amount) {
        throw new BadRequestError('Refund amount cannot exceed transaction amount');
      }

      // Create refund request
      const refundResult = await client.query(
        `INSERT INTO refunds (transaction_id, user_id, amount, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
        [data.transaction_id, userId, data.amount]
      );

      logger.info('Refund requested', {
        userId,
        transactionId: data.transaction_id,
        refundId: refundResult.rows[0].id,
        amount: data.amount,
      });

      return toRefundResponse(refundResult.rows[0]);
    });
  }

  /**
   * Get user's refunds
   */
  async getRefunds(userId: string, limit: number = 20): Promise<RefundResponseDTO[]> {
    const result = await query<Refund>(
      `SELECT * FROM refunds
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map(toRefundResponse);
  }

  /**
   * Get refund by ID
   */
  async getRefundById(userId: string, refundId: string): Promise<RefundResponseDTO> {
    const result = await query<Refund>(
      'SELECT * FROM refunds WHERE id = $1 AND user_id = $2',
      [refundId, userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Refund not found');
    }

    return toRefundResponse(result.rows[0]);
  }

  /**
   * Update refund status (admin operation)
   */
  async updateRefundStatus(refundId: string, status: RefundStatus): Promise<RefundResponseDTO> {
    return transaction(async (client) => {
      const result = await client.query(
        `UPDATE refunds
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [status, refundId]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Refund not found');
      }

      const refund = result.rows[0];

      // If refund is processed, update the transaction status
      if (status === 'processed') {
        await client.query(
          `UPDATE transactions
           SET status = 'refunded', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [refund.transaction_id]
        );
      }

      logger.info('Refund status updated', { refundId, status });

      return toRefundResponse(refund);
    });
  }
}

export const paymentService = new PaymentService();
export default paymentService;
