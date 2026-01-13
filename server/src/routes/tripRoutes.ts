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

/**
 * @route PUT /api/trips/:id
 * @desc Update a trip (reschedule)
 * @access Private
 */
router.put(
  '/:id',
  authenticateToken as RequestHandler,
  tripController.updateTrip as RequestHandler
);

/**
 * @route DELETE /api/trips/:id
 * @desc Cancel/delete a trip
 * @access Private
 */
router.delete(
  '/:id',
  authenticateToken as RequestHandler,
  tripController.deleteTrip as RequestHandler
);

export default router;
