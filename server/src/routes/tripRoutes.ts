import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import tripController from '../controllers/tripController';

const router: Router = Router();

/**
 * @route POST /api/trips
 * @desc Create a new trip
 * @access Private
 */
router.post(
  '/',
  authenticateToken as RequestHandler,
  tripController.createTrip as RequestHandler
);

/**
 * @route GET /api/trips
 * @desc Get user's trips
 * @access Private
 */
router.get(
  '/',
  authenticateToken as RequestHandler,
  tripController.getUserTrips as RequestHandler
);

export default router;
