import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Banking Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.first_name} {user?.last_name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Dashboard</h2>
          <p className="text-gray-600">
            Your financial dashboard is being set up. Stay tuned for:
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>Real-time balance overview</li>
            <li>Income vs Expenses charts</li>
            <li>Net worth calculations</li>
            <li>Transaction history</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
