import { useState, useEffect, useCallback } from 'react';
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

interface Filters {
  destination: string;
  startDate: string;
  endDate: string;
}

export default function TripHistory() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TripHistoryError | null>(null);
  const [filters, setFilters] = useState<Filters>({
    destination: '',
    startDate: '',
    endDate: '',
  });

  const fetchTripHistory = useCallback(async (currentFilters: Filters) => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (currentFilters.destination) {
        params.append('destination', currentFilters.destination);
      }
      if (currentFilters.startDate) {
        params.append('startDate', currentFilters.startDate);
      }
      if (currentFilters.endDate) {
        params.append('endDate', currentFilters.endDate);
      }

      const url = `/api/trip-history${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
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
  }, [navigate]);

  useEffect(() => {
    fetchTripHistory(filters);
  }, [fetchTripHistory, filters]);

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ destination: '', startDate: '', endDate: '' });
  };

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
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  value={filters.destination}
                  onChange={(e) => handleFilterChange('destination', e.target.value)}
                  placeholder="Search destination..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

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
