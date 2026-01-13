import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  user_id: string;
  preferences: Record<string, unknown>;
  trip_history: Record<string, unknown>;
}

interface ProfileError {
  message: string;
}

interface PreferencesForm {
  notifications: boolean;
  theme: 'light' | 'dark';
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ProfileError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesForm>({
    notifications: true,
    theme: 'light',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
          throw new Error(data.error || 'Failed to load profile');
        }

        setProfile(data.data.profile);

        if (data.data.profile?.preferences) {
          const prefs = data.data.profile.preferences as Record<string, unknown>;
          setPreferences({
            notifications: prefs.notifications === true,
            theme: prefs.theme === 'dark' ? 'dark' : 'light',
          });
        }
      } catch (err) {
        setError({
          message: err instanceof Error ? err.message : 'Failed to load profile',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSavePreferences = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfile(data.data.profile);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile?.preferences) {
      const prefs = profile.preferences as Record<string, unknown>;
      setPreferences({
        notifications: prefs.notifications === true,
        theme: prefs.theme === 'dark' ? 'dark' : 'light',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error.message}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error.message}
              </div>
            )}

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Account Information
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{user.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile ID:</span>
                    <span className="font-medium text-sm">{profile?.id || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Preferences
                </h2>
                {isEditing ? (
                  <form onSubmit={handleSavePreferences} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="notifications" className="text-gray-700">
                        Enable Notifications
                      </label>
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={preferences.notifications}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            notifications: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="theme" className="text-gray-700">
                        Theme
                      </label>
                      <select
                        id="theme"
                        value={preferences.theme}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            theme: e.target.value as 'light' | 'dark',
                          }))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gray-50 rounded p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Notifications:</span>
                      <span className="font-medium">
                        {preferences.notifications ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Theme:</span>
                      <span className="font-medium capitalize">{preferences.theme}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Trip History Summary
                </h2>
                <div className="bg-gray-50 rounded p-3">
                  {profile?.trip_history &&
                  Object.keys(profile.trip_history).length > 0 ? (
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(profile.trip_history, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-gray-500 text-sm">No trip history yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
