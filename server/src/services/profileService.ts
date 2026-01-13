import { dataService } from './dataService';

export interface UserProfile {
  id: string;
  user_id: string;
  preferences: Record<string, unknown>;
  trip_history: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface ProfileResponse {
  profile: {
    id: string;
    user_id: string;
    preferences: Record<string, unknown>;
    trip_history: Record<string, unknown>;
  };
}

export const profileService = {
  /**
   * Get user profile by user ID
   * Creates a profile if one doesn't exist
   */
  async getProfile(userId: string): Promise<ProfileResponse> {
    let profile = await dataService.queryOne<UserProfile>(
      'SELECT id, user_id, preferences, trip_history FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (!profile) {
      // Create a new profile for the user
      profile = await dataService.queryOne<UserProfile>(
        `INSERT INTO user_profiles (user_id, preferences, trip_history)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, preferences, trip_history`,
        [userId, '{}', '{}']
      );
    }

    if (!profile) {
      throw new Error('Failed to create user profile');
    }

    return {
      profile: {
        id: profile.id,
        user_id: profile.user_id,
        preferences: profile.preferences || {},
        trip_history: profile.trip_history || {},
      },
    };
  },

  /**
   * Update user profile preferences
   */
  async updateProfile(
    userId: string,
    preferences: Record<string, unknown>
  ): Promise<ProfileResponse> {
    const profile = await dataService.queryOne<UserProfile>(
      `UPDATE user_profiles
       SET preferences = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING id, user_id, preferences, trip_history`,
      [userId, JSON.stringify(preferences)]
    );

    if (!profile) {
      throw new Error('Profile not found');
    }

    return {
      profile: {
        id: profile.id,
        user_id: profile.user_id,
        preferences: profile.preferences || {},
        trip_history: profile.trip_history || {},
      },
    };
  },
};

export default profileService;
