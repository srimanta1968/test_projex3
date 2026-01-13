import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import billingController from '../controllers/billingController';

const router: Router = Router();

/**
 * @route GET /api/billing
 * @desc Get user's billing history
 * @access Private
 */
router.get(
  '/',
  authenticateToken as RequestHandler,
  billingController.getBillingHistory as RequestHandler
);

/**
 * @route GET /api/billing/:record_id
 * @desc Get a specific billing record
 * @access Private
 */
router.get(
  '/:record_id',
  authenticateToken as RequestHandler,
  billingController.getBillingRecord as RequestHandler
);

export default router;
