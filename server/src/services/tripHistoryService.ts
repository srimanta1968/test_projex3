import { dataService } from './dataService';

export interface TripHistoryItem {
  id: string;
  history_id: string;
  trip_id: string;
  destination: string;
  departure_time: Date;
  completed_at: Date;
}

export interface TripHistoryResponse {
  trips: TripHistoryItem[];
}

export interface TripHistoryFilters {
  destination?: string;
  startDate?: string;
  endDate?: string;
}

export const tripHistoryService = {
  /**
   * Get trip history for a user with optional filters
   */
  async getTripHistory(userId: string, filters?: TripHistoryFilters): Promise<TripHistoryResponse> {
    let query = `
      SELECT
        th.id,
        th.history_id,
        th.trip_id,
        t.destination,
        t.departure_time,
        th.completed_at
       FROM trip_history th
       LEFT JOIN trips t ON th.trip_id = t.id
       WHERE th.user_id = $1
    `;

    const params: (string | Date)[] = [userId];
    let paramIndex = 2;

    if (filters?.destination) {
      query += ` AND LOWER(t.destination) LIKE LOWER($${paramIndex})`;
      params.push(`%${filters.destination}%`);
      paramIndex++;
    }

    if (filters?.startDate) {
      query += ` AND th.completed_at >= $${paramIndex}::timestamp`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      query += ` AND th.completed_at <= $${paramIndex}::timestamp`;
      params.push(filters.endDate);
      paramIndex++;
    }

    query += ` ORDER BY th.completed_at DESC`;

    const trips = await dataService.query<TripHistoryItem>(query, params);

    return {
      trips: trips.map((trip) => ({
        id: trip.id,
        history_id: trip.history_id,
        trip_id: trip.trip_id,
        destination: trip.destination || 'Unknown',
        departure_time: trip.departure_time,
        completed_at: trip.completed_at,
      })),
    };
  },
};

export default tripHistoryService;
