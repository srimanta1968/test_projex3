import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { paymentService } from '../services/PaymentService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// ==================== Payment Methods ====================

/**
 * GET /api/payments/methods
 * Get all payment methods for user
 */
router.get(
  '/methods',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const methods = await paymentService.getPaymentMethods(authReq.user!.userId);
    res.json({ success: true, data: methods });
  })
);

/**
 * GET /api/payments/methods/:id
 * Get a specific payment method
 */
router.get(
  '/methods/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const method = await paymentService.getPaymentMethodById(authReq.user!.userId, req.params.id);
    res.json({ success: true, data: method });
  })
);

/**
 * POST /api/payments/methods
 * Add a payment method
 */
router.post(
  '/methods',
  [
    body('card_last_four')
      .isLength({ min: 4, max: 4 })
      .withMessage('Card last four digits required'),
    body('expiry_month').isInt({ min: 1, max: 12 }).withMessage('Valid expiry month required'),
    body('expiry_year').isInt({ min: 2024 }).withMessage('Valid expiry year required'),
    body('cardholder_name').notEmpty().withMessage('Cardholder name is required'),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const method = await paymentService.addPaymentMethod(authReq.user!.userId, req.body);
    res.status(201).json({ success: true, data: method });
  })
);

/**
 * DELETE /api/payments/methods/:id
 * Delete a payment method
 */
router.delete(
  '/methods/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    await paymentService.deletePaymentMethod(authReq.user!.userId, req.params.id);
    res.json({ success: true, message: 'Payment method deleted' });
  })
);

// ==================== Transactions ====================

/**
 * GET /api/payments/transactions
 * Get all transactions for user
 */
router.get(
  '/transactions',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const limit = parseInt(req.query.limit as string) || 20;
    const transactions = await paymentService.getTransactions(authReq.user!.userId, limit);
    res.json({ success: true, data: transactions });
  })
);

/**
 * GET /api/payments/transactions/:id
 * Get a specific transaction
 */
router.get(
  '/transactions/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const transaction = await paymentService.getTransactionById(
      authReq.user!.userId,
      req.params.id
    );
    res.json({ success: true, data: transaction });
  })
);

/**
 * POST /api/payments/transactions
 * Create a transaction
 */
router.post(
  '/transactions',
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required'),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const transaction = await paymentService.createTransaction(authReq.user!.userId, req.body);
    res.status(201).json({ success: true, data: transaction });
  })
);

/**
 * POST /api/payments/transactions/:id/process
 * Process (complete) a transaction
 */
router.post(
  '/transactions/:id/process',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const transaction = await paymentService.processPayment(authReq.user!.userId, req.params.id);
    res.json({ success: true, data: transaction });
  })
);

// ==================== Refunds ====================

/**
 * GET /api/payments/refunds
 * Get all refunds for user
 */
router.get(
  '/refunds',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const limit = parseInt(req.query.limit as string) || 20;
    const refunds = await paymentService.getRefunds(authReq.user!.userId, limit);
    res.json({ success: true, data: refunds });
  })
);

/**
 * GET /api/payments/refunds/:id
 * Get a specific refund
 */
router.get(
  '/refunds/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const refund = await paymentService.getRefundById(authReq.user!.userId, req.params.id);
    res.json({ success: true, data: refund });
  })
);

/**
 * POST /api/payments/refunds
 * Request a refund
 */
router.post(
  '/refunds',
  [
    body('transaction_id').notEmpty().withMessage('Transaction ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Valid refund amount is required'),
    body('reason').optional().isString(),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const refund = await paymentService.requestRefund(authReq.user!.userId, req.body);
    res.status(201).json({ success: true, data: refund });
  })
);

export default router;
