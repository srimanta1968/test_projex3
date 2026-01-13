import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import TripHistory from './pages/TripHistory';
import Feedback from './pages/Feedback';
import TripCreation from './pages/TripCreation';
import MatchedTrips from './pages/MatchedTrips';
import Payments from './pages/Payments';

interface User {
  id: string;
  email: string;
}

function Navigation() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      const interval = setInterval(fetchNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setNotificationCount(data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Ride Share</Link>
        <div className="space-x-4 flex items-center">
          {user ? (
            <>
              <Link to="/profile" className="hover:underline">Profile</Link>
              <Link to="/create-trip" className="hover:underline">New Trip</Link>
              <Link to="/matched-trips" className="hover:underline relative">
                Matches
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Link>
              <Link to="/trip-history" className="hover:underline">Trips</Link>
              <Link to="/payments" className="hover:underline">Payments</Link>
              <Link to="/feedback" className="hover:underline">Feedback</Link>
              <span className="text-sm">{user.email}</span>
              <button
                onClick={handleLogout}
                className="hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Ride Share</h1>
      <p className="text-gray-600 mb-4">Share rides, save money, help the environment.</p>
      {user ? (
        <p className="text-green-600">Welcome back, {user.email}!</p>
      ) : (
        <Link to="/register" className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Get Started
        </Link>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/trip-history" element={<TripHistory />} />
          <Route path="/create-trip" element={<TripCreation />} />
          <Route path="/matched-trips" element={<MatchedTrips />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
