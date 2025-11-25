import api from './api';
import { ApiResponse } from '../types';

/**
 * Dispute types
 */
export type DisputeType = 'payment' | 'ride' | 'service' | 'driver' | 'passenger' | 'other';
export type DisputeStatus = 'open' | 'under_review' | 'awaiting_response' | 'resolved' | 'closed' | 'escalated';

/**
 * Dispute interface
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
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  disputed_user_name?: string;
  messages?: DisputeMessage[];
  message_count?: number;
}

/**
 * Dispute message interface
 */
export interface DisputeMessage {
  id: string;
  dispute_id: string;
  user_id: string | null;
  message: string;
  is_admin: boolean;
  created_at: string;
  user_name?: string;
}

/**
 * Create dispute payload
 */
export interface CreateDisputePayload {
  dispute_type: DisputeType;
  reason: string;
  description?: string;
  transaction_id?: string;
  disputed_user_id?: string;
  evidence_urls?: string[];
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

/**
 * Get user's disputes
 */
export async function getDisputes(status?: DisputeStatus): Promise<Dispute[]> {
  const params = status ? { status } : {};
  const response = await api.get<ApiResponse<Dispute[]>>('/disputes', { params });

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to get disputes');
}

/**
 * Get dispute by ID
 */
export async function getDisputeById(id: string): Promise<Dispute> {
  const response = await api.get<ApiResponse<Dispute>>(`/disputes/${id}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to get dispute');
}

/**
 * Create a new dispute
 */
export async function createDispute(data: CreateDisputePayload): Promise<Dispute> {
  const response = await api.post<ApiResponse<Dispute>>('/disputes', data);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to create dispute');
}

/**
 * Add message to dispute
 */
export async function addMessage(disputeId: string, message: string): Promise<DisputeMessage> {
  const response = await api.post<ApiResponse<DisputeMessage>>(
    `/disputes/${disputeId}/messages`,
    { message }
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to add message');
}

/**
 * Get messages for a dispute
 */
export async function getDisputeMessages(disputeId: string): Promise<DisputeMessage[]> {
  const response = await api.get<ApiResponse<DisputeMessage[]>>(`/disputes/${disputeId}/messages`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to get messages');
}

/**
 * Close a dispute
 */
export async function closeDispute(disputeId: string): Promise<Dispute> {
  const response = await api.post<ApiResponse<Dispute>>(`/disputes/${disputeId}/close`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to close dispute');
}

/**
 * Escalate a dispute
 */
export async function escalateDispute(disputeId: string): Promise<Dispute> {
  const response = await api.post<ApiResponse<Dispute>>(`/disputes/${disputeId}/escalate`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to escalate dispute');
}

/**
 * Get dispute statistics
 */
export async function getDisputeStatistics(): Promise<DisputeStatistics> {
  const response = await api.get<ApiResponse<DisputeStatistics>>('/disputes/statistics');

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to get statistics');
}

/**
 * Dispute type labels
 */
export const DISPUTE_TYPE_LABELS: Record<DisputeType, string> = {
  payment: 'Payment Issue',
  ride: 'Ride Issue',
  service: 'Service Quality',
  driver: 'Driver Complaint',
  passenger: 'Passenger Complaint',
  other: 'Other',
};

/**
 * Dispute status labels
 */
export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  open: 'Open',
  under_review: 'Under Review',
  awaiting_response: 'Awaiting Response',
  resolved: 'Resolved',
  closed: 'Closed',
  escalated: 'Escalated',
};

/**
 * Get status color classes
 */
export function getStatusColor(status: DisputeStatus): string {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'awaiting_response':
      return 'bg-orange-100 text-orange-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    case 'escalated':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
