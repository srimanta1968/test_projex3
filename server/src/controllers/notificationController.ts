import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { notificationService } from '../services/notificationService';

/**
 * Controller for handling notification-related requests
 */
export const notificationController = {
  /**
   * Get notifications for the authenticated user
   */
  async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const result = await notificationService.getUserNotifications(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve notifications',
      });
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { notification_id } = req.params;

      if (!notification_id) {
        res.status(400).json({
          success: false,
          error: 'Notification ID is required',
        });
        return;
      }

      await notificationService.markAsRead(notification_id, req.user.userId);

      res.status(200).json({
        success: true,
        data: {
          message: 'Notification marked as read',
        },
      });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read',
      });
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      await notificationService.markAllAsRead(req.user.userId);

      res.status(200).json({
        success: true,
        data: {
          message: 'All notifications marked as read',
        },
      });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notifications as read',
      });
    }
  },
};

export default notificationController;
