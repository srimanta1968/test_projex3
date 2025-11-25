/**
 * User Preference entity - matches database schema
 */
export interface UserPreference {
  id: string;
  user_id: string | null;
  preference_type: string | null;
  preference_value: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create preference DTO
 */
export interface CreateUserPreferenceDTO {
  preference_type: string;
  preference_value: string;
}

/**
 * Update preference DTO
 */
export interface UpdateUserPreferenceDTO {
  preference_type?: string;
  preference_value?: string;
}

/**
 * User preference response
 */
export interface UserPreferenceResponseDTO {
  id: string;
  user_id: string;
  preference_type: string;
  preference_value: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Common preference types
 */
export type PreferenceType =
  | 'smoking'
  | 'music'
  | 'conversation'
  | 'pets'
  | 'luggage'
  | 'ac'
  | 'payment_method'
  | 'notification'
  | 'language';

/**
 * Convert to response DTO
 */
export function toUserPreferenceResponse(pref: UserPreference): UserPreferenceResponseDTO {
  return {
    id: pref.id,
    user_id: pref.user_id || '',
    preference_type: pref.preference_type || '',
    preference_value: pref.preference_value || '',
    created_at: pref.created_at,
    updated_at: pref.updated_at,
  };
}
