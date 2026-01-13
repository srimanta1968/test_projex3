import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import notificationController from '../controllers/notificationController';

const router: Router = Router();

/**
 * @route GET /api/notifications
 * @desc Get user notifications
 * @access Private
 */
router.get(
  '/',
  authenticateToken as RequestHandler,
  notificationController.getNotifications as RequestHandler
);

/**
 * @route PUT /api/notifications/:notification_id/read
 * @desc Mark a notification as read
 * @access Private
 */
router.put(
  '/:notification_id/read',
  authenticateToken as RequestHandler,
  notificationController.markAsRead as RequestHandler
);

/**
 * @route PUT /api/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.put(
  '/read-all',
  authenticateToken as RequestHandler,
  notificationController.markAllAsRead as RequestHandler
);

export default router;
