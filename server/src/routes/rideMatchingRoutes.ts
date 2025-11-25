import { Router, Request, Response } from 'express';
import { body, query as queryValidator } from 'express-validator';
import { rideMatchingService } from '../services/RideMatchingService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/rides/matches/suggestions
 * Get matching ride suggestions based on location and preferences
 */
router.get(
  '/suggestions',
  [
    queryValidator('pickup_location').optional().isString(),
    queryValidator('dropoff_location').optional().isString(),
    queryValidator('limit').optional().isInt({ min: 1, max: 50 }),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const pickupLocation = (req.query.pickup_location as string) || '';
    const dropoffLocation = (req.query.dropoff_location as string) || '';
    const limit = parseInt(req.query.limit as string) || 10;

    const suggestions = await rideMatchingService.findMatchingSuggestions(
      authReq.user!.userId,
      pickupLocation,
      dropoffLocation,
      limit
    );

    res.json({ success: true, data: suggestions });
  })
);

/**
 * GET /api/rides/matches/statistics
 * Get match statistics for the current user
 */
router.get(
  '/statistics',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const statistics = await rideMatchingService.getMatchStatistics(authReq.user!.userId);
    res.json({ success: true, data: statistics });
  })
);

/**
 * GET /api/rides/matches/rider
 * Get all matches for user as rider
 */
router.get(
  '/rider',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const limit = parseInt(req.query.limit as string) || 20;
    const matches = await rideMatchingService.getMatchesAsRider(authReq.user!.userId, limit);
    res.json({ success: true, data: matches });
  })
);

/**
 * GET /api/rides/matches/driver
 * Get all matches for user as driver
 */
router.get(
  '/driver',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const limit = parseInt(req.query.limit as string) || 20;
    const matches = await rideMatchingService.getMatchesAsDriver(authReq.user!.userId, limit);
    res.json({ success: true, data: matches });
  })
);

/**
 * GET /api/rides/matches/:id
 * Get a specific match by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const match = await rideMatchingService.getMatchById(req.params.id);
    res.json({ success: true, data: match });
  })
);

/**
 * POST /api/rides/matches/accept
 * Accept a request and create a match (for drivers)
 */
router.post(
  '/accept',
  [
    body('request_id').notEmpty().withMessage('Request ID is required'),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const match = await rideMatchingService.acceptRequestAndMatch(
      authReq.user!.userId,
      req.body.request_id
    );
    res.status(201).json({ success: true, data: match });
  })
);

/**
 * POST /api/rides/matches/:id/complete
 * Complete a ride
 */
router.post(
  '/:id/complete',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const match = await rideMatchingService.completeRide(req.params.id, authReq.user!.userId);
    res.json({ success: true, data: match });
  })
);

/**
 * POST /api/rides/matches/:id/cancel
 * Cancel a match
 */
router.post(
  '/:id/cancel',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    await rideMatchingService.cancelMatch(req.params.id, authReq.user!.userId);
    res.json({ success: true, message: 'Match cancelled' });
  })
);

export default router;
