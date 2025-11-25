import api from './api';

// Types
export interface RideOffer {
  id: string;
  user_id: string;
  pickup_location: string;
  dropoff_location: string;
  available_seats: number;
  driver_name?: string;
  created_at: string;
  updated_at: string;
}

export interface RideRequest {
  id: string;
  user_id: string;
  offer_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  requester_name?: string;
  pickup_location?: string;
  dropoff_location?: string;
  created_at: string;
  updated_at: string;
}

export interface MatchedRide {
  id: string;
  ride_offer_id: string;
  user_id: string;
  status: 'active' | 'completed' | 'cancelled';
  rider_name?: string;
  driver_name?: string;
  pickup_location?: string;
  dropoff_location?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferData {
  pickup_location: string;
  dropoff_location: string;
  available_seats: number;
}

export interface SearchFilters {
  pickup_location?: string;
  dropoff_location?: string;
  min_seats?: number;
}

// Ride Offers
export const getMyOffers = async (limit = 20): Promise<RideOffer[]> => {
  const response = await api.get(`/rides/offers?limit=${limit}`);
  return response.data.data;
};

export const getAvailableOffers = async (limit = 20): Promise<RideOffer[]> => {
  const response = await api.get(`/rides/offers/available?limit=${limit}`);
  return response.data.data;
};

export const searchOffers = async (filters: SearchFilters, limit = 20): Promise<RideOffer[]> => {
  const params = new URLSearchParams();
  if (filters.pickup_location) params.append('pickup_location', filters.pickup_location);
  if (filters.dropoff_location) params.append('dropoff_location', filters.dropoff_location);
  if (filters.min_seats) params.append('min_seats', filters.min_seats.toString());
  params.append('limit', limit.toString());

  const response = await api.get(`/rides/offers/search?${params.toString()}`);
  return response.data.data;
};

export const getOfferById = async (offerId: string): Promise<RideOffer> => {
  const response = await api.get(`/rides/offers/${offerId}`);
  return response.data.data;
};

export const createOffer = async (data: CreateOfferData): Promise<RideOffer> => {
  const response = await api.post('/rides/offers', data);
  return response.data.data;
};

export const updateOffer = async (offerId: string, data: Partial<CreateOfferData>): Promise<RideOffer> => {
  const response = await api.put(`/rides/offers/${offerId}`, data);
  return response.data.data;
};

export const deleteOffer = async (offerId: string): Promise<void> => {
  await api.delete(`/rides/offers/${offerId}`);
};

// Ride Requests
export const getMyRequests = async (limit = 20): Promise<RideRequest[]> => {
  const response = await api.get(`/rides/requests?limit=${limit}`);
  return response.data.data;
};

export const getIncomingRequests = async (limit = 20): Promise<RideRequest[]> => {
  const response = await api.get(`/rides/requests/incoming?limit=${limit}`);
  return response.data.data;
};

export const getPendingRequestsCount = async (): Promise<number> => {
  const response = await api.get('/rides/requests/pending-count');
  return response.data.data.count;
};

export const createRequest = async (offerId: string): Promise<RideRequest> => {
  const response = await api.post('/rides/requests', { offer_id: offerId });
  return response.data.data;
};

export const updateRequestStatus = async (
  requestId: string,
  status: 'accepted' | 'rejected'
): Promise<RideRequest> => {
  const response = await api.put(`/rides/requests/${requestId}/status`, { status });
  return response.data.data;
};

export const cancelRequest = async (requestId: string): Promise<void> => {
  await api.delete(`/rides/requests/${requestId}`);
};

// Ride Matches
export const getMatchesAsRider = async (limit = 20): Promise<MatchedRide[]> => {
  const response = await api.get(`/rides/matches/rider?limit=${limit}`);
  return response.data.data;
};

export const getMatchesAsDriver = async (limit = 20): Promise<MatchedRide[]> => {
  const response = await api.get(`/rides/matches/driver?limit=${limit}`);
  return response.data.data;
};

export const getMatchById = async (matchId: string): Promise<MatchedRide> => {
  const response = await api.get(`/rides/matches/${matchId}`);
  return response.data.data;
};

export const acceptRequestAndMatch = async (requestId: string): Promise<MatchedRide> => {
  const response = await api.post('/rides/matches/accept', { request_id: requestId });
  return response.data.data;
};

export const completeRide = async (matchId: string): Promise<MatchedRide> => {
  const response = await api.post(`/rides/matches/${matchId}/complete`);
  return response.data.data;
};

export const cancelMatch = async (matchId: string): Promise<void> => {
  await api.post(`/rides/matches/${matchId}/cancel`);
};
