import { useState, useEffect } from 'react';
import {
  RideOffer,
  getMyOffers,
  getAvailableOffers,
  createOffer,
  deleteOffer,
  createRequest,
  CreateOfferData,
} from '../services/rideService';

export default function RideOffers() {
  const [myOffers, setMyOffers] = useState<RideOffer[]>([]);
  const [availableOffers, setAvailableOffers] = useState<RideOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateOfferData>({
    pickup_location: '',
    dropoff_location: '',
    available_seats: 1,
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const [mine, available] = await Promise.all([getMyOffers(), getAvailableOffers()]);
      setMyOffers(mine);
      setAvailableOffers(available);
    } catch (err) {
      setError('Failed to load offers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOffer(formData);
      setShowCreateForm(false);
      setFormData({ pickup_location: '', dropoff_location: '', available_seats: 1 });
      loadOffers();
    } catch (err) {
      setError('Failed to create offer');
      console.error(err);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      await deleteOffer(offerId);
      loadOffers();
    } catch (err) {
      setError('Failed to delete offer');
      console.error(err);
    }
  };

  const handleRequestRide = async (offerId: string) => {
    try {
      await createRequest(offerId);
      alert('Ride request sent!');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to request ride';
      setError(errorMsg);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Ride Offers</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Create New Offer
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Create Offer Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Ride Offer</h2>
              <form onSubmit={handleCreateOffer}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                  <input
                    type="text"
                    value={formData.pickup_location}
                    onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Dropoff Location</label>
                  <input
                    type="text"
                    value={formData.dropoff_location}
                    onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Available Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.available_seats}
                    onChange={(e) =>
                      setFormData({ ...formData, available_seats: parseInt(e.target.value) })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Offers */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">My Offers</h2>
          {myOffers.length === 0 ? (
            <p className="text-gray-500">You haven't created any offers yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myOffers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {offer.pickup_location} → {offer.dropoff_location}
                      </p>
                      <p className="text-sm text-gray-500">
                        {offer.available_seats} seat(s) available
                      </p>
                      <p className="text-xs text-gray-400">
                        Created: {new Date(offer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Offers */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Rides</h2>
          {availableOffers.length === 0 ? (
            <p className="text-gray-500">No rides available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableOffers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-lg shadow p-4">
                  <p className="font-medium text-gray-900">
                    {offer.pickup_location} → {offer.dropoff_location}
                  </p>
                  <p className="text-sm text-gray-600">Driver: {offer.driver_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">
                    {offer.available_seats} seat(s) available
                  </p>
                  <button
                    onClick={() => handleRequestRide(offer.id)}
                    className="mt-3 w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Request Ride
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
