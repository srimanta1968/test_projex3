import { Router, Request, Response } from 'express';
import { body, param, query as queryValidator } from 'express-validator';
import { disputeService } from '../services/DisputeService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { DisputeStatus } from '../models/Dispute';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/disputes
 * Create a new dispute
 */
router.post(
  '/',
  [
    body('dispute_type')
      .isIn(['payment', 'ride', 'service', 'driver', 'passenger', 'other'])
      .withMessage('Invalid dispute type'),
    body('reason').notEmpty().withMessage('Reason is required'),
    body('transaction_id').optional().isUUID(),
    body('disputed_user_id').optional().isUUID(),
    body('description').optional().isString(),
    body('evidence_urls').optional().isArray(),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const dispute = await disputeService.createDispute(authReq.user!.userId, req.body);
    res.status(201).json({ success: true, data: dispute });
  })
);

/**
 * GET /api/disputes
 * Get user's disputes
 */
router.get(
  '/',
  [
    queryValidator('status')
      .optional()
      .isIn(['open', 'under_review', 'awaiting_response', 'resolved', 'closed', 'escalated']),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const status = req.query.status as DisputeStatus | undefined;
    const disputes = await disputeService.getUserDisputes(authReq.user!.userId, status);
    res.json({ success: true, data: disputes });
  })
);

/**
 * GET /api/disputes/statistics
 * Get user's dispute statistics
 */
router.get(
  '/statistics',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const stats = await disputeService.getUserDisputeStats(authReq.user!.userId);
    res.json({ success: true, data: stats });
  })
);

/**
 * GET /api/disputes/:id
 * Get a specific dispute
 */
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid dispute ID'), validateRequest],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const dispute = await disputeService.getDisputeById(req.params.id, authReq.user!.userId);
    res.json({ success: true, data: dispute });
  })
);

/**
 * PUT /api/disputes/:id
 * Update a dispute
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid dispute ID'),
    body('status')
      .optional()
      .isIn(['open', 'under_review', 'awaiting_response', 'resolved', 'closed', 'escalated']),
    body('resolution').optional().isString(),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const dispute = await disputeService.updateDispute(
      req.params.id,
      authReq.user!.userId,
      req.body
    );
    res.json({ success: true, data: dispute });
  })
);

/**
 * POST /api/disputes/:id/messages
 * Add a message to a dispute
 */
router.post(
  '/:id/messages',
  [
    param('id').isUUID().withMessage('Invalid dispute ID'),
    body('message').notEmpty().withMessage('Message is required'),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const message = await disputeService.addMessage(
      req.params.id,
      authReq.user!.userId,
      req.body
    );
    res.status(201).json({ success: true, data: message });
  })
);

/**
 * GET /api/disputes/:id/messages
 * Get messages for a dispute
 */
router.get(
  '/:id/messages',
  [param('id').isUUID().withMessage('Invalid dispute ID'), validateRequest],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const messages = await disputeService.getDisputeMessages(
      req.params.id,
      authReq.user!.userId
    );
    res.json({ success: true, data: messages });
  })
);

/**
 * POST /api/disputes/:id/close
 * Close a dispute
 */
router.post(
  '/:id/close',
  [param('id').isUUID().withMessage('Invalid dispute ID'), validateRequest],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const dispute = await disputeService.closeDispute(req.params.id, authReq.user!.userId);
    res.json({ success: true, data: dispute });
  })
);

/**
 * POST /api/disputes/:id/escalate
 * Escalate a dispute
 */
router.post(
  '/:id/escalate',
  [param('id').isUUID().withMessage('Invalid dispute ID'), validateRequest],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const dispute = await disputeService.escalateDispute(req.params.id, authReq.user!.userId);
    res.json({ success: true, data: dispute });
  })
);

export default router;
