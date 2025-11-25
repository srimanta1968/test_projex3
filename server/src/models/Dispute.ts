/**
 * Dispute model interfaces
 */

/**
 * Dispute types
 */
export type DisputeType = 'payment' | 'ride' | 'service' | 'driver' | 'passenger' | 'other';

/**
 * Dispute status
 */
export type DisputeStatus = 'open' | 'under_review' | 'awaiting_response' | 'resolved' | 'closed' | 'escalated';

/**
 * Dispute entity
 */
export interface Dispute {
  id: string;
  transaction_id: string | null;
  user_id: string;
  disputed_user_id: string | null;
  dispute_type: DisputeType;
  status: DisputeStatus;
  reason: string;
  description: string | null;
  evidence_urls: string[];
  resolution: string | null;
  resolved_at: Date | null;
  resolved_by: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Dispute message entity
 */
export interface DisputeMessage {
  id: string;
  dispute_id: string;
  user_id: string | null;
  message: string;
  is_admin: boolean;
  created_at: Date;
}

/**
 * Create dispute DTO
 */
export interface CreateDisputeDTO {
  transaction_id?: string;
  disputed_user_id?: string;
  dispute_type: DisputeType;
  reason: string;
  description?: string;
  evidence_urls?: string[];
}

/**
 * Update dispute DTO
 */
export interface UpdateDisputeDTO {
  status?: DisputeStatus;
  resolution?: string;
}

/**
 * Add message DTO
 */
export interface AddMessageDTO {
  message: string;
}

/**
 * Dispute response with additional info
 */
export interface DisputeResponseDTO extends Dispute {
  user_name?: string;
  disputed_user_name?: string;
  messages?: DisputeMessage[];
  message_count?: number;
}

/**
 * Dispute statistics
 */
export interface DisputeStatistics {
  total: number;
  open: number;
  under_review: number;
  resolved: number;
  by_type: Record<DisputeType, number>;
}
