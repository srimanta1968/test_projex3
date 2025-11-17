import { Router, Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const dashboardService = new DashboardService();

/**
 * GET /api/dashboard/overview
 * Get dashboard overview for current user
 */
router.get('/overview', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = await dashboardService.getDashboardOverview(userId);
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/summary
 * Get financial summary for date range
 */
router.get('/summary', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const data = await dashboardService.getFinancialSummary(userId, start, end);
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
