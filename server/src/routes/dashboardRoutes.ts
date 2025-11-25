import { Router, Request, Response } from 'express';
import { dashboardService } from '../services/DashboardService';
import { authenticate } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard data for authenticated user
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const dashboardData = await dashboardService.getDashboardData(userId);

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  })
);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics only
 * @access  Private
 */
router.get(
  '/stats',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const stats = await dashboardService.getStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  })
);

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get recent activity
 * @access  Private
 */
router.get(
  '/activity',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const activity = await dashboardService.getRecentActivity(userId, limit);

    res.status(200).json({
      success: true,
      data: activity,
    });
  })
);

/**
 * @route   GET /api/dashboard/offers
 * @desc    Get user's ride offers
 * @access  Private
 */
router.get(
  '/offers',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const offers = await dashboardService.getMyOffers(userId, limit);

    res.status(200).json({
      success: true,
      data: offers,
    });
  })
);

/**
 * @route   GET /api/dashboard/requests
 * @desc    Get user's ride requests
 * @access  Private
 */
router.get(
  '/requests',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const requests = await dashboardService.getMyRequests(userId, limit);

    res.status(200).json({
      success: true,
      data: requests,
    });
  })
);

export default router;
