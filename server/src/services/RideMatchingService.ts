import { query, transaction } from '../config/database';
import {
  MatchedRide,
  CreateMatchedRideDTO,
  MatchedRideResponseDTO,
  MatchedRideStatus,
  toMatchedRideResponse,
} from '../models/MatchedRide';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Interface for matching suggestion
 */
export interface MatchingSuggestion {
  offer_id: string;
  driver_id: string;
  driver_name: string;
  pickup_location: string;
  dropoff_location: string;
  available_seats: number;
  compatibility_score: number;
  matching_preferences: string[];
  conflicting_preferences: string[];
}

/**
 * Ride Matching Service - handles ride matching between drivers and riders
 */
export class RideMatchingService {
  /**
   * Create a match when request is accepted
   */
  async createMatch(data: CreateMatchedRideDTO): Promise<MatchedRideResponseDTO> {
    const result = await query<MatchedRide>(
      `INSERT INTO matched_rides (ride_offer_id, user_id, status)
       VALUES ($1, $2, 'active')
       RETURNING *`,
      [data.ride_offer_id, data.user_id]
    );

    logger.info('Ride match created', { offerId: data.ride_offer_id, riderId: data.user_id });

    return toMatchedRideResponse(result.rows[0]);
  }

  /**
   * Accept a ride request and create a match
   */
  async acceptRequestAndMatch(driverId: string, requestId: string): Promise<MatchedRideResponseDTO> {
    return transaction(async (client) => {
      const requestResult = await client.query(
        `SELECT rr.*, ro.user_id as driver_id
         FROM ride_requests rr
         JOIN ride_offers ro ON rr.offer_id = ro.id
         WHERE rr.id = $1`,
        [requestId]
      );

      if (requestResult.rows.length === 0) {
        throw new NotFoundError('Request not found');
      }

      const request = requestResult.rows[0];

      if (request.driver_id !== driverId) {
        throw new BadRequestError('You are not the driver for this offer');
      }

      if (request.status !== 'pending') {
        throw new BadRequestError('Request is not pending');
      }

      await client.query(
        `UPDATE ride_requests SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [requestId]
      );

      const matchResult = await client.query(
        `INSERT INTO matched_rides (ride_offer_id, user_id, status)
         VALUES ($1, $2, 'active')
         RETURNING *`,
        [request.offer_id, request.user_id]
      );

      await client.query(
        `UPDATE ride_offers
         SET available_seats = (CAST(available_seats AS INTEGER) - 1)::TEXT,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [request.offer_id]
      );

      logger.info('Ride request accepted and matched', { requestId, matchId: matchResult.rows[0].id });

      return toMatchedRideResponse(matchResult.rows[0]);
    });
  }

