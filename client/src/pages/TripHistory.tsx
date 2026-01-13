import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TripHistoryItem {
  id: string;
  history_id: string;
  trip_id: string;
  destination: string;
  departure_time: string;
  completed_at: string;
}

interface TripHistoryError {
  message: string;
}

export default function TripHistory() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TripHistoryError | null>(null);

  useEffect(() => {
    const fetchTripHistory = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/api/trip-history', {
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
          throw new Error(data.error || 'Failed to load trip history');
        }

        setTrips(data.data.trips || []);
      } catch (err) {
        setError({
          message: err instanceof Error ? err.message : 'Failed to load trip history',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTripHistory();
  }, [navigate]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip history...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Trip History</h1>

            {trips.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No trips found</p>
                <p className="text-gray-400 mt-2">
                  Your completed trips will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {trip.destination}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Departed: {formatDate(trip.departure_time)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Completed
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(trip.completed_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
