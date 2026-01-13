import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import matchingController from '../controllers/matchingController';

const router: Router = Router();

/**
 * @route POST /api/matching/find
 * @desc Find matching trips for a given trip
 * @access Private
 */
router.post(
  '/find',
  authenticateToken as RequestHandler,
  matchingController.findMatches as RequestHandler
);

/**
 * @route GET /api/matching
 * @desc Get user's matched trips
 * @access Private
 */
router.get(
  '/',
  authenticateToken as RequestHandler,
  matchingController.getUserMatches as RequestHandler
);

/**
 * @route POST /api/matching
 * @desc Create a match between trips
 * @access Private
 */
router.post(
  '/',
  authenticateToken as RequestHandler,
  matchingController.createMatch as RequestHandler
);

export default router;
