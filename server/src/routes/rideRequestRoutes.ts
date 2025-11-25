import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { rideRequestService } from '../services/RideRequestService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/rides/requests
 * Get all requests made by the authenticated user
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const limit = parseInt(req.query.limit as string) || 20;
    const requests = await rideRequestService.getRequestsByUser(authReq.user!.userId, limit);
    res.json({ success: true, data: requests });
  })
);

/**
 * GET /api/rides/requests/incoming
 * Get requests for the user's offers (as driver)
 */
router.get(
  '/incoming',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const limit = parseInt(req.query.limit as string) || 20;
    const requests = await rideRequestService.getRequestsForMyOffers(authReq.user!.userId, limit);
    res.json({ success: true, data: requests });
  })
);

/**
 * GET /api/rides/requests/pending-count
 * Get count of pending requests for user's offers
 */
router.get(
  '/pending-count',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const count = await rideRequestService.getPendingRequestsCount(authReq.user!.userId);
    res.json({ success: true, data: { count } });
  })
);

/**
 * GET /api/rides/requests/:id
 * Get a specific request by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const request = await rideRequestService.getRequestById(req.params.id);
    res.json({ success: true, data: request });
  })
);

/**
 * POST /api/rides/requests
 * Create a new ride request
 */
router.post(
  '/',
  [
    body('offer_id').notEmpty().withMessage('Offer ID is required'),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const request = await rideRequestService.createRequest(authReq.user!.userId, req.body);
    res.status(201).json({ success: true, data: request });
  })
);

/**
 * PUT /api/rides/requests/:id/status
 * Update request status (accept/reject) - for drivers
 */
router.put(
  '/:id/status',
  [
    body('status')
      .isIn(['accepted', 'rejected'])
      .withMessage('Status must be accepted or rejected'),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const request = await rideRequestService.updateRequestStatus(
      authReq.user!.userId,
      req.params.id,
      req.body.status
    );
    res.json({ success: true, data: request });
  })
);

/**
 * DELETE /api/rides/requests/:id
 * Cancel a request (as requester)
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    await rideRequestService.cancelRequest(authReq.user!.userId, req.params.id);
    res.json({ success: true, message: 'Request cancelled' });
  })
);

export default router;
