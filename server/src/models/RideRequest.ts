/**
 * Ride Request entity - matches database schema
 */
export interface RideRequest {
  id: string;
  user_id: string | null;
  offer_id: string | null;
  status: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Ride request status enum
 */
export type RideRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

/**
 * Create ride request DTO
 */
export interface CreateRideRequestDTO {
  offer_id: string;
  message?: string;
  seats_requested?: number;
}

/**
 * Update ride request DTO
 */
export interface UpdateRideRequestDTO {
  status?: RideRequestStatus;
  message?: string;
}

/**
 * Ride request response
 */
export interface RideRequestResponseDTO {
  id: string;
  user_id: string;
  offer_id: string;
  status: RideRequestStatus;
  created_at: Date;
  updated_at: Date;
  requester_name?: string;
  offer_details?: {
    pickup_location: string;
    dropoff_location: string;
  };
}

/**
 * Convert to response DTO
 */
export function toRideRequestResponse(
  request: RideRequest,
  requesterName?: string,
  offerDetails?: { pickup_location: string; dropoff_location: string }
): RideRequestResponseDTO {
  return {
    id: request.id,
    user_id: request.user_id || '',
    offer_id: request.offer_id || '',
    status: (request.status as RideRequestStatus) || 'pending',
    created_at: request.created_at,
    updated_at: request.updated_at,
    requester_name: requesterName,
    offer_details: offerDetails,
  };
}
