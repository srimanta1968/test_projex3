import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { refundService, CreateRefundInput } from '../services/refundService';
import { notificationService } from '../services/notificationService';

/**
 * Controller for handling refund-related requests
 */
export const refundController = {
  /**
   * Create a new refund request
   */
  async createRefund(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { payment_id, amount, reason } = req.body;

      if (!payment_id) {
        res.status(400).json({
          success: false,
          error: 'Payment ID is required',
        });
        return;
      }

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Valid refund amount is required',
        });
        return;
      }

      if (!reason || reason.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Refund reason is required',
        });
        return;
      }

      const input: CreateRefundInput = {
        payment_id,
        amount: parseFloat(amount),
        reason: reason.trim(),
      };

      const result = await refundService.createRefund(req.user.userId, input);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Create refund error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create refund request',
      });
    }
  },

  /**
   * Get a specific refund by ID
   */
  async getRefund(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { refund_id } = req.params;

      if (!refund_id) {
        res.status(400).json({
          success: false,
          error: 'Refund ID is required',
        });
        return;
      }

      const refund = await refundService.getRefundById(refund_id, req.user.userId);

      if (!refund) {
        res.status(404).json({
          success: false,
          error: 'Refund not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { refund },
      });
    } catch (error) {
      console.error('Get refund error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve refund',
      });
    }
  },

  /**
   * Get all refunds for the authenticated user
   */
  async getUserRefunds(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const refunds = await refundService.getUserRefunds(req.user.userId);

      res.status(200).json({
        success: true,
        data: { refunds },
      });
    } catch (error) {
      console.error('Get user refunds error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve refunds',
      });
    }
  },

  /**
   * Update refund status (approve/reject)
   */
  async updateRefundStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { refund_id } = req.params;
      const { status } = req.body;

      if (!refund_id) {
        res.status(400).json({
          success: false,
          error: 'Refund ID is required',
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'Status is required',
        });
        return;
      }

      if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({
          success: false,
          error: "Invalid status. Must be 'approved' or 'rejected'",
        });
        return;
      }

      const refund = await refundService.updateRefundStatus(refund_id, req.user.userId, status);

      if (!refund) {
        res.status(404).json({
          success: false,
          error: 'Refund not found',
        });
        return;
      }

      // Create notification for status change
      await notificationService.createRefundNotification(
        req.user.userId,
        refund.refund_id,
        refund.amount,
        status
      );

      res.status(200).json({
        success: true,
        data: { refund },
      });
    } catch (error) {
      console.error('Update refund status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update refund status',
      });
    }
  },

  /**
   * Process an approved refund
   */
  async processRefund(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { refund_id } = req.params;

      if (!refund_id) {
        res.status(400).json({
          success: false,
          error: 'Refund ID is required',
        });
        return;
      }

      const refund = await refundService.processRefund(refund_id, req.user.userId);

      if (!refund) {
        res.status(404).json({
          success: false,
          error: 'Refund not found or not approved',
        });
        return;
      }

      // Create notification for processed refund
      await notificationService.createRefundNotification(
        req.user.userId,
        refund.refund_id,
        refund.amount,
        'processed'
      );

      res.status(200).json({
        success: true,
        data: { refund },
      });
    } catch (error) {
      console.error('Process refund error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process refund',
      });
    }
  },
  /**
   * Get refund notifications for the authenticated user
   */
  async getRefundNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const result = await notificationService.getRefundNotifications(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get refund notifications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve refund notifications',
      });
    }
  },

  /**
   * Cancel a pending refund request
   */
  async cancelRefund(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { refund_id } = req.params;

      if (!refund_id) {
        res.status(400).json({
          success: false,
          error: 'Refund ID is required',
        });
        return;
      }

      const refund = await refundService.cancelRefund(refund_id, req.user.userId);

      if (!refund) {
        res.status(404).json({
          success: false,
          error: 'Refund not found or cannot be cancelled',
        });
        return;
      }

      // Create notification for cancelled refund
      await notificationService.createRefundNotification(
        req.user.userId,
        refund.refund_id,
        refund.amount,
        'cancelled'
      );

      res.status(200).json({
        success: true,
        data: { refund },
        message: 'Refund request cancelled successfully',
      });
    } catch (error) {
      console.error('Cancel refund error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel refund request',
      });
    }
  },
};

export default refundController;
