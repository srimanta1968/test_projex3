/**
 * AdminDriverAction Model - TypeScript interfaces matching the database schema
 * Table: admindriveractions (from user-defined-schemas.sql)
 */

export interface AdminDriverAction {
  id: string;
  admin_id: string | null;
  driver_id: string | null;
  action: string | null;
  timestamp: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAdminDriverActionDTO {
  admin_id: string;
  driver_id: string;
  action: string;
  timestamp?: Date;
}

export interface AdminDriverActionResponseDTO {
  id: string;
  admin_id: string | null;
  driver_id: string | null;
  action: string | null;
  timestamp: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Convert an AdminDriverAction to AdminDriverActionResponseDTO
 */
export function toAdminDriverActionResponse(adminDriverAction: AdminDriverAction): AdminDriverActionResponseDTO {
  return {
    id: adminDriverAction.id,
    admin_id: adminDriverAction.admin_id,
    driver_id: adminDriverAction.driver_id,
    action: adminDriverAction.action,
    timestamp: adminDriverAction.timestamp,
    created_at: adminDriverAction.created_at,
    updated_at: adminDriverAction.updated_at,
  };
}
