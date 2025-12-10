import { query } from '../config/database';
import { RideHistory, CreateRideHistoryDTO, UpdateRideHistoryDTO, RideHistoryResponseDTO, toRideHistoryResponse } from '../models/RideHistory';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class RideHistoryService {
  /**
   * Create a ride history record
   * @param data Ride history data
   * @returns Created ride history
   */
  async createRideHistory(data: CreateRideHistoryDTO): Promise<RideHistoryResponseDTO> {
    const result = await query<RideHistory>(
      `INSERT INTO ridehistory (ride_id, user_id, date, amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.ride_id, data.user_id, data.date, data.amount]
    );

    return toRideHistoryResponse(result.rows[0]);
  }

  /**
   * Get ride history by ID
   * @param historyId History record ID
   * @returns Ride history response
   */
  async getRideHistoryById(historyId: string): Promise<RideHistoryResponseDTO> {
    const result = await query<RideHistory>(
      'SELECT * FROM ridehistory WHERE id = $1',
      [historyId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Ride history not found', 'RIDE_HISTORY_NOT_FOUND');
    }

    return toRideHistoryResponse(result.rows[0]);
  }

  /**
   * Get ride history for a user
   * @param userId User ID
   * @returns Array of ride history records
   */
  async getRideHistoryByUserId(userId: string): Promise<RideHistoryResponseDTO[]> {
    const result = await query<RideHistory>(
      'SELECT * FROM ridehistory WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );

    return result.rows.map(toRideHistoryResponse);
  }

  /**
   * Get ride history for a specific ride
   * @param rideId Ride ID
   * @returns Ride history record
   */
  async getRideHistoryByRideId(rideId: string): Promise<RideHistoryResponseDTO | null> {
    const result = await query<RideHistory>(
      'SELECT * FROM ridehistory WHERE ride_id = $1',
      [rideId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return toRideHistoryResponse(result.rows[0]);
  }

  /**
   * Get ride history with filters
   * @param userId User ID
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @returns Filtered ride history records
   */
  async getRideHistoryFiltered(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<RideHistoryResponseDTO[]> {
    let queryStr = 'SELECT * FROM ridehistory WHERE user_id = $1';
    const params: unknown[] = [userId];
    let paramIndex = 2;

    if (startDate) {
      queryStr += ` AND date >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      queryStr += ` AND date <= $${paramIndex++}`;
      params.push(endDate);
    }

    queryStr += ' ORDER BY date DESC';

    const result = await query<RideHistory>(queryStr, params);
    return result.rows.map(toRideHistoryResponse);
  }

  /**
   * Update ride history
   * @param historyId History ID
   * @param data Update data
   * @returns Updated ride history
   */
  async updateRideHistory(historyId: string, data: UpdateRideHistoryDTO): Promise<RideHistoryResponseDTO> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      values.push(data.date);
    }

    if (data.amount !== undefined) {
      updates.push(`amount = $${paramIndex++}`);
      values.push(data.amount);
    }

    if (updates.length === 0) {
      throw new BadRequestError('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(historyId);

    const result = await query<RideHistory>(
      `UPDATE ridehistory SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Ride history not found', 'RIDE_HISTORY_NOT_FOUND');
    }

    return toRideHistoryResponse(result.rows[0]);
  }

  /**
   * Delete ride history
   * @param historyId History ID
   */
  async deleteRideHistory(historyId: string): Promise<void> {
    const result = await query(
      'DELETE FROM ridehistory WHERE id = $1',
      [historyId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Ride history not found', 'RIDE_HISTORY_NOT_FOUND');
    }
  }

  /**
   * Get total spending for a user
   * @param userId User ID
   * @returns Total amount spent
   */
  async getTotalSpending(userId: string): Promise<number> {
    const result = await query<{ total: string }>(
      'SELECT COALESCE(SUM(amount), 0) as total FROM ridehistory WHERE user_id = $1',
      [userId]
    );

    return parseFloat(result.rows[0].total) || 0;
  }
}

export const rideHistoryService = new RideHistoryService();
export default rideHistoryService;
