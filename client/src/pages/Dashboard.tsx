import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-primary-600">Banking Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.first_name} {user?.last_name}
              </span>
              <button onClick={handleLogout} className="btn-secondary text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Summary Cards */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Balance</h3>
              <p className="text-3xl font-bold text-primary-600">$0.00</p>
              <p className="text-sm text-gray-500 mt-1">Across all accounts</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Income (This Month)</h3>
              <p className="text-3xl font-bold text-green-600">$0.00</p>
              <p className="text-sm text-gray-500 mt-1">+0% from last month</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Expenses (This Month)</h3>
              <p className="text-3xl font-bold text-red-600">$0.00</p>
              <p className="text-sm text-gray-500 mt-1">+0% from last month</p>
            </div>
          </div>

          {/* Dashboard Content Placeholder */}
          <div className="mt-8">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Overview</h2>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <p className="text-gray-500">
                  Charts and graphs will be displayed here after completing the dashboard
                  implementation.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Transactions Placeholder */}
          <div className="mt-8">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <p className="text-gray-500">
                  Recent transactions will be displayed here after implementing the transaction
                  feature.
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-8">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Username</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {user?.status?.replace('_', ' ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
