/**
 * DriverRating Model - TypeScript interfaces matching the database schema
 * Table: driverratings (from user-defined-schemas.sql)
 */

export interface DriverRating {
  id: string;
  driver_id: string | null;
  user_id: string | null;
  rating: string | null;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDriverRatingDTO {
  driver_id: string;
  user_id: string;
  rating: string;
  comment?: string;
}

export interface UpdateDriverRatingDTO {
  rating?: string;
  comment?: string;
}

export interface DriverRatingResponseDTO {
  id: string;
  driver_id: string | null;
  user_id: string | null;
  rating: string | null;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Convert a DriverRating to DriverRatingResponseDTO
 */
export function toDriverRatingResponse(driverRating: DriverRating): DriverRatingResponseDTO {
  return {
    id: driverRating.id,
    driver_id: driverRating.driver_id,
    user_id: driverRating.user_id,
    rating: driverRating.rating,
    comment: driverRating.comment,
    created_at: driverRating.created_at,
    updated_at: driverRating.updated_at,
  };
}