  /**
   * Get match by ID
   */
  async getMatchById(matchId: string): Promise<MatchedRideResponseDTO> {
    const result = await query<MatchedRide & { rider_name: string; pickup_location: string; dropoff_location: string; driver_name: string }>(
      `SELECT mr.*, u.name as rider_name, ro.pickup_location, ro.dropoff_location, driver.name as driver_name
       FROM matched_rides mr
       LEFT JOIN users u ON mr.user_id = u.id
       LEFT JOIN ride_offers ro ON mr.ride_offer_id = ro.id
       LEFT JOIN users driver ON ro.user_id = driver.id
       WHERE mr.id = $1`,
      [matchId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Match not found');
    }

    const row = result.rows[0];
    return toMatchedRideResponse(row, row.rider_name, {
      pickup_location: row.pickup_location,
      dropoff_location: row.dropoff_location,
      driver_name: row.driver_name,
    });
  }

  /**
   * Get all matches for a user (as rider)
   */
  async getMatchesAsRider(userId: string, limit: number = 20): Promise<MatchedRideResponseDTO[]> {
    const result = await query<MatchedRide & { pickup_location: string; dropoff_location: string; driver_name: string }>(
      `SELECT mr.*, ro.pickup_location, ro.dropoff_location, driver.name as driver_name
       FROM matched_rides mr
       LEFT JOIN ride_offers ro ON mr.ride_offer_id = ro.id
       LEFT JOIN users driver ON ro.user_id = driver.id
       WHERE mr.user_id = $1
       ORDER BY mr.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((row) =>
      toMatchedRideResponse(row, undefined, {
        pickup_location: row.pickup_location,
        dropoff_location: row.dropoff_location,
        driver_name: row.driver_name,
      })
    );
  }

  /**
   * Get all matches for a user's offers (as driver)
   */
  async getMatchesAsDriver(userId: string, limit: number = 20): Promise<MatchedRideResponseDTO[]> {
    const result = await query<MatchedRide & { rider_name: string; pickup_location: string; dropoff_location: string }>(
      `SELECT mr.*, u.name as rider_name, ro.pickup_location, ro.dropoff_location
       FROM matched_rides mr
       JOIN ride_offers ro ON mr.ride_offer_id = ro.id
       LEFT JOIN users u ON mr.user_id = u.id
       WHERE ro.user_id = $1
       ORDER BY mr.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((row) =>
      toMatchedRideResponse(row, row.rider_name, {
        pickup_location: row.pickup_location,
        dropoff_location: row.dropoff_location,
        driver_name: '',
      })
    );
  }

  /**
   * Update match status
   */
  async updateMatchStatus(matchId: string, status: MatchedRideStatus): Promise<MatchedRideResponseDTO> {
    const result = await query<MatchedRide>(
      `UPDATE matched_rides
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, matchId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Match not found');
    }

    logger.info('Match status updated', { matchId, status });

    return toMatchedRideResponse(result.rows[0]);
  }

  /**
   * Complete a ride
   */
  async completeRide(matchId: string, userId: string): Promise<MatchedRideResponseDTO> {
    const check = await query(
      `SELECT mr.id FROM matched_rides mr
       JOIN ride_offers ro ON mr.ride_offer_id = ro.id
       WHERE mr.id = $1 AND (mr.user_id = $2 OR ro.user_id = $2)`,
      [matchId, userId]
    );

    if (check.rows.length === 0) {
      throw new NotFoundError('Match not found or you are not part of this ride');
    }

    return this.updateMatchStatus(matchId, 'completed');
  }

  /**
   * Cancel a match
   */
  async cancelMatch(matchId: string, userId: string): Promise<void> {
    return transaction(async (client) => {
      const matchResult = await client.query(
        `SELECT mr.*, ro.user_id as driver_id
         FROM matched_rides mr
         JOIN ride_offers ro ON mr.ride_offer_id = ro.id
         WHERE mr.id = $1 AND (mr.user_id = $2 OR ro.user_id = $2)`,
        [matchId, userId]
      );

      if (matchResult.rows.length === 0) {
        throw new NotFoundError('Match not found or you are not part of this ride');
      }

      const match = matchResult.rows[0];

      if (match.status !== 'active') {
        throw new BadRequestError('Only active matches can be cancelled');
      }

      await client.query(
        `UPDATE matched_rides SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [matchId]
      );

      await client.query(
        `UPDATE ride_offers
         SET available_seats = (CAST(available_seats AS INTEGER) + 1)::TEXT,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [match.ride_offer_id]
      );

      logger.info('Match cancelled', { matchId, userId });
    });
  }

  /**
   * Find matching ride offers for a user based on location and preferences
   * This is the intelligent matching algorithm
   */
  async findMatchingSuggestions(
    userId: string,
    pickupLocation: string,
    dropoffLocation: string,
    limit: number = 10
  ): Promise<MatchingSuggestion[]> {
    // Get user preferences
    const userPrefsResult = await query<{ preference_type: string; preference_value: string }>(
      'SELECT preference_type, preference_value FROM user_preferences WHERE user_id = $1',
      [userId]
    );
    const userPrefs = new Map<string, string>();
    userPrefsResult.rows.forEach((row) => {
      userPrefs.set(row.preference_type, row.preference_value);
    });

    // Find available ride offers (not user's own, with available seats)
    const offersResult = await query<{
      id: string;
      user_id: string;
      driver_name: string;
      pickup_location: string;
      dropoff_location: string;
      available_seats: string;
      created_at: Date;
    }>(
      `SELECT ro.id, ro.user_id, u.name as driver_name,
              ro.pickup_location, ro.dropoff_location, ro.available_seats, ro.created_at
       FROM ride_offers ro
       LEFT JOIN users u ON ro.user_id = u.id
       WHERE ro.user_id != $1
       AND CAST(ro.available_seats AS INTEGER) > 0
       ORDER BY ro.created_at DESC
       LIMIT 50`,
      [userId]
    );

    if (offersResult.rows.length === 0) {
      return [];
    }

    // Score each offer
    const scoredOffers: MatchingSuggestion[] = [];

    for (const offer of offersResult.rows) {
      // Get driver preferences
      const driverPrefsResult = await query<{ preference_type: string; preference_value: string }>(
        'SELECT preference_type, preference_value FROM user_preferences WHERE user_id = $1',
        [offer.user_id]
      );
      const driverPrefs = new Map<string, string>();
      driverPrefsResult.rows.forEach((row) => {
        driverPrefs.set(row.preference_type, row.preference_value);
      });

      // Calculate compatibility score
      const { score, matching, conflicting } = this.calculateCompatibility(userPrefs, driverPrefs);

      // Calculate location score
      const locationScore = this.calculateLocationScore(
        pickupLocation,
        dropoffLocation,
        offer.pickup_location,
        offer.dropoff_location
      );

      // Combined score (70% preferences, 30% location)
      const totalScore = Math.round(score * 0.7 + locationScore * 0.3);

      scoredOffers.push({
        offer_id: offer.id,
        driver_id: offer.user_id,
        driver_name: offer.driver_name || 'Unknown Driver',
        pickup_location: offer.pickup_location,
        dropoff_location: offer.dropoff_location,
        available_seats: parseInt(offer.available_seats, 10),
        compatibility_score: totalScore,
        matching_preferences: matching,
        conflicting_preferences: conflicting,
      });
    }

    // Sort by compatibility score and return top matches
    scoredOffers.sort((a, b) => b.compatibility_score - a.compatibility_score);

    logger.info('Matching suggestions generated', {
      userId,
      pickupLocation,
      dropoffLocation,
      suggestionsCount: Math.min(scoredOffers.length, limit),
    });

    return scoredOffers.slice(0, limit);
  }

  /**
   * Calculate compatibility score between rider and driver preferences
   */
  private calculateCompatibility(
    riderPrefs: Map<string, string>,
    driverPrefs: Map<string, string>
  ): { score: number; matching: string[]; conflicting: string[] } {
    const matching: string[] = [];
    const conflicting: string[] = [];

    // Preference weight map (some preferences matter more)
    const weights: Record<string, number> = {
      smoking: 25,       // High impact
      pets: 20,          // High impact
      music: 15,         // Medium impact
      conversation: 15,  // Medium impact
      ac: 10,            // Lower impact
      luggage: 10,       // Lower impact
      language: 5,       // Lowest impact
    };

    let totalWeight = 0;
    let matchedWeight = 0;

    // Check each preference type
    for (const [type, weight] of Object.entries(weights)) {
      const riderPref = riderPrefs.get(type);
      const driverPref = driverPrefs.get(type);

      // If neither has a preference, skip
      if (!riderPref && !driverPref) continue;

      totalWeight += weight;

      // If one has preference and other doesn't, partial match
      if (!riderPref || !driverPref) {
        matchedWeight += weight * 0.5;
        continue;
      }

      // Check for compatibility
      if (this.arePreferencesCompatible(type, riderPref, driverPref)) {
        matchedWeight += weight;
        matching.push(type);
      } else {
        conflicting.push(type);
      }
    }

    // Calculate score (0-100)
    const score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 100;

    return { score, matching, conflicting };
  }

  /**
   * Check if two preference values are compatible
   */
  private arePreferencesCompatible(type: string, riderPref: string, driverPref: string): boolean {
    // Exact match
    if (riderPref === driverPref) return true;

    // Special compatibility rules
    switch (type) {
      case 'smoking':
        if (riderPref === 'not_allowed' || driverPref === 'not_allowed') {
          return riderPref === driverPref;
        }
        return true;

      case 'pets':
        if (riderPref === 'not_allowed' || driverPref === 'not_allowed') {
          return riderPref === driverPref;
        }
        if (riderPref === 'small_only') {
          return driverPref === 'small_only' || driverPref === 'allowed';
        }
        return true;

      case 'music':
        if (riderPref === 'quiet') {
          return driverPref === 'quiet' || driverPref === 'not_allowed';
        }
        return true;

      case 'conversation':
        if (riderPref === 'moderate' || driverPref === 'moderate') return true;
        return riderPref === driverPref;

      case 'ac':
        if (riderPref === 'no_preference' || driverPref === 'no_preference') return true;
        return riderPref === driverPref;

      case 'luggage': {
        const sizes: Record<string, number> = { small: 1, medium: 2, large: 3 };
        return (sizes[driverPref] || 2) >= (sizes[riderPref] || 2);
      }

      default:
        return true;
    }
  }

  /**
   * Calculate location match score based on location similarity
   */
  private calculateLocationScore(
    riderPickup: string,
    riderDropoff: string,
    driverPickup: string,
    driverDropoff: string
  ): number {
    const pickupSimilarity = this.getTextSimilarity(
      (riderPickup || '').toLowerCase(),
      (driverPickup || '').toLowerCase()
    );
    const dropoffSimilarity = this.getTextSimilarity(
      (riderDropoff || '').toLowerCase(),
      (driverDropoff || '').toLowerCase()
    );

    return Math.round((pickupSimilarity + dropoffSimilarity) / 2 * 100);
  }

  /**
   * Simple text similarity calculation (Jaccard similarity)
   */
  private getTextSimilarity(text1: string, text2: string): number {
    const set1 = new Set(text1.toLowerCase().split(/\s+/).filter(Boolean));
    const set2 = new Set(text2.toLowerCase().split(/\s+/).filter(Boolean));

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * Auto-match: Find the best match for a ride request
   */
  async autoMatch(requestId: string): Promise<MatchingSuggestion | null> {
    const requestResult = await query<{
      user_id: string;
      pickup_location: string;
      dropoff_location: string;
    }>(
      `SELECT rr.user_id, ro.pickup_location, ro.dropoff_location
       FROM ride_requests rr
       JOIN ride_offers ro ON rr.offer_id = ro.id
       WHERE rr.id = $1`,
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return null;
    }

    const request = requestResult.rows[0];
    const suggestions = await this.findMatchingSuggestions(
      request.user_id,
      request.pickup_location || '',
      request.dropoff_location || '',
      1
    );

    return suggestions[0] || null;
  }

  /**
   * Get match statistics for a user
   */
  async getMatchStatistics(userId: string): Promise<{
    totalMatches: number;
    completedRides: number;
    cancelledRides: number;
    averageRating: number | null;
  }> {
    const result = await query<{
      total_matches: string;
      completed_rides: string;
      cancelled_rides: string;
    }>(
      `SELECT
         COUNT(*) as total_matches,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_rides,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_rides
       FROM matched_rides mr
       LEFT JOIN ride_offers ro ON mr.ride_offer_id = ro.id
       WHERE mr.user_id = $1 OR ro.user_id = $1`,
      [userId]
    );

    const stats = result.rows[0];
    return {
      totalMatches: parseInt(stats.total_matches, 10) || 0,
      completedRides: parseInt(stats.completed_rides, 10) || 0,
      cancelledRides: parseInt(stats.cancelled_rides, 10) || 0,
      averageRating: null,
    };
  }
}

export const rideMatchingService = new RideMatchingService();
export default rideMatchingService;
