/**
 * AdminRideLog Model - TypeScript interfaces matching the database schema
 * Table: adminridelogs (from user-defined-schemas.sql)
 */

export interface AdminRideLog {
  id: string;
  admin_id: string | null;
  ride_id: string | null;
  action: string | null;
  timestamp: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAdminRideLogDTO {
  admin_id: string;
  ride_id: string;
  action: string;
  timestamp?: Date;
}

export interface AdminRideLogResponseDTO {
  id: string;
  admin_id: string | null;
  ride_id: string | null;
  action: string | null;
  timestamp: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Convert an AdminRideLog to AdminRideLogResponseDTO
 */
export function toAdminRideLogResponse(adminRideLog: AdminRideLog): AdminRideLogResponseDTO {
  return {
    id: adminRideLog.id,
    admin_id: adminRideLog.admin_id,
    ride_id: adminRideLog.ride_id,
    action: adminRideLog.action,
    timestamp: adminRideLog.timestamp,
    created_at: adminRideLog.created_at,
    updated_at: adminRideLog.updated_at,
  };
}
