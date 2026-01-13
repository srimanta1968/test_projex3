import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import disputeController from '../controllers/disputeController';

const router: Router = Router();

/**
 * @route POST /api/disputes
 * @desc Create a new dispute for a charge
 * @access Private
 */
router.post(
  '/',
  authenticateToken as RequestHandler,
  disputeController.createDispute as RequestHandler
);

/**
 * @route GET /api/disputes
 * @desc Get all disputes for the user
 * @access Private
 */
router.get(
  '/',
  authenticateToken as RequestHandler,
  disputeController.getUserDisputes as RequestHandler
);

/**
 * @route GET /api/disputes/:dispute_id
 * @desc Get a specific dispute
 * @access Private
 */
router.get(
  '/:dispute_id',
  authenticateToken as RequestHandler,
  disputeController.getDispute as RequestHandler
);

export default router;
