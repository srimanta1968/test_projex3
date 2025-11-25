import { query } from '../config/database';
import {
  UserPreference,
  CreateUserPreferenceDTO,
  UpdateUserPreferenceDTO,
  UserPreferenceResponseDTO,
  toUserPreferenceResponse,
} from '../models/UserPreference';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * User Preference Service - handles CRUD operations for user preferences
 */
export class UserPreferenceService {
  /**
   * Get all preferences for a user
   */
  async getPreferences(userId: string): Promise<UserPreferenceResponseDTO[]> {
    const result = await query<UserPreference>(
      'SELECT * FROM user_preferences WHERE user_id = $1 ORDER BY preference_type',
      [userId]
    );

    return result.rows.map(toUserPreferenceResponse);
  }

  /**
   * Get a specific preference by type
   */
  async getPreferenceByType(userId: string, preferenceType: string): Promise<UserPreferenceResponseDTO | null> {
    const result = await query<UserPreference>(
      'SELECT * FROM user_preferences WHERE user_id = $1 AND preference_type = $2',
      [userId, preferenceType]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return toUserPreferenceResponse(result.rows[0]);
  }

  /**
   * Create or update a preference (upsert)
   */
  async setPreference(userId: string, data: CreateUserPreferenceDTO): Promise<UserPreferenceResponseDTO> {
    // Check if preference exists
    const existing = await this.getPreferenceByType(userId, data.preference_type);

    if (existing) {
      // Update existing
      return this.updatePreference(userId, existing.id, {
        preference_value: data.preference_value,
      });
    }

    // Create new
    const result = await query<UserPreference>(
      `INSERT INTO user_preferences (user_id, preference_type, preference_value)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, data.preference_type, data.preference_value]
    );

    logger.info('User preference created', { userId, type: data.preference_type });

    return toUserPreferenceResponse(result.rows[0]);
  }

  /**
   * Update a preference
   */
  async updatePreference(
    userId: string,
    preferenceId: string,
    data: UpdateUserPreferenceDTO
  ): Promise<UserPreferenceResponseDTO> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.preference_type !== undefined) {
      updates.push(`preference_type = $${paramIndex++}`);
      values.push(data.preference_type);
    }

    if (data.preference_value !== undefined) {
      updates.push(`preference_value = $${paramIndex++}`);
      values.push(data.preference_value);
    }

    if (updates.length === 0) {
      throw new Error('No update data provided');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId, preferenceId);

    const result = await query<UserPreference>(
      `UPDATE user_preferences
       SET ${updates.join(', ')}
       WHERE user_id = $${paramIndex++} AND id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Preference not found');
    }

    logger.info('User preference updated', { userId, preferenceId });

    return toUserPreferenceResponse(result.rows[0]);
  }

  /**
   * Delete a preference
   */
  async deletePreference(userId: string, preferenceId: string): Promise<void> {
    const result = await query(
      'DELETE FROM user_preferences WHERE user_id = $1 AND id = $2',
      [userId, preferenceId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Preference not found');
    }

    logger.info('User preference deleted', { userId, preferenceId });
  }

  /**
   * Set multiple preferences at once
   */
  async setMultiplePreferences(
    userId: string,
    preferences: CreateUserPreferenceDTO[]
  ): Promise<UserPreferenceResponseDTO[]> {
    const results: UserPreferenceResponseDTO[] = [];

    for (const pref of preferences) {
      const result = await this.setPreference(userId, pref);
      results.push(result);
    }

    return results;
  }
}

export const userPreferenceService = new UserPreferenceService();
export default userPreferenceService;
