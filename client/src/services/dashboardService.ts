import api from './api';
import { DashboardOverview } from '../types';

/**
 * Dashboard service
 */
export const dashboardService = {
  /**
   * Get dashboard overview
   */
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get<{ status: string; data: DashboardOverview }>('/dashboard/overview');
    return response.data.data;
  },
};
