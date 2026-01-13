import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import feedbackController from '../controllers/feedbackController';

const router: Router = Router();

/**
 * @route POST /api/feedback
 * @desc Create new feedback
 * @access Private
 */
router.post(
  '/',
  authenticateToken as RequestHandler,
  feedbackController.createFeedback as RequestHandler
);

/**
 * @route GET /api/feedback
 * @desc Get user's feedback
 * @access Private
 */
router.get(
  '/',
  authenticateToken as RequestHandler,
  feedbackController.getUserFeedback as RequestHandler
);

/**
 * @route GET /api/feedback/rating
 * @desc Get user's average rating
 * @access Private
 */
router.get(
  '/rating',
  authenticateToken as RequestHandler,
  feedbackController.getUserRating as RequestHandler
);

export default router;
