import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { paymentService, CreatePaymentInput } from '../services/paymentService';

/**
 * Controller for handling payment-related requests
 */
export const paymentController = {
  /**
   * Create a new payment
   */
  async createPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { amount, payment_method } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Valid amount is required',
        });
        return;
      }

      if (!payment_method) {
        res.status(400).json({
          success: false,
          error: 'Payment method is required',
        });
        return;
      }

      const input: CreatePaymentInput = {
        amount: parseFloat(amount),
        payment_method,
      };

      const result = await paymentService.createPayment(req.user.userId, input);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment',
      });
    }
  },

  /**
   * Get a specific payment by ID
   */
  async getPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { payment_id } = req.params;

      if (!payment_id) {
        res.status(400).json({
          success: false,
          error: 'Payment ID is required',
        });
        return;
      }

      const payment = await paymentService.getPaymentById(payment_id, req.user.userId);

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve payment',
      });
    }
  },

  /**
   * Get all payments for the authenticated user
   */
  async getUserPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const payments = await paymentService.getUserPayments(req.user.userId);

      res.status(200).json({
        success: true,
        data: { payments },
      });
    } catch (error) {
      console.error('Get user payments error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve payments',
      });
    }
  },

  /**
   * Complete a pending payment
   */
  async completePayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { payment_id } = req.params;

      if (!payment_id) {
        res.status(400).json({
          success: false,
          error: 'Payment ID is required',
        });
        return;
      }

      const payment = await paymentService.completePayment(payment_id, req.user.userId);

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      console.error('Complete payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete payment',
      });
    }
  },
};

export default paymentController;
