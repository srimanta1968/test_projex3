import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { tripService, CreateTripInput } from '../services/tripService';

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

      if (!destination || !destination.trim()) {
        res.status(400).json({
          success: false,
          error: 'Destination is required',
        });
        return;
      }

      if (!departure_time) {
        res.status(400).json({
          success: false,
          error: 'Departure time is required',
        });
        return;
      }

      const departureDate = new Date(departure_time);
      if (isNaN(departureDate.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Invalid departure time format',
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
};

export default tripController;
