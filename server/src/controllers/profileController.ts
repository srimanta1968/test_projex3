import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { profileService } from '../services/profileService';

export const profileController = {
  /**
   * Get current user's profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const result = await profileService.getProfile(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve profile',
      });
    }
  },

  /**
   * Update current user's profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { preferences } = req.body;

      if (!preferences || typeof preferences !== 'object') {
        res.status(400).json({
          success: false,
          error: 'Valid preferences object is required',
        });
        return;
      }

      const result = await profileService.updateProfile(req.user.userId, preferences);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
      });
    }
  },
};

export default profileController;
