import { dataService } from './dataService';
import { v4 as uuidv4 } from 'uuid';

export interface MatchedTrip {
  id: string;
  trip_id: string;
  user_id: string;
  destination: string;
  departure_time: Date;
  match_score: number;
}

export interface Match {
  id: string;
  match_id: string;
  trip_id: string;
  user_id: string;
  matched_at: Date;
}

export interface MatchResult {
  matches: MatchedTrip[];
}

export const matchingService = {
  /**
   * Find matching trips based on destination and departure time
   * Matches trips with:
   * - Same destination (case-insensitive)
   * - Departure time within 2 hours
   * - Different user (not matching own trips)
   */
  async findMatches(tripId: string, userId: string): Promise<MatchResult> {
    const sourceTrip = await dataService.queryOne<{ destination: string; departure_time: Date }>(
      `SELECT destination, departure_time FROM trips WHERE id = $1`,
      [tripId]
    );

    if (!sourceTrip) {
      return { matches: [] };
    }

    const matches = await dataService.query<MatchedTrip>(
      `SELECT
        t.id,
        t.trip_id,
        t.user_id,
        t.destination,
        t.departure_time,
        CASE
          WHEN LOWER(t.destination) = LOWER($1) THEN 100
          ELSE 50
        END as match_score
       FROM trips t
       WHERE t.user_id != $2
         AND LOWER(t.destination) = LOWER($1)
         AND t.departure_time BETWEEN ($3::timestamp - interval '2 hours') AND ($3::timestamp + interval '2 hours')
       ORDER BY ABS(EXTRACT(EPOCH FROM (t.departure_time - $3::timestamp))) ASC
       LIMIT 10`,
      [sourceTrip.destination, userId, sourceTrip.departure_time]
    );

    return {
      matches: matches.map((m) => ({
        id: m.id,
        trip_id: m.trip_id,
        user_id: m.user_id,
        destination: m.destination,
        departure_time: m.departure_time,
        match_score: m.match_score,
      })),
    };
  },

  /**
   * Create a match record between two trips
   */
  async createMatch(tripId: string, matchedTripId: string, userId: string): Promise<Match | null> {
    const matchId = uuidv4();
    const now = new Date();

    const result = await dataService.query<Match>(
      `INSERT INTO matched_trips (id, match_id, trip_id, user_id, matched_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $5, $5)
       RETURNING id, match_id, trip_id, user_id, matched_at`,
      [matchId, matchId, tripId, userId, now]
    );

    return result[0] || null;
  },

  /**
   * Get matches for a user
   */
  async getUserMatches(userId: string): Promise<Match[]> {
    const matches = await dataService.query<Match>(
      `SELECT id, match_id, trip_id, user_id, matched_at
       FROM matched_trips
       WHERE user_id = $1
       ORDER BY matched_at DESC`,
      [userId]
    );

    return matches;
  },
};

export default matchingService;
