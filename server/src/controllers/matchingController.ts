import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { matchingService } from '../services/matchingService';

export const matchingController = {
  /**
   * Find matching trips for a given trip
   */
  async findMatches(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { trip_id } = req.body;

      if (!trip_id) {
        res.status(400).json({
          success: false,
          error: 'Trip ID is required',
        });
        return;
      }

      const result = await matchingService.findMatches(trip_id, req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Find matches error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to find matches',
      });
    }
  },

  /**
   * Get user's matched trips
   */
  async getUserMatches(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const matches = await matchingService.getUserMatches(req.user.userId);

      res.status(200).json({
        success: true,
        data: {
          matches,
        },
      });
    } catch (error) {
      console.error('Get user matches error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve matches',
      });
    }
  },

  /**
   * Create a match between trips
   */
  async createMatch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { trip_id, matched_trip_id } = req.body;

      if (!trip_id || !matched_trip_id) {
        res.status(400).json({
          success: false,
          error: 'Trip ID and matched trip ID are required',
        });
        return;
      }

      const match = await matchingService.createMatch(trip_id, matched_trip_id, req.user.userId);

      if (!match) {
        res.status(500).json({
          success: false,
          error: 'Failed to create match',
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          match,
        },
      });
    } catch (error) {
      console.error('Create match error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create match',
      });
    }
  },
};

export default matchingController;
