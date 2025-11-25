import api from './api';
import { ApiResponse } from '../types';

/**
 * User preference response type
 */
export interface UserPreference {
  id: string;
  user_id: string;
  preference_type: string;
  preference_value: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create/Update preference payload
 */
export interface SetPreferencePayload {
  preference_type: string;
  preference_value: string;
}

/**
 * Available preference types for ride-sharing
 */
export const PREFERENCE_TYPES = {
  smoking: { label: 'Smoking', options: ['allowed', 'not_allowed'] },
  music: { label: 'Music', options: ['allowed', 'quiet', 'not_allowed'] },
  conversation: { label: 'Conversation', options: ['chatty', 'moderate', 'quiet'] },
  pets: { label: 'Pets', options: ['allowed', 'small_only', 'not_allowed'] },
  luggage: { label: 'Luggage', options: ['small', 'medium', 'large'] },
  ac: { label: 'Air Conditioning', options: ['on', 'off', 'no_preference'] },
  notification: { label: 'Notifications', options: ['all', 'important_only', 'none'] },
  language: { label: 'Language', options: ['english', 'spanish', 'french', 'german'] },
} as const;

export type PreferenceType = keyof typeof PREFERENCE_TYPES;

/**
 * Get all user preferences
 */
export async function getPreferences(): Promise<UserPreference[]> {
  const response = await api.get<ApiResponse<UserPreference[]>>('/preferences');
  return response.data.data || [];
}

/**
 * Set a single preference (creates or updates)
 */
export async function setPreference(data: SetPreferencePayload): Promise<UserPreference> {
  const response = await api.post<ApiResponse<UserPreference>>('/preferences', data);
  if (!response.data.data) {
    throw new Error('Failed to set preference');
  }
  return response.data.data;
}

/**
 * Set multiple preferences at once
 */
export async function setMultiplePreferences(preferences: SetPreferencePayload[]): Promise<UserPreference[]> {
  const response = await api.post<ApiResponse<UserPreference[]>>('/preferences/bulk', { preferences });
  return response.data.data || [];
}

/**
 * Delete a preference
 */
export async function deletePreference(preferenceId: string): Promise<void> {
  await api.delete(`/preferences/${preferenceId}`);
}

/**
 * Get preference value for a specific type
 */
export function getPreferenceValue(
  preferences: UserPreference[],
  type: PreferenceType
): string | null {
  const pref = preferences.find((p) => p.preference_type === type);
  return pref?.preference_value || null;
}

/**
 * Get preference display label
 */
export function getPreferenceLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default {
  getPreferences,
  setPreference,
  setMultiplePreferences,
  deletePreference,
  getPreferenceValue,
  getPreferenceLabel,
  PREFERENCE_TYPES,
};
