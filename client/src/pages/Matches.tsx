import { useState, useEffect } from 'react';
import {
  MatchedRide,
  getMatchesAsRider,
  getMatchesAsDriver,
  completeRide,
  cancelMatch,
} from '../services/rideService';

export default function Matches() {
  const [riderMatches, setRiderMatches] = useState<MatchedRide[]>([]);
  const [driverMatches, setDriverMatches] = useState<MatchedRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'rider' | 'driver'>('rider');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const [asRider, asDriver] = await Promise.all([
        getMatchesAsRider(),
        getMatchesAsDriver(),
      ]);
      setRiderMatches(asRider);
      setDriverMatches(asDriver);
    } catch (err) {
      setError('Failed to load matches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRide = async (matchId: string) => {
    try {
      await completeRide(matchId);
      alert('Ride completed successfully!');
      loadMatches();
    } catch (err) {
      setError('Failed to complete ride');
      console.error(err);
    }
  };

  const handleCancelMatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to cancel this ride?')) return;
    try {
      await cancelMatch(matchId);
      loadMatches();
    } catch (err) {
      setError('Failed to cancel match');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const activeRiderMatches = riderMatches.filter((m) => m.status === 'active');
  const activeDriverMatches = driverMatches.filter((m) => m.status === 'active');

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Rides</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Active Rides Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-900">Active as Rider</h3>
            <p className="text-3xl font-bold text-primary-600">{activeRiderMatches.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-900">Active as Driver</h3>
            <p className="text-3xl font-bold text-primary-600">{activeDriverMatches.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('rider')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rider'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                As Rider ({riderMatches.length})
              </button>
              <button
                onClick={() => setActiveTab('driver')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'driver'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                As Driver ({driverMatches.length})
              </button>
            </nav>
          </div>
        </div>

        {/* As Rider */}
        {activeTab === 'rider' && (
          <div>
            {riderMatches.length === 0 ? (
              <p className="text-gray-500">No rides as a rider yet.</p>
            ) : (
              <div className="space-y-4">
                {riderMatches.map((match) => (
                  <div key={match.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {match.pickup_location || 'N/A'} → {match.dropoff_location || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Driver: {match.driver_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Matched: {new Date(match.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                            match.status
                          )}`}
                        >
                          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                        </span>
                        {match.status === 'active' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCompleteRide(match.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleCancelMatch(match.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* As Driver */}
        {activeTab === 'driver' && (
          <div>
            {driverMatches.length === 0 ? (
              <p className="text-gray-500">No rides as a driver yet.</p>
            ) : (
              <div className="space-y-4">
                {driverMatches.map((match) => (
                  <div key={match.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {match.pickup_location || 'N/A'} → {match.dropoff_location || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Rider: {match.rider_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Matched: {new Date(match.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                            match.status
                          )}`}
                        >
                          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                        </span>
                        {match.status === 'active' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCompleteRide(match.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleCancelMatch(match.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
