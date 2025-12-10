import { query } from '../config/database';
import { Ride, CreateRideDTO, UpdateRideDTO, RideResponseDTO, RideStatus, toRideResponse } from '../models/Ride';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

export class RideService {
  /**
   * Create a new ride
   * @param data Ride creation data
   * @returns Created ride
   */
  async createRide(data: CreateRideDTO): Promise<RideResponseDTO> {
    const result = await query<Ride>(
      `INSERT INTO rides (user_id, pickup_location, dropoff_location, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.user_id, data.pickup_location, data.dropoff_location, data.status || 'pending']
    );

    return toRideResponse(result.rows[0]);
  }

  /**
   * Get ride by ID
   * @param rideId Ride ID
   * @returns Ride response
   */
  async getRideById(rideId: string): Promise<RideResponseDTO> {
    const result = await query<Ride>(
      'SELECT * FROM rides WHERE id = $1',
      [rideId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Ride not found', 'RIDE_NOT_FOUND');
    }

    return toRideResponse(result.rows[0]);
  }

  /**
   * Get all rides for a user
   * @param userId User ID
   * @returns Array of rides
   */
  async getRidesByUserId(userId: string): Promise<RideResponseDTO[]> {
    const result = await query<Ride>(
      'SELECT * FROM rides WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return result.rows.map(toRideResponse);
  }

  /**
   * Get all rides (admin function)
   * @param limit Number of rides to return
   * @param offset Offset for pagination
   * @returns Array of rides
   */
  async getAllRides(limit: number = 50, offset: number = 0): Promise<RideResponseDTO[]> {
    const result = await query<Ride>(
      'SELECT * FROM rides ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return result.rows.map(toRideResponse);
  }

  /**
   * Get rides by status
   * @param status Ride status filter
   * @returns Array of rides with specified status
   */
  async getRidesByStatus(status: RideStatus): Promise<RideResponseDTO[]> {
    const result = await query<Ride>(
      'SELECT * FROM rides WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );

    return result.rows.map(toRideResponse);
  }

  /**
   * Update a ride
   * @param rideId Ride ID
   * @param data Update data
   * @param userId Optional user ID for ownership check
   * @returns Updated ride
   */
  async updateRide(rideId: string, data: UpdateRideDTO, userId?: string): Promise<RideResponseDTO> {
    // Check if ride exists
    const existingRide = await query<Ride>(
      'SELECT * FROM rides WHERE id = $1',
      [rideId]
    );

    if (existingRide.rows.length === 0) {
      throw new NotFoundError('Ride not found', 'RIDE_NOT_FOUND');
    }

    // If userId provided, check ownership
    if (userId && existingRide.rows[0].user_id !== userId) {
      throw new ForbiddenError('You do not have permission to update this ride', 'FORBIDDEN');
    }

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

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (updates.length === 0) {
      throw new BadRequestError('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(rideId);

    const result = await query<Ride>(
      `UPDATE rides SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return toRideResponse(result.rows[0]);
  }

  /**
   * Update ride status
   * @param rideId Ride ID
   * @param status New status
   * @returns Updated ride
   */
  async updateRideStatus(rideId: string, status: RideStatus): Promise<RideResponseDTO> {
    const result = await query<Ride>(
      `UPDATE rides SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, rideId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Ride not found', 'RIDE_NOT_FOUND');
    }

    return toRideResponse(result.rows[0]);
  }

  /**
   * Cancel a ride
   * @param rideId Ride ID
   * @param userId User ID for ownership check
   * @returns Cancelled ride
   */
  async cancelRide(rideId: string, userId: string): Promise<RideResponseDTO> {
    const existingRide = await query<Ride>(
      'SELECT * FROM rides WHERE id = $1',
      [rideId]
    );

    if (existingRide.rows.length === 0) {
      throw new NotFoundError('Ride not found', 'RIDE_NOT_FOUND');
    }

    if (existingRide.rows[0].user_id !== userId) {
      throw new ForbiddenError('You do not have permission to cancel this ride', 'FORBIDDEN');
    }

    const currentStatus = existingRide.rows[0].status;
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
      throw new BadRequestError(`Cannot cancel a ride that is ${currentStatus}`);
    }

    return this.updateRideStatus(rideId, 'cancelled');
  }

  /**
   * Delete a ride (admin function)
   * @param rideId Ride ID
   */
  async deleteRide(rideId: string): Promise<void> {
    const result = await query(
      'DELETE FROM rides WHERE id = $1',
      [rideId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Ride not found', 'RIDE_NOT_FOUND');
    }
  }
}

export const rideService = new RideService();
export default rideService;
