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

export const tripHistoryService = {
  /**
   * Get trip history for a user
   */
  async getTripHistory(userId: string): Promise<TripHistoryResponse> {
    const trips = await dataService.query<TripHistoryItem>(
      `SELECT
        th.id,
        th.history_id,
        th.trip_id,
        t.destination,
        t.departure_time,
        th.completed_at
       FROM trip_history th
       LEFT JOIN trips t ON th.trip_id = t.id
       WHERE th.user_id = $1
       ORDER BY th.completed_at DESC`,
      [userId]
    );

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
