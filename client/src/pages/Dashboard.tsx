import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardData } from '../services/dashboardService';
import { DashboardData } from '../types';

/**
 * Dashboard page component
 */
function Dashboard() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch dashboard data on mount
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Quick Taxi</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Welcome, {user?.name || user?.email}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Ride Offers"
            value={dashboardData?.stats.totalRideOffers || 0}
            description="Total offers created"
            icon="🚗"
          />
          <StatCard
            title="Ride Requests"
            value={dashboardData?.stats.totalRideRequests || 0}
            description="Total requests made"
            icon="📝"
          />
          <StatCard
            title="Active Matches"
            value={dashboardData?.stats.activeMatches || 0}
            description="Currently matched rides"
            icon="🤝"
          />
          <StatCard
            title="Pending Requests"
            value={dashboardData?.stats.pendingRequests || 0}
            description="Awaiting response"
            icon="⏳"
          />
          <StatCard
            title="Transactions"
            value={dashboardData?.stats.totalTransactions || 0}
            description="Completed payments"
            icon="💳"
          />
          <StatCard
            title="Total Spent"
            value={`$${(dashboardData?.stats.totalSpent || 0).toFixed(2)}`}
            description="Lifetime spending"
            icon="💰"
          />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Offers */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Ride Offers</h2>
            {dashboardData?.myOffers && dashboardData.myOffers.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {dashboardData.myOffers.map((offer) => (
                  <li key={offer.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {offer.pickup_location || 'Unknown'} → {offer.dropoff_location || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {offer.available_seats} seats available
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(offer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-8">No ride offers yet</p>
            )}
          </div>

          {/* My Requests */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Ride Requests</h2>
            {dashboardData?.myRequests && dashboardData.myRequests.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {dashboardData.myRequests.map((request) => (
                  <li key={request.id} className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Request #{request.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: {request.status || 'Pending'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-8">No ride requests yet</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {dashboardData.recentActivity.map((activity) => (
                  <li key={activity.id} className="py-3 flex items-center gap-3">
                    <span className="text-lg">
                      {activity.type === 'ride_offer' && '🚗'}
                      {activity.type === 'ride_request' && '📝'}
                      {activity.type === 'match' && '🤝'}
                      {activity.type === 'transaction' && '💳'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Stat card component
 */
function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

export default Dashboard;
