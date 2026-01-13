import { dataService } from './dataService';
import { v4 as uuidv4 } from 'uuid';

export interface Trip {
  id: string;
  trip_id: string;
  user_id: string;
  destination: string;
  departure_time: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTripInput {
  destination: string;
  departure_time: string;
}

export interface UpdateTripInput {
  destination?: string;
  departure_time?: string;
}

export interface TripResponse {
  trip: {
    id: string;
    user_id: string;
    destination: string;
    departure_time: string;
  };
}

export const tripService = {
  /**
   * Create a new trip
   */
  async createTrip(userId: string, input: CreateTripInput): Promise<TripResponse> {
    const tripId = uuidv4();
    const now = new Date();

    const result = await dataService.query<Trip>(
      `INSERT INTO trips (id, trip_id, user_id, destination, departure_time, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, destination, departure_time`,
      [tripId, tripId, userId, input.destination, input.departure_time, now, now]
    );

    const trip = result[0];

    return {
      trip: {
        id: trip.id,
        user_id: trip.user_id,
        destination: trip.destination,
        departure_time: trip.departure_time.toISOString(),
      },
    };
  },

  /**
   * Get trips for a user
   */
  async getUserTrips(userId: string): Promise<Trip[]> {
    const trips = await dataService.query<Trip>(
      `SELECT id, trip_id, user_id, destination, departure_time, created_at, updated_at
       FROM trips
       WHERE user_id = $1
       ORDER BY departure_time DESC`,
      [userId]
    );

    return trips;
  },

  /**
   * Get a single trip by ID
   */
  async getTripById(tripId: string, userId: string): Promise<Trip | null> {
    const trip = await dataService.queryOne<Trip>(
      `SELECT id, trip_id, user_id, destination, departure_time, created_at, updated_at
       FROM trips
       WHERE id = $1 AND user_id = $2`,
      [tripId, userId]
    );

    return trip;
  },

  /**
   * Update a trip (reschedule)
   */
  async updateTrip(tripId: string, userId: string, input: UpdateTripInput): Promise<TripResponse | null> {
    const existingTrip = await this.getTripById(tripId, userId);
    if (!existingTrip) {
      return null;
    }

    const now = new Date();
    const destination = input.destination || existingTrip.destination;
    const departureTime = input.departure_time || existingTrip.departure_time;

    const result = await dataService.query<Trip>(
      `UPDATE trips
       SET destination = $1, departure_time = $2, updated_at = $3
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, destination, departure_time`,
      [destination, departureTime, now, tripId, userId]
    );

    const trip = result[0];
    if (!trip) {
      return null;
    }

    return {
      trip: {
        id: trip.id,
        user_id: trip.user_id,
        destination: trip.destination,
        departure_time: trip.departure_time.toISOString(),
      },
    };
  },
};

export default tripService;
