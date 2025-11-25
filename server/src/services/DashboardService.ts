import { query } from '../config/database';
import {
  DashboardStats,
  DashboardDataDTO,
  RideOffer,
  RideRequest,
  ActivityItem,
} from '../models/Dashboard';
import { logger } from '../utils/logger';

/**
 * Dashboard service - handles dashboard data and statistics
 */
export class DashboardService {
  /**
   * Get dashboard statistics for a user
   * @param userId - User ID
   * @returns Dashboard statistics
   */
  async getStats(userId: string): Promise<DashboardStats> {
    // Get ride offers count
    const offersResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM ride_offers WHERE user_id = $1',
      [userId]
    );

    // Get ride requests count
    const requestsResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM ride_requests WHERE user_id = $1',
      [userId]
    );

    // Get active matches count
    const matchesResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM matched_rides
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    // Get pending requests count
    const pendingResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM ride_requests
       WHERE user_id = $1 AND status = 'pending'`,
      [userId]
    );

    // Get transactions count and total
    const transactionsResult = await query<{ count: string; total: string }>(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
       FROM transactions WHERE user_id = $1`,
      [userId]
    );

    return {
      totalRideOffers: parseInt(offersResult.rows[0].count, 10),
      totalRideRequests: parseInt(requestsResult.rows[0].count, 10),
      activeMatches: parseInt(matchesResult.rows[0].count, 10),
      pendingRequests: parseInt(pendingResult.rows[0].count, 10),
      totalTransactions: parseInt(transactionsResult.rows[0].count, 10),
      totalSpent: parseFloat(transactionsResult.rows[0].total),
    };
  }

  /**
   * Get user's ride offers
   * @param userId - User ID
   * @param limit - Max number of results
   * @returns Array of ride offers
   */
  async getMyOffers(userId: string, limit: number = 10): Promise<RideOffer[]> {
    const result = await query<RideOffer>(
      `SELECT * FROM ride_offers
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  /**
   * Get user's ride requests
   * @param userId - User ID
   * @param limit - Max number of results
   * @returns Array of ride requests
   */
  async getMyRequests(userId: string, limit: number = 10): Promise<RideRequest[]> {
    const result = await query<RideRequest>(
      `SELECT * FROM ride_requests
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  /**
   * Get recent activity for user dashboard
   * @param userId - User ID
   * @param limit - Max number of items
   * @returns Array of activity items
   */
  async getRecentActivity(userId: string, limit: number = 10): Promise<ActivityItem[]> {
    const activities: ActivityItem[] = [];

    // Get recent ride offers
    const offers = await query<RideOffer>(
      `SELECT * FROM ride_offers WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, Math.ceil(limit / 4)]
    );

    offers.rows.forEach((offer) => {
      activities.push({
        id: offer.id,
        type: 'ride_offer',
        description: `Created ride offer: ${offer.pickup_location} to ${offer.dropoff_location}`,
        timestamp: offer.created_at,
      });
    });

    // Get recent ride requests
    const requests = await query<RideRequest>(
      `SELECT * FROM ride_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, Math.ceil(limit / 4)]
    );

    requests.rows.forEach((request) => {
      activities.push({
        id: request.id,
        type: 'ride_request',
        description: `Ride request ${request.status || 'created'}`,
        timestamp: request.created_at,
      });
    });

    // Sort by timestamp descending and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get complete dashboard data for user
   * @param userId - User ID
   * @returns Complete dashboard data
   */
  async getDashboardData(userId: string): Promise<DashboardDataDTO> {
    logger.info('Fetching dashboard data', { userId });

    const [stats, recentActivity, myOffers, myRequests] = await Promise.all([
      this.getStats(userId),
      this.getRecentActivity(userId),
      this.getMyOffers(userId),
      this.getMyRequests(userId),
    ]);

    return {
      stats,
      recentActivity,
      myOffers,
      myRequests,
    };
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;
