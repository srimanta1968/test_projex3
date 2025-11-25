import { useState, useEffect } from 'react';
import {
  getPreferences,
  setPreference,
  UserPreference,
  PREFERENCE_TYPES,
  PreferenceType,
  getPreferenceValue,
  getPreferenceLabel,
} from '../services/preferenceService';

/**
 * Preferences Management Page
 * Allows users to manage their ride-sharing preferences
 */
export default function Preferences() {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPreferences();
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (type: PreferenceType, value: string) => {
    try {
      setSaving(type);
      setError(null);
      setSuccess(null);

      const updated = await setPreference({
        preference_type: type,
        preference_value: value,
      });

      // Update local state
      setPreferences((prev) => {
        const existing = prev.findIndex((p) => p.preference_type === type);
        if (existing >= 0) {
          const newPrefs = [...prev];
          newPrefs[existing] = updated;
          return newPrefs;
        }
        return [...prev, updated];
      });

      setSuccess(`${PREFERENCE_TYPES[type].label} preference saved!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preference');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Preferences</h1>
          <p className="text-gray-600 mt-2">
            Manage your ride-sharing preferences to find better matches
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Ride Preferences Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ride Preferences
          </h2>
          <p className="text-gray-600 mb-6">
            Set your preferences for rides. These help match you with compatible drivers and riders.
          </p>

          <div className="space-y-6">
            {/* Smoking Preference */}
            <PreferenceSelect
              type="smoking"
              currentValue={getPreferenceValue(preferences, 'smoking')}
              onSelect={handlePreferenceChange}
              saving={saving === 'smoking'}
            />

            {/* Music Preference */}
            <PreferenceSelect
              type="music"
              currentValue={getPreferenceValue(preferences, 'music')}
              onSelect={handlePreferenceChange}
              saving={saving === 'music'}
            />

            {/* Conversation Preference */}
            <PreferenceSelect
              type="conversation"
              currentValue={getPreferenceValue(preferences, 'conversation')}
              onSelect={handlePreferenceChange}
              saving={saving === 'conversation'}
            />

            {/* Pets Preference */}
            <PreferenceSelect
              type="pets"
              currentValue={getPreferenceValue(preferences, 'pets')}
              onSelect={handlePreferenceChange}
              saving={saving === 'pets'}
            />

            {/* Luggage Preference */}
            <PreferenceSelect
              type="luggage"
              currentValue={getPreferenceValue(preferences, 'luggage')}
              onSelect={handlePreferenceChange}
              saving={saving === 'luggage'}
            />

            {/* AC Preference */}
            <PreferenceSelect
              type="ac"
              currentValue={getPreferenceValue(preferences, 'ac')}
              onSelect={handlePreferenceChange}
              saving={saving === 'ac'}
            />
          </div>
        </div>

        {/* App Settings Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            App Settings
          </h2>
          <p className="text-gray-600 mb-6">
            Configure your application settings and notifications.
          </p>

          <div className="space-y-6">
            {/* Notification Preference */}
            <PreferenceSelect
              type="notification"
              currentValue={getPreferenceValue(preferences, 'notification')}
              onSelect={handlePreferenceChange}
              saving={saving === 'notification'}
            />

            {/* Language Preference */}
            <PreferenceSelect
              type="language"
              currentValue={getPreferenceValue(preferences, 'language')}
              onSelect={handlePreferenceChange}
              saving={saving === 'language'}
            />
          </div>
        </div>

        {/* Current Preferences Summary */}
        {preferences.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Your Current Preferences
            </h3>
            <div className="flex flex-wrap gap-2">
              {preferences.map((pref) => (
                <span
                  key={pref.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                >
                  <span className="font-medium mr-1">
                    {PREFERENCE_TYPES[pref.preference_type as PreferenceType]?.label || pref.preference_type}:
                  </span>
                  {getPreferenceLabel(pref.preference_value)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Preference Select Component
 */
interface PreferenceSelectProps {
  type: PreferenceType;
  currentValue: string | null;
  onSelect: (type: PreferenceType, value: string) => void;
  saving: boolean;
}

function PreferenceSelect({ type, currentValue, onSelect, saving }: PreferenceSelectProps) {
  const config = PREFERENCE_TYPES[type];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
      <div className="mb-2 sm:mb-0">
        <label className="block text-sm font-medium text-gray-900">
          {config.label}
        </label>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={currentValue || ''}
          onChange={(e) => e.target.value && onSelect(type, e.target.value)}
          disabled={saving}
          className="form-select rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
        >
          <option value="">Select preference...</option>
          {config.options.map((option) => (
            <option key={option} value={option}>
              {getPreferenceLabel(option)}
            </option>
          ))}
        </select>
        {saving && (
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        )}
        {currentValue && !saving && (
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
