import { query } from '../config/database';
import {
  RideRequest,
  CreateRideRequestDTO,
  RideRequestResponseDTO,
  RideRequestStatus,
  toRideRequestResponse,
} from '../models/RideRequest';
import { NotFoundError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Ride Request Service - handles CRUD operations for ride requests
 */
export class RideRequestService {
  /**
   * Create a ride request
   */
  async createRequest(userId: string, data: CreateRideRequestDTO): Promise<RideRequestResponseDTO> {
    // Check if user already has a pending request for this offer
    const existing = await query<RideRequest>(
      `SELECT * FROM ride_requests
       WHERE user_id = $1 AND offer_id = $2 AND status = 'pending'`,
      [userId, data.offer_id]
    );

    if (existing.rows.length > 0) {
      throw new ConflictError('You already have a pending request for this ride');
    }

    // Check if offer exists
    const offerCheck = await query(
      'SELECT id FROM ride_offers WHERE id = $1',
      [data.offer_id]
    );

    if (offerCheck.rows.length === 0) {
      throw new NotFoundError('Ride offer not found');
    }

    const result = await query<RideRequest>(
      `INSERT INTO ride_requests (user_id, offer_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [userId, data.offer_id]
    );

    logger.info('Ride request created', { userId, offerId: data.offer_id });

    return toRideRequestResponse(result.rows[0]);
  }

  /**
   * Get request by ID
   */
  async getRequestById(requestId: string): Promise<RideRequestResponseDTO> {
    const result = await query<RideRequest & { requester_name: string; pickup_location: string; dropoff_location: string }>(
      `SELECT rr.*, u.name as requester_name, ro.pickup_location, ro.dropoff_location
       FROM ride_requests rr
       LEFT JOIN users u ON rr.user_id = u.id
       LEFT JOIN ride_offers ro ON rr.offer_id = ro.id
       WHERE rr.id = $1`,
      [requestId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Ride request not found');
    }

    const row = result.rows[0];
    return toRideRequestResponse(
      row,
      row.requester_name,
      { pickup_location: row.pickup_location, dropoff_location: row.dropoff_location }
    );
  }

  /**
   * Get all requests by a user (as requester)
   */
  async getRequestsByUser(userId: string, limit: number = 20): Promise<RideRequestResponseDTO[]> {
    const result = await query<RideRequest & { pickup_location: string; dropoff_location: string }>(
      `SELECT rr.*, ro.pickup_location, ro.dropoff_location
       FROM ride_requests rr
       LEFT JOIN ride_offers ro ON rr.offer_id = ro.id
       WHERE rr.user_id = $1
       ORDER BY rr.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((row) =>
      toRideRequestResponse(row, undefined, {
        pickup_location: row.pickup_location,
        dropoff_location: row.dropoff_location,
      })
    );
  }

  /**
   * Get requests for a user's offers (as driver)
   */
  async getRequestsForMyOffers(userId: string, limit: number = 20): Promise<RideRequestResponseDTO[]> {
    const result = await query<RideRequest & { requester_name: string; pickup_location: string; dropoff_location: string }>(
      `SELECT rr.*, u.name as requester_name, ro.pickup_location, ro.dropoff_location
       FROM ride_requests rr
       JOIN ride_offers ro ON rr.offer_id = ro.id
       LEFT JOIN users u ON rr.user_id = u.id
       WHERE ro.user_id = $1
       ORDER BY rr.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((row) =>
      toRideRequestResponse(row, row.requester_name, {
        pickup_location: row.pickup_location,
        dropoff_location: row.dropoff_location,
      })
    );
  }

  /**
   * Update request status (accept/reject)
   */
  async updateRequestStatus(
    userId: string,
    requestId: string,
    status: RideRequestStatus
  ): Promise<RideRequestResponseDTO> {
    // Verify the user owns the offer for this request
    const check = await query(
      `SELECT rr.id FROM ride_requests rr
       JOIN ride_offers ro ON rr.offer_id = ro.id
       WHERE rr.id = $1 AND ro.user_id = $2`,
      [requestId, userId]
    );

    if (check.rows.length === 0) {
      throw new NotFoundError('Request not found or you are not the driver');
    }

    const result = await query<RideRequest>(
      `UPDATE ride_requests
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, requestId]
    );

    logger.info('Ride request status updated', { requestId, status });

    return toRideRequestResponse(result.rows[0]);
  }

  /**
   * Cancel a request (by requester)
   */
  async cancelRequest(userId: string, requestId: string): Promise<void> {
    const result = await query(
      `UPDATE ride_requests
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND status = 'pending'`,
      [requestId, userId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Request not found or cannot be cancelled');
    }

    logger.info('Ride request cancelled', { userId, requestId });
  }

  /**
   * Get pending requests count for a user's offers
   */
  async getPendingRequestsCount(userId: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM ride_requests rr
       JOIN ride_offers ro ON rr.offer_id = ro.id
       WHERE ro.user_id = $1 AND rr.status = 'pending'`,
      [userId]
    );

    return parseInt(result.rows[0].count, 10);
  }
}

export const rideRequestService = new RideRequestService();
export default rideRequestService;
