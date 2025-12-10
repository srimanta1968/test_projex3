import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query as queryValidator } from 'express-validator';
import { validate } from '../middleware/validation';
import { authMiddleware } from '../middleware/authMiddleware';
import { rideService } from '../services/RideService';
import { CreateRideDTO, UpdateRideDTO, RideStatus } from '../models/Ride';

const router = Router();

const validStatuses: RideStatus[] = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

/**
 * POST /api/rides
 * Create a new ride (protected)
 */
router.post(
  '/',
  authMiddleware,
  validate([
    body('pickup_location')
      .notEmpty()
      .withMessage('Pickup location is required')
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage('Pickup location must be between 3 and 500 characters'),
    body('dropoff_location')
      .notEmpty()
      .withMessage('Dropoff location is required')
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage('Dropoff location must be between 3 and 500 characters'),
  ]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const data: CreateRideDTO = {
        user_id: userId,
        pickup_location: req.body.pickup_location,
        dropoff_location: req.body.dropoff_location,
      };

      const ride = await rideService.createRide(data);

      res.status(201).json({
        success: true,
        message: 'Ride created successfully',
        data: ride,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/rides
 * Get all rides for current user (protected)
 */
router.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const rides = await rideService.getRidesByUserId(userId);

      res.status(200).json({
        success: true,
        data: rides,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/rides/all
 * Get all rides (admin function)
 */
router.get(
  '/all',
  authMiddleware,
  validate([
    queryValidator('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    queryValidator('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a positive integer'),
  ]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const rides = await rideService.getAllRides(limit, offset);

      res.status(200).json({
        success: true,
        data: rides,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/rides/status/:status
 * Get rides by status
 */
router.get(
  '/status/:status',
  authMiddleware,
  validate([
    param('status')
      .isIn(validStatuses)
      .withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  ]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = req.params.status as RideStatus;
      const rides = await rideService.getRidesByStatus(status);

      res.status(200).json({
        success: true,
        data: rides,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/rides/:id
 * Get ride by ID (protected)
 */
router.get(
  '/:id',
  authMiddleware,
  validate([
    param('id')
      .isUUID()
      .withMessage('Invalid ride ID'),
  ]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ride = await rideService.getRideById(req.params.id);

      res.status(200).json({
        success: true,
        data: ride,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/rides/:id
 * Update a ride (protected)
 */
router.put(
  '/:id',
  authMiddleware,
  validate([
    param('id')
      .isUUID()
      .withMessage('Invalid ride ID'),
    body('pickup_location')
      .optional()
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage('Pickup location must be between 3 and 500 characters'),
    body('dropoff_location')
      .optional()
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage('Dropoff location must be between 3 and 500 characters'),
    body('status')
      .optional()
      .isIn(validStatuses)
      .withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  ]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const data: UpdateRideDTO = {
        pickup_location: req.body.pickup_location,
        dropoff_location: req.body.dropoff_location,
        status: req.body.status,
      };

      const ride = await rideService.updateRide(req.params.id, data, userId);

      res.status(200).json({
        success: true,
        message: 'Ride updated successfully',
        data: ride,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/rides/:id/status
 * Update ride status
 */
router.patch(
  '/:id/status',
  authMiddleware,
  validate([
    param('id')
      .isUUID()
      .withMessage('Invalid ride ID'),
    body('status')
      .isIn(validStatuses)
      .withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  ]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ride = await rideService.updateRideStatus(req.params.id, req.body.status);

      res.status(200).json({
        success: true,
        message: 'Ride status updated successfully',
        data: ride,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/rides/:id/cancel
 * Cancel a ride (protected)
 */
router.post(
  '/:id/cancel',
  authMiddleware,
  validate([
    param('id')
      .isUUID()
      .withMessage('Invalid ride ID'),
  ]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const ride = await rideService.cancelRide(req.params.id, userId);

      res.status(200).json({
        success: true,
        message: 'Ride cancelled successfully',
        data: ride,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/rides/:id
 * Delete a ride (admin function)
 */
router.delete(
  '/:id',
  authMiddleware,
  validate([
    param('id')
      .isUUID()
      .withMessage('Invalid ride ID'),
  ]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await rideService.deleteRide(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Ride deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
