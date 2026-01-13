import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { tripHistoryService, TripHistoryFilters } from '../services/tripHistoryService';

export const tripHistoryController = {
  /**
   * Get trip history for authenticated user with optional filters
   */
  async getTripHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const filters: TripHistoryFilters = {};

      if (req.query.destination && typeof req.query.destination === 'string') {
        filters.destination = req.query.destination;
      }

      if (req.query.startDate && typeof req.query.startDate === 'string') {
        filters.startDate = req.query.startDate;
      }

      if (req.query.endDate && typeof req.query.endDate === 'string') {
        filters.endDate = req.query.endDate;
      }

      const result = await tripHistoryService.getTripHistory(req.user.userId, filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get trip history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve trip history',
      });
    }
  },
};

export default tripHistoryController;
