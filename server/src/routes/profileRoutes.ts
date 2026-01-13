import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import profileController from '../controllers/profileController';

const router: Router = Router();

/**
 * @route GET /api/profile
 * @desc Get current user's profile
 * @access Private
 */
router.get(
  '/',
  authenticateToken as RequestHandler,
  profileController.getProfile as RequestHandler
);

/**
 * @route PUT /api/profile
 * @desc Update current user's profile
 * @access Private
 */
router.put(
  '/',
  authenticateToken as RequestHandler,
  profileController.updateProfile as RequestHandler
);

export default router;
