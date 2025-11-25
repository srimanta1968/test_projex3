import api from './api';
import {
  ApiResponse,
  DashboardData,
  DashboardStats,
  RideOffer,
  RideRequest,
  ActivityItem,
} from '../types';

/**
 * Get complete dashboard data
 */
export async function getDashboardData(): Promise<DashboardData> {
  const response = await api.get<ApiResponse<DashboardData>>('/dashboard');

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to get dashboard data');
}

/**
 * Get dashboard statistics only
 */
export async function getStats(): Promise<DashboardStats> {
  const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to get stats');
}

/**
 * Get recent activity
 */
export async function getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
  const response = await api.get<ApiResponse<ActivityItem[]>>(`/dashboard/activity?limit=${limit}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to get activity');
}

/**
 * Get user's ride offers
 */
export async function getMyOffers(limit: number = 10): Promise<RideOffer[]> {
  const response = await api.get<ApiResponse<RideOffer[]>>(`/dashboard/offers?limit=${limit}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to get offers');
}

/**
 * Get user's ride requests
 */
export async function getMyRequests(limit: number = 10): Promise<RideRequest[]> {
  const response = await api.get<ApiResponse<RideRequest[]>>(`/dashboard/requests?limit=${limit}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || 'Failed to get requests');
}

export default {
  getDashboardData,
  getStats,
  getRecentActivity,
  getMyOffers,
  getMyRequests,
};
