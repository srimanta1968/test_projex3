/**
 * RideHistory Model - TypeScript interfaces matching the database schema
 * Table: ridehistory (from user-defined-schemas.sql)
 */

export interface RideHistory {
  id: string;
  ride_id: string | null;
  user_id: string | null;
  date: Date | null;
  amount: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRideHistoryDTO {
  ride_id: string;
  user_id: string;
  date: Date;
  amount: number;
}

export interface UpdateRideHistoryDTO {
  date?: Date;
  amount?: number;
}

export interface RideHistoryResponseDTO {
  id: string;
  ride_id: string | null;
  user_id: string | null;
  date: Date | null;
  amount: number | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Convert a RideHistory to RideHistoryResponseDTO
 */
export function toRideHistoryResponse(rideHistory: RideHistory): RideHistoryResponseDTO {
  return {
    id: rideHistory.id,
    ride_id: rideHistory.ride_id,
    user_id: rideHistory.user_id,
    date: rideHistory.date,
    amount: rideHistory.amount,
    created_at: rideHistory.created_at,
    updated_at: rideHistory.updated_at,
  };
}
