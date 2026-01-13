import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { tripService, CreateTripInput, UpdateTripInput } from '../services/tripService';
import { validateTripInput, validateTripUpdateInput } from '../utils/tripValidation';

export const tripController = {
  /**
   * Create a new trip
   */
  async createTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { destination, departure_time } = req.body as CreateTripInput;

      const validation = validateTripInput({ destination, departure_time });
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: validation.errors,
        });
        return;
      }

      const result = await tripService.createTrip(req.user.userId, {
        destination: destination.trim(),
        departure_time,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Create trip error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create trip',
      });
    }
  },

  /**
   * Get user's trips
   */
  async getUserTrips(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const trips = await tripService.getUserTrips(req.user.userId);

      res.status(200).json({
        success: true,
        data: {
          trips: trips.map((trip) => ({
            id: trip.id,
            destination: trip.destination,
            departure_time: trip.departure_time,
            created_at: trip.created_at,
          })),
        },
      });
    } catch (error) {
      console.error('Get user trips error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve trips',
      });
    }
  },

  /**
   * Update a trip (reschedule)
   */
  async updateTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      const { destination, departure_time } = req.body as UpdateTripInput;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Trip ID is required',
        });
        return;
      }

      const validation = validateTripUpdateInput({ destination, departure_time });
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: validation.errors,
        });
        return;
      }

      const result = await tripService.updateTrip(id, req.user.userId, {
        destination: destination?.trim(),
        departure_time,
      });

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Trip not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Update trip error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update trip',
      });
    }
  },

  /**
   * Delete/cancel a trip
   */
  async deleteTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Trip ID is required',
        });
        return;
      }

      const deleted = await tripService.deleteTrip(id, req.user.userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Trip not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Trip cancelled successfully',
      });
    } catch (error) {
      console.error('Delete trip error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel trip',
      });
    }
  },
};

export default tripController;
