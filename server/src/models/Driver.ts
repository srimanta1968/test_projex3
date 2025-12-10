/**
 * Driver Model - TypeScript interfaces matching the database schema
 * Table: drivers (from user-defined-schemas.sql)
 */

export interface Driver {
  id: string;
  name: string | null;
  vehicle_type: string | null;
  license_number: number | null;
  rating: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDriverDTO {
  name: string;
  vehicle_type: string;
  license_number: number;
}

export interface UpdateDriverDTO {
  name?: string;
  vehicle_type?: string;
  license_number?: number;
  rating?: string;
}

export interface DriverResponseDTO {
  id: string;
  name: string | null;
  vehicle_type: string | null;
  license_number: number | null;
  rating: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Convert a Driver to DriverResponseDTO
 */
export function toDriverResponse(driver: Driver): DriverResponseDTO {
  return {
    id: driver.id,
    name: driver.name,
    vehicle_type: driver.vehicle_type,
    license_number: driver.license_number,
    rating: driver.rating,
    created_at: driver.created_at,
    updated_at: driver.updated_at,
  };
}
