import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import refundController from '../controllers/refundController';

const router: Router = Router();

/**
 * @route POST /api/refunds
 * @desc Create a new refund request
 * @access Private
 */
router.post(
  '/',
  authenticateToken as RequestHandler,
  refundController.createRefund as RequestHandler
);

/**
 * @route GET /api/refunds
 * @desc Get all refunds for the user
 * @access Private
 */
router.get(
  '/',
  authenticateToken as RequestHandler,
  refundController.getUserRefunds as RequestHandler
);

/**
 * @route GET /api/refunds/:refund_id
 * @desc Get a specific refund
 * @access Private
 */
router.get(
  '/:refund_id',
  authenticateToken as RequestHandler,
  refundController.getRefund as RequestHandler
);

/**
 * @route PUT /api/refunds/:refund_id/status
 * @desc Update refund status (approve/reject)
 * @access Private
 */
router.put(
  '/:refund_id/status',
  authenticateToken as RequestHandler,
  refundController.updateRefundStatus as RequestHandler
);

/**
 * @route PUT /api/refunds/:refund_id/process
 * @desc Process an approved refund
 * @access Private
 */
router.put(
  '/:refund_id/process',
  authenticateToken as RequestHandler,
  refundController.processRefund as RequestHandler
);

export default router;
