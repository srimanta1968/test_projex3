import { dataService } from './dataService';
import { v4 as uuidv4 } from 'uuid';

export interface Payment {
  id: string;
  payment_id: string;
  user_id: string;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentInput {
  amount: number;
  payment_method: string;
}

export interface PaymentResult {
  payment: Payment;
}

/**
 * Simulated payment gateway response
 */
interface GatewayResponse {
  success: boolean;
  transactionId: string;
  status: 'approved' | 'declined' | 'pending';
  message: string;
}

/**
 * Payment service with simulated payment gateway integration
 * Supports Stripe-like API patterns for future real integration
 */
export const paymentService = {
  /**
   * Simulate payment gateway processing
   * In production, this would call actual payment provider APIs
   */
  async processWithGateway(amount: number, paymentMethod: string): Promise<GatewayResponse> {
    // Simulate gateway processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate success for amounts under $1000, failure for higher amounts
    const isApproved = amount < 1000;

    return {
      success: isApproved,
      transactionId: uuidv4(),
      status: isApproved ? 'approved' : 'declined',
      message: isApproved ? 'Payment approved' : 'Payment declined - amount exceeds limit',
    };
  },

  /**
   * Create a new payment
   */
  async createPayment(userId: string, input: CreatePaymentInput): Promise<PaymentResult> {
    const paymentId = uuidv4();
    const id = uuidv4();
    const now = new Date();

    // Process with simulated gateway
    const gatewayResult = await this.processWithGateway(input.amount, input.payment_method);

    const status = gatewayResult.success ? 'pending' : 'failed';

    const result = await dataService.query<Payment>(
      `INSERT INTO payments (id, payment_id, user_id, amount, payment_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $6)
       RETURNING id, payment_id, user_id, amount, payment_status, created_at, updated_at`,
      [id, paymentId, userId, input.amount, status, now]
    );

    return {
      payment: result[0],
    };
  },

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string, userId: string): Promise<Payment | null> {
    const result = await dataService.query<Payment>(
      `SELECT id, payment_id, user_id, amount, payment_status, created_at, updated_at
       FROM payments
       WHERE id = $1 AND user_id = $2`,
      [paymentId, userId]
    );

    return result[0] || null;
  },

  /**
   * Get all payments for a user
   */
  async getUserPayments(userId: string): Promise<Payment[]> {
    const payments = await dataService.query<Payment>(
      `SELECT id, payment_id, user_id, amount, payment_status, created_at, updated_at
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return payments;
  },

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    userId: string,
    status: Payment['payment_status']
  ): Promise<Payment | null> {
    const now = new Date();

    const result = await dataService.query<Payment>(
      `UPDATE payments
       SET payment_status = $1, updated_at = $2
       WHERE id = $3 AND user_id = $4
       RETURNING id, payment_id, user_id, amount, payment_status, created_at, updated_at`,
      [status, now, paymentId, userId]
    );

    return result[0] || null;
  },

  /**
   * Complete a pending payment
   */
  async completePayment(paymentId: string, userId: string): Promise<Payment | null> {
    return this.updatePaymentStatus(paymentId, userId, 'completed');
  },
};

export default paymentService;
