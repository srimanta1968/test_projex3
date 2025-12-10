import { query } from '../config/database';
import { Driver, CreateDriverDTO, UpdateDriverDTO, DriverResponseDTO, toDriverResponse } from '../models/Driver';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';

export class DriverService {
  /**
   * Register a new driver
   * @param data Driver registration data
   * @returns Created driver
   */
  async createDriver(data: CreateDriverDTO): Promise<DriverResponseDTO> {
    // Check if license number already exists
    const existingDriver = await query<Driver>(
      'SELECT id FROM drivers WHERE license_number = $1',
      [data.license_number]
    );

    if (existingDriver.rows.length > 0) {
      throw new ConflictError('License number already registered', 'LICENSE_EXISTS');
    }

    const result = await query<Driver>(
      `INSERT INTO drivers (name, vehicle_type, license_number, rating)
       VALUES ($1, $2, $3, '0')
       RETURNING *`,
      [data.name, data.vehicle_type, data.license_number]
    );

    return toDriverResponse(result.rows[0]);
  }

  /**
   * Get driver by ID
   * @param driverId Driver ID
   * @returns Driver response
   */
  async getDriverById(driverId: string): Promise<DriverResponseDTO> {
    const result = await query<Driver>(
      'SELECT * FROM drivers WHERE id = $1',
      [driverId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Driver not found', 'DRIVER_NOT_FOUND');
    }

    return toDriverResponse(result.rows[0]);
  }

  /**
   * Get all drivers
   * @param limit Number of drivers to return
   * @param offset Offset for pagination
   * @returns Array of drivers
   */
  async getAllDrivers(limit: number = 50, offset: number = 0): Promise<DriverResponseDTO[]> {
    const result = await query<Driver>(
      'SELECT * FROM drivers ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return result.rows.map(toDriverResponse);
  }

  /**
   * Get drivers by vehicle type
   * @param vehicleType Vehicle type to filter by
   * @returns Array of drivers
   */
  async getDriversByVehicleType(vehicleType: string): Promise<DriverResponseDTO[]> {
    const result = await query<Driver>(
      'SELECT * FROM drivers WHERE vehicle_type = $1 ORDER BY rating DESC',
      [vehicleType]
    );

    return result.rows.map(toDriverResponse);
  }

  /**
   * Get top rated drivers
   * @param limit Number of drivers to return
   * @returns Array of top-rated drivers
   */
  async getTopRatedDrivers(limit: number = 10): Promise<DriverResponseDTO[]> {
    const result = await query<Driver>(
      `SELECT * FROM drivers
       WHERE rating IS NOT NULL
       ORDER BY CAST(rating AS DECIMAL) DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map(toDriverResponse);
  }

  /**
   * Update driver information
   * @param driverId Driver ID
   * @param data Update data
   * @returns Updated driver
   */
  async updateDriver(driverId: string, data: UpdateDriverDTO): Promise<DriverResponseDTO> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.vehicle_type !== undefined) {
      updates.push(`vehicle_type = $${paramIndex++}`);
      values.push(data.vehicle_type);
    }

    if (data.license_number !== undefined) {
      // Check if new license number already exists
      const existingDriver = await query<Driver>(
        'SELECT id FROM drivers WHERE license_number = $1 AND id != $2',
        [data.license_number, driverId]
      );

      if (existingDriver.rows.length > 0) {
        throw new ConflictError('License number already registered', 'LICENSE_EXISTS');
      }

      updates.push(`license_number = $${paramIndex++}`);
      values.push(data.license_number);
    }

    if (data.rating !== undefined) {
      updates.push(`rating = $${paramIndex++}`);
      values.push(data.rating);
    }

    if (updates.length === 0) {
      throw new BadRequestError('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(driverId);

    const result = await query<Driver>(
      `UPDATE drivers SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Driver not found', 'DRIVER_NOT_FOUND');
    }

    return toDriverResponse(result.rows[0]);
  }

  /**
   * Update driver rating
   * @param driverId Driver ID
   * @param newRating New rating value
   * @returns Updated driver
   */
  async updateDriverRating(driverId: string, newRating: string): Promise<DriverResponseDTO> {
    const result = await query<Driver>(
      `UPDATE drivers SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [newRating, driverId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Driver not found', 'DRIVER_NOT_FOUND');
    }

    return toDriverResponse(result.rows[0]);
  }

  /**
   * Delete a driver
   * @param driverId Driver ID
   */
  async deleteDriver(driverId: string): Promise<void> {
    const result = await query(
      'DELETE FROM drivers WHERE id = $1',
      [driverId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Driver not found', 'DRIVER_NOT_FOUND');
    }
  }

  /**
   * Search drivers by name
   * @param searchTerm Search term
   * @returns Array of matching drivers
   */
  async searchDrivers(searchTerm: string): Promise<DriverResponseDTO[]> {
    const result = await query<Driver>(
      `SELECT * FROM drivers WHERE name ILIKE $1 ORDER BY rating DESC`,
      [`%${searchTerm}%`]
    );

    return result.rows.map(toDriverResponse);
  }
}

export const driverService = new DriverService();
export default driverService;
