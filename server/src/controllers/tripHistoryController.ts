import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { tripHistoryService } from '../services/tripHistoryService';

export const tripHistoryController = {
  /**
   * Get trip history for authenticated user
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

      const result = await tripHistoryService.getTripHistory(req.user.userId);

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
