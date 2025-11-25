/**
 * Ride Offer entity - matches database schema
 */
export interface RideOffer {
  id: string;
  user_id: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  available_seats: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create ride offer DTO
 */
export interface CreateRideOfferDTO {
  pickup_location: string;
  dropoff_location: string;
  available_seats: number;
  departure_time?: string;
  price_per_seat?: number;
  notes?: string;
}

/**
 * Update ride offer DTO
 */
export interface UpdateRideOfferDTO {
  pickup_location?: string;
  dropoff_location?: string;
  available_seats?: number;
  departure_time?: string;
  price_per_seat?: number;
  notes?: string;
}

/**
 * Ride offer response with user info
 */
export interface RideOfferResponseDTO {
  id: string;
  user_id: string;
  pickup_location: string;
  dropoff_location: string;
  available_seats: number;
  created_at: Date;
  updated_at: Date;
  driver_name?: string;
}

/**
 * Ride offer search filters
 */
export interface RideOfferSearchFilters {
  pickup_location?: string;
  dropoff_location?: string;
  min_seats?: number;
  date_from?: string;
  date_to?: string;
}

/**
 * Convert to response DTO
 */
export function toRideOfferResponse(offer: RideOffer, driverName?: string): RideOfferResponseDTO {
  return {
    id: offer.id,
    user_id: offer.user_id || '',
    pickup_location: offer.pickup_location || '',
    dropoff_location: offer.dropoff_location || '',
    available_seats: parseInt(offer.available_seats || '0', 10),
    created_at: offer.created_at,
    updated_at: offer.updated_at,
    driver_name: driverName,
  };
}
