import { Router, Request, Response } from 'express';
import { body, query as queryValidator } from 'express-validator';
import { rideOfferService } from '../services/RideOfferService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/rides/offers
 * Get all offers by the authenticated user
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const limit = parseInt(req.query.limit as string) || 20;
    const offers = await rideOfferService.getOffersByUser(authReq.user!.userId, limit);
    res.json({ success: true, data: offers });
  })
);

/**
 * GET /api/rides/offers/available
 * Get available offers (not owned by user)
 */
router.get(
  '/available',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const limit = parseInt(req.query.limit as string) || 20;
    const offers = await rideOfferService.getAvailableOffers(authReq.user!.userId, limit);
    res.json({ success: true, data: offers });
  })
);

/**
 * GET /api/rides/offers/search
 * Search offers with filters
 */
router.get(
  '/search',
  [
    queryValidator('pickup_location').optional().isString(),
    queryValidator('dropoff_location').optional().isString(),
    queryValidator('min_seats').optional().isInt({ min: 1 }),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      pickup_location: req.query.pickup_location as string | undefined,
      dropoff_location: req.query.dropoff_location as string | undefined,
      min_seats: req.query.min_seats ? parseInt(req.query.min_seats as string) : undefined,
    };
    const limit = parseInt(req.query.limit as string) || 20;
    const offers = await rideOfferService.searchOffers(filters, limit);
    res.json({ success: true, data: offers });
  })
);

/**
 * GET /api/rides/offers/:id
 * Get a specific offer by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const offer = await rideOfferService.getOfferById(req.params.id);
    res.json({ success: true, data: offer });
  })
);

/**
 * POST /api/rides/offers
 * Create a new ride offer
 */
router.post(
  '/',
  [
    body('pickup_location').notEmpty().withMessage('Pickup location is required'),
    body('dropoff_location').notEmpty().withMessage('Dropoff location is required'),
    body('available_seats').isInt({ min: 1 }).withMessage('Available seats must be at least 1'),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const offer = await rideOfferService.createOffer(authReq.user!.userId, req.body);
    res.status(201).json({ success: true, data: offer });
  })
);

/**
 * PUT /api/rides/offers/:id
 * Update a ride offer
 */
router.put(
  '/:id',
  [
    body('pickup_location').optional().notEmpty(),
    body('dropoff_location').optional().notEmpty(),
    body('available_seats').optional().isInt({ min: 0 }),
    validateRequest,
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const offer = await rideOfferService.updateOffer(authReq.user!.userId, req.params.id, req.body);
    res.json({ success: true, data: offer });
  })
);

/**
 * DELETE /api/rides/offers/:id
 * Delete a ride offer
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    await rideOfferService.deleteOffer(authReq.user!.userId, req.params.id);
    res.json({ success: true, message: 'Offer deleted' });
  })
);

export default router;
