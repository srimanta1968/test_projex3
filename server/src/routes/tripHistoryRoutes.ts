import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import tripHistoryController from '../controllers/tripHistoryController';

const router: Router = Router();

/**
 * @route GET /api/trip-history
 * @desc Get user's trip history
 * @access Private
 */
router.get(
  '/',
  authenticateToken as RequestHandler,
  tripHistoryController.getTripHistory as RequestHandler
);

export default router;
