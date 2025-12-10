/**
 * DriverAvailability Model - TypeScript interfaces matching the database schema
 * Table: driveravailability (from user-defined-schemas.sql)
 */

export interface DriverAvailability {
  id: string;
  driver_id: string | null;
  available_from: string | null;
  available_to: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDriverAvailabilityDTO {
  driver_id: string;
  available_from: string;
  available_to: string;
}

export interface UpdateDriverAvailabilityDTO {
  available_from?: string;
  available_to?: string;
}

export interface DriverAvailabilityResponseDTO {
  id: string;
  driver_id: string | null;
  available_from: string | null;
  available_to: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Convert a DriverAvailability to DriverAvailabilityResponseDTO
 */
export function toDriverAvailabilityResponse(availability: DriverAvailability): DriverAvailabilityResponseDTO {
  return {
    id: availability.id,
    driver_id: availability.driver_id,
    available_from: availability.available_from,
    available_to: availability.available_to,
    created_at: availability.created_at,
    updated_at: availability.updated_at,
  };
}
