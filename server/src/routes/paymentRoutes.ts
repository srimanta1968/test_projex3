import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import paymentController from '../controllers/paymentController';

const router: Router = Router();

/**
 * @route POST /api/payments
 * @desc Create a new payment
 * @access Private
 */
router.post(
  '/',
  authenticateToken as RequestHandler,
  paymentController.createPayment as RequestHandler
);

/**
 * @route GET /api/payments
 * @desc Get all payments for the user
 * @access Private
 */
router.get(
  '/',
  authenticateToken as RequestHandler,
  paymentController.getUserPayments as RequestHandler
);

/**
 * @route GET /api/payments/:payment_id
 * @desc Get a specific payment
 * @access Private
 */
router.get(
  '/:payment_id',
  authenticateToken as RequestHandler,
  paymentController.getPayment as RequestHandler
);

/**
 * @route PUT /api/payments/:payment_id/complete
 * @desc Complete a pending payment
 * @access Private
 */
router.put(
  '/:payment_id/complete',
  authenticateToken as RequestHandler,
  paymentController.completePayment as RequestHandler
);

export default router;
