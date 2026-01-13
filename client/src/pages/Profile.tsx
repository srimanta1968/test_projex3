import { useState, useEffect } from 'react';
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

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ProfileError | null>(null);

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

  if (error) {
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

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
                <div className="bg-gray-50 rounded p-3">
                  {profile?.preferences &&
                  Object.keys(profile.preferences).length > 0 ? (
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(profile.preferences, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-gray-500 text-sm">No preferences set</p>
                  )}
                </div>
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
