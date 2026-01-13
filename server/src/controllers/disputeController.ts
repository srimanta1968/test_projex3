import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { disputeService, CreateDisputeInput } from '../services/disputeService';

/**
 * Controller for handling dispute-related requests
 */
export const disputeController = {
  /**
   * Create a new dispute
   */
  async createDispute(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { payment_id, trip_id, reason, details } = req.body;

      if (!payment_id) {
        res.status(400).json({
          success: false,
          error: 'Payment ID is required',
        });
        return;
      }

      if (!reason || reason.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Dispute reason is required',
        });
        return;
      }

      const input: CreateDisputeInput = {
        payment_id,
        trip_id,
        reason: reason.trim(),
        details: details?.trim(),
      };

      const result = await disputeService.createDispute(req.user.userId, input);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Dispute has been filed successfully',
      });
    } catch (error) {
      console.error('Create dispute error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create dispute',
      });
    }
  },

  /**
   * Get a specific dispute by ID
   */
  async getDispute(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { dispute_id } = req.params;

      if (!dispute_id) {
        res.status(400).json({
          success: false,
          error: 'Dispute ID is required',
        });
        return;
      }

      const dispute = await disputeService.getDisputeById(dispute_id, req.user.userId);

      if (!dispute) {
        res.status(404).json({
          success: false,
          error: 'Dispute not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { dispute },
      });
    } catch (error) {
      console.error('Get dispute error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve dispute',
      });
    }
  },

  /**
   * Get all disputes for the authenticated user
   */
  async getUserDisputes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const disputes = await disputeService.getUserDisputes(req.user.userId);

      res.status(200).json({
        success: true,
        data: { disputes },
      });
    } catch (error) {
      console.error('Get user disputes error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve disputes',
      });
    }
  },
};

export default disputeController;
