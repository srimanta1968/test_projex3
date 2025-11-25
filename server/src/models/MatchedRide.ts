/**
 * Matched Ride entity - matches database schema
 */
export interface MatchedRide {
  id: string;
  ride_offer_id: string | null;
  user_id: string | null;
  status: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Matched ride status enum
 */
export type MatchedRideStatus = 'active' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Create matched ride DTO
 */
export interface CreateMatchedRideDTO {
  ride_offer_id: string;
  user_id: string;
}

/**
 * Update matched ride DTO
 */
export interface UpdateMatchedRideDTO {
  status?: MatchedRideStatus;
}

/**
 * Matched ride response
 */
export interface MatchedRideResponseDTO {
  id: string;
  ride_offer_id: string;
  user_id: string;
  status: MatchedRideStatus;
  created_at: Date;
  updated_at: Date;
  rider_name?: string;
  offer_details?: {
    pickup_location: string;
    dropoff_location: string;
    driver_name: string;
  };
}

/**
 * Convert to response DTO
 */
export function toMatchedRideResponse(
  match: MatchedRide,
  riderName?: string,
  offerDetails?: { pickup_location: string; dropoff_location: string; driver_name: string }
): MatchedRideResponseDTO {
  return {
    id: match.id,
    ride_offer_id: match.ride_offer_id || '',
    user_id: match.user_id || '',
    status: (match.status as MatchedRideStatus) || 'active',
    created_at: match.created_at,
    updated_at: match.updated_at,
    rider_name: riderName,
    offer_details: offerDetails,
  };
}
