import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface MatchedTrip {
  id: string;
  trip_id: string;
  user_id: string;
  destination: string;
  departure_time: string;
  match_score: number;
}

interface Match {
  id: string;
  match_id: string;
  trip_id: string;
  user_id: string;
  matched_at: string;
}

interface UserTrip {
  id: string;
  destination: string;
  departure_time: string;
}

/**
 * MatchedTrips component displays matched trips for the current user
 */
export default function MatchedTrips() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [userTrips, setUserTrips] = useState<UserTrip[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<MatchedTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserMatches();
    fetchUserTrips();
  }, [navigate]);

  /**
   * Fetch user's existing matches
   */
  const fetchUserMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/matching', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMatches(data.data.matches);
      } else {
        setError(data.error || 'Failed to load matches');
      }
    } catch (err) {
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch user's trips for the dropdown selector
   */
  const fetchUserTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/trips', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setUserTrips(data.data.trips || []);
      }
    } catch (err) {
      console.error('Failed to load user trips:', err);
    }
  };

  /**
   * Search for potential matches for a selected trip
   */
  const handleFindMatches = async () => {
    if (!selectedTripId) {
      setError('Please select a trip');
      return;
    }

    setSearchLoading(true);
    setError(null);
    setPotentialMatches([]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/matching/find', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trip_id: selectedTripId }),
      });

      const data = await response.json();

      if (data.success) {
        setPotentialMatches(data.data.matches || []);
        if (data.data.matches.length === 0) {
          setError('No matching trips found. Try creating a trip with a different destination or time.');
        }
      } else {
        setError(data.error || 'Failed to find matches');
      }
    } catch (err) {
      setError('Failed to search for matches');
    } finally {
      setSearchLoading(false);
    }
  };

  /**
   * Create a match between user's trip and a matched trip
   */
  const handleCreateMatch = async (matchedTripId: string) => {
    if (!selectedTripId) {
      setError('Please select your trip first');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/matching', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trip_id: selectedTripId,
          matched_trip_id: matchedTripId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Match created successfully!');
        fetchUserMatches();
        setPotentialMatches((prev) =>
          prev.filter((m) => m.trip_id !== matchedTripId)
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Failed to create match');
      }
    } catch (err) {
      setError('Failed to create match');
    }
  };

  /**
   * Format a date string for display
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Trip Matching</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Find Matches Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Find Matching Trips</h2>

        <div className="flex gap-4 items-end mb-4">
          <div className="flex-1">
            <label className="block text-gray-700 mb-2">Select Your Trip</label>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a trip --</option>
              {userTrips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.destination} - {formatDate(trip.departure_time)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleFindMatches}
            disabled={searchLoading || !selectedTripId}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {searchLoading ? 'Searching...' : 'Find Matches'}
          </button>
        </div>

        {userTrips.length === 0 && (
          <p className="text-gray-500">
            You haven't created any trips yet.{' '}
            <a href="/create-trip" className="text-blue-600 hover:underline">
              Create a trip
            </a>{' '}
            to find matches.
          </p>
        )}
      </div>

      {/* Potential Matches Section */}
      {potentialMatches.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Potential Matches ({potentialMatches.length})
          </h2>

          <div className="space-y-4">
            {potentialMatches.map((match) => (
              <div
                key={match.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{match.destination}</p>
                    <p className="text-gray-600">
                      Departure: {formatDate(match.departure_time)}
                    </p>
                    <p className="text-sm text-green-600">
                      Match Score: {match.match_score}%
                    </p>
                  </div>
                  <button
                    onClick={() => handleCreateMatch(match.trip_id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Join Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Matches Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Your Matches ({matches.length})
        </h2>

        {matches.length === 0 ? (
          <p className="text-gray-500">
            You haven't matched with any trips yet. Use the search above to find
            compatible trips!
          </p>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="border rounded-lg p-4 bg-green-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Match ID: {match.match_id}</p>
                    <p className="text-gray-600">Trip ID: {match.trip_id}</p>
                    <p className="text-sm text-gray-500">
                      Matched: {formatDate(match.matched_at)}
                    </p>
                  </div>
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                    Matched
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
