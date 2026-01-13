import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { feedbackService } from '../services/feedbackService';

export const feedbackController = {
  /**
   * Create new feedback
   */
  async createFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { rating, comments } = req.body;

      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          error: 'Rating must be a number between 1 and 5',
        });
        return;
      }

      if (!comments || typeof comments !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Comments are required',
        });
        return;
      }

      const result = await feedbackService.createFeedback(req.user.userId, {
        rating,
        comments,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Create feedback error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create feedback',
      });
    }
  },

  /**
   * Get user's feedback
   */
  async getUserFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const result = await feedbackService.getUserFeedback(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get user feedback error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve feedback',
      });
    }
  },

  /**
   * Get user's average rating
   */
  async getUserRating(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const averageRating = await feedbackService.getUserAverageRating(
        req.user.userId
      );

      res.status(200).json({
        success: true,
        data: {
          averageRating,
        },
      });
    } catch (error) {
      console.error('Get user rating error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve rating',
      });
    }
  },
};

export default feedbackController;
