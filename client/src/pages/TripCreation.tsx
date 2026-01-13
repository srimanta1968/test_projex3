import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface TripFormData {
  destination: string;
  departure_time: string;
}

interface TripError {
  message: string;
}

export default function TripCreation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TripFormData>({
    destination: '',
    departure_time: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<TripError | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    if (!formData.destination.trim()) {
      setError({ message: 'Please enter a destination' });
      return;
    }

    if (!formData.departure_time) {
      setError({ message: 'Please select a departure time' });
      return;
    }

    const departureDate = new Date(formData.departure_time);
    if (departureDate <= new Date()) {
      setError({ message: 'Departure time must be in the future' });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination: formData.destination.trim(),
          departure_time: formData.departure_time,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        throw new Error(data.error || 'Failed to create trip');
      }

      setSuccess(true);
      setFormData({ destination: '', departure_time: '' });
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to create trip',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Create a New Trip
            </h1>

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                Trip created successfully! You can create another trip or{' '}
                <button
                  onClick={() => navigate('/trip-history')}
                  className="underline hover:text-green-800"
                >
                  view your trips
                </button>
                .
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="destination"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Destination
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="Enter your destination"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="departure_time"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Departure Time
                </label>
                <input
                  type="datetime-local"
                  id="departure_time"
                  name="departure_time"
                  value={formData.departure_time}
                  onChange={handleInputChange}
                  min={getMinDateTime()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating Trip...' : 'Create Trip'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
