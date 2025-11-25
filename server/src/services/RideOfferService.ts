import { query } from '../config/database';
import {
  RideOffer,
  CreateRideOfferDTO,
  UpdateRideOfferDTO,
  RideOfferResponseDTO,
  RideOfferSearchFilters,
  toRideOfferResponse,
} from '../models/RideOffer';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Ride Offer Service - handles CRUD operations for ride offers
 */
export class RideOfferService {
  /**
   * Create a new ride offer
   */
  async createOffer(userId: string, data: CreateRideOfferDTO): Promise<RideOfferResponseDTO> {
    const result = await query<RideOffer>(
      `INSERT INTO ride_offers (user_id, pickup_location, dropoff_location, available_seats)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, data.pickup_location, data.dropoff_location, data.available_seats.toString()]
    );

    logger.info('Ride offer created', { userId, offerId: result.rows[0].id });

    return toRideOfferResponse(result.rows[0]);
  }

  /**
   * Get ride offer by ID
   */
  async getOfferById(offerId: string): Promise<RideOfferResponseDTO> {
    const result = await query<RideOffer & { driver_name: string }>(
      `SELECT ro.*, u.name as driver_name
       FROM ride_offers ro
       LEFT JOIN users u ON ro.user_id = u.id
       WHERE ro.id = $1`,
      [offerId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Ride offer not found');
    }

    return toRideOfferResponse(result.rows[0], result.rows[0].driver_name);
  }

  /**
   * Get all offers by a user
   */
  async getOffersByUser(userId: string, limit: number = 20): Promise<RideOfferResponseDTO[]> {
    const result = await query<RideOffer>(
      `SELECT * FROM ride_offers
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((offer) => toRideOfferResponse(offer));
  }

  /**
   * Search available offers
   */
  async searchOffers(filters: RideOfferSearchFilters, limit: number = 20): Promise<RideOfferResponseDTO[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters.pickup_location) {
      conditions.push(`LOWER(pickup_location) LIKE LOWER($${paramIndex++})`);
      values.push(`%${filters.pickup_location}%`);
    }

    if (filters.dropoff_location) {
      conditions.push(`LOWER(dropoff_location) LIKE LOWER($${paramIndex++})`);
      values.push(`%${filters.dropoff_location}%`);
    }

    if (filters.min_seats) {
      conditions.push(`CAST(available_seats AS INTEGER) >= $${paramIndex++}`);
      values.push(filters.min_seats);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit);

    const result = await query<RideOffer & { driver_name: string }>(
      `SELECT ro.*, u.name as driver_name
       FROM ride_offers ro
       LEFT JOIN users u ON ro.user_id = u.id
       ${whereClause}
       ORDER BY ro.created_at DESC
       LIMIT $${paramIndex}`,
      values
    );

    return result.rows.map((offer) => toRideOfferResponse(offer, offer.driver_name));
  }

  /**
   * Update a ride offer
   */
  async updateOffer(userId: string, offerId: string, data: UpdateRideOfferDTO): Promise<RideOfferResponseDTO> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.pickup_location !== undefined) {
      updates.push(`pickup_location = $${paramIndex++}`);
      values.push(data.pickup_location);
    }

    if (data.dropoff_location !== undefined) {
      updates.push(`dropoff_location = $${paramIndex++}`);
      values.push(data.dropoff_location);
    }

    if (data.available_seats !== undefined) {
      updates.push(`available_seats = $${paramIndex++}`);
      values.push(data.available_seats.toString());
    }

    if (updates.length === 0) {
      throw new BadRequestError('No update data provided');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId, offerId);

    const result = await query<RideOffer>(
      `UPDATE ride_offers
       SET ${updates.join(', ')}
       WHERE user_id = $${paramIndex++} AND id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Ride offer not found or not owned by user');
    }

    logger.info('Ride offer updated', { userId, offerId });

    return toRideOfferResponse(result.rows[0]);
  }

  /**
   * Delete a ride offer
   */
  async deleteOffer(userId: string, offerId: string): Promise<void> {
    const result = await query(
      'DELETE FROM ride_offers WHERE user_id = $1 AND id = $2',
      [userId, offerId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Ride offer not found or not owned by user');
    }

    logger.info('Ride offer deleted', { userId, offerId });
  }

  /**
   * Get all available offers (not owned by user)
   */
  async getAvailableOffers(userId: string, limit: number = 20): Promise<RideOfferResponseDTO[]> {
    const result = await query<RideOffer & { driver_name: string }>(
      `SELECT ro.*, u.name as driver_name
       FROM ride_offers ro
       LEFT JOIN users u ON ro.user_id = u.id
       WHERE ro.user_id != $1
       AND CAST(ro.available_seats AS INTEGER) > 0
       ORDER BY ro.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((offer) => toRideOfferResponse(offer, offer.driver_name));
  }
}

export const rideOfferService = new RideOfferService();
export default rideOfferService;
