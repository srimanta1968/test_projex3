import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { billingService, BillingFilters } from '../services/billingService';

/**
 * Controller for handling billing-related requests
 */
export const billingController = {
  /**
   * Get user's billing history
   */
  async getBillingHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Parse query parameters for filters
      const filters: BillingFilters = {};

      if (req.query.type && typeof req.query.type === 'string') {
        filters.type = req.query.type;
      }

      if (req.query.startDate && typeof req.query.startDate === 'string') {
        filters.startDate = req.query.startDate;
      }

      if (req.query.endDate && typeof req.query.endDate === 'string') {
        filters.endDate = req.query.endDate;
      }

      if (req.query.minAmount && typeof req.query.minAmount === 'string') {
        const minAmount = parseFloat(req.query.minAmount);
        if (!isNaN(minAmount)) {
          filters.minAmount = minAmount;
        }
      }

      if (req.query.maxAmount && typeof req.query.maxAmount === 'string') {
        const maxAmount = parseFloat(req.query.maxAmount);
        if (!isNaN(maxAmount)) {
          filters.maxAmount = maxAmount;
        }
      }

      const result = await billingService.getBillingHistory(req.user.userId, filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get billing history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve billing history',
      });
    }
  },

  /**
   * Get a specific billing record
   */
  async getBillingRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { record_id } = req.params;

      if (!record_id) {
        res.status(400).json({
          success: false,
          error: 'Record ID is required',
        });
        return;
      }

      const record = await billingService.getBillingRecord(record_id, req.user.userId);

      if (!record) {
        res.status(404).json({
          success: false,
          error: 'Billing record not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { record },
      });
    } catch (error) {
      console.error('Get billing record error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve billing record',
      });
    }
  },
};

export default billingController;
