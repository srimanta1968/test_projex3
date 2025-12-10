/**
 * AdminAction Model - TypeScript interfaces matching the database schema
 * Table: adminactions (from user-defined-schemas.sql)
 */

export interface AdminAction {
  id: string;
  admin_id: string | null;
  user_id: string | null;
  action: string | null;
  timestamp: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAdminActionDTO {
  admin_id: string;
  user_id: string;
  action: string;
  timestamp?: Date;
}

export interface AdminActionResponseDTO {
  id: string;
  admin_id: string | null;
  user_id: string | null;
  action: string | null;
  timestamp: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Convert an AdminAction to AdminActionResponseDTO
 */
export function toAdminActionResponse(adminAction: AdminAction): AdminActionResponseDTO {
  return {
    id: adminAction.id,
    admin_id: adminAction.admin_id,
    user_id: adminAction.user_id,
    action: adminAction.action,
    timestamp: adminAction.timestamp,
    created_at: adminAction.created_at,
    updated_at: adminAction.updated_at,
  };
}
