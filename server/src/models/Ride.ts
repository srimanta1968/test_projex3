/**
 * Ride Model - TypeScript interfaces matching the database schema
 * Table: rides (from user-defined-schemas.sql)
 */

export interface Ride {
  id: string;
  user_id: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  status: RideStatus | null;
  created_at: Date;
  updated_at: Date;
}

export type RideStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface CreateRideDTO {
  user_id: string;
  pickup_location: string;
  dropoff_location: string;
  status?: RideStatus;
}

export interface UpdateRideDTO {
  pickup_location?: string;
  dropoff_location?: string;
  status?: RideStatus;
}

export interface RideResponseDTO {
  id: string;
  user_id: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  status: RideStatus | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Convert a Ride to RideResponseDTO
 */
export function toRideResponse(ride: Ride): RideResponseDTO {
  return {
    id: ride.id,
    user_id: ride.user_id,
    pickup_location: ride.pickup_location,
    dropoff_location: ride.dropoff_location,
    status: ride.status,
    created_at: ride.created_at,
    updated_at: ride.updated_at,
  };
}
