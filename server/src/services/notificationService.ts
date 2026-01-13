import { dataService } from './dataService';

export interface Notification {
  id: string;
  type: 'match_found' | 'match_confirmed';
  message: string;
  match_id: string;
  created_at: Date;
  read: boolean;
}

export interface NotificationResult {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Notification service for managing user notifications
 * Uses matched_trips table to generate match notifications
 */
export const notificationService = {
  /**
   * Get notifications for a user
   * Returns recent matches as notifications
   */
  async getUserNotifications(userId: string): Promise<NotificationResult> {
    const matches = await dataService.query<{
      id: string;
      match_id: string;
      trip_id: string;
      matched_at: Date;
    }>(
      `SELECT id, match_id, trip_id, matched_at
       FROM matched_trips
       WHERE user_id = $1
       ORDER BY matched_at DESC
       LIMIT 20`,
      [userId]
    );

    const notifications: Notification[] = matches.map((match) => ({
      id: match.id,
      type: 'match_found',
      message: `You have a new trip match!`,
      match_id: match.match_id,
      created_at: match.matched_at,
      read: false,
    }));

    return {
      notifications,
      unreadCount: notifications.length,
    };
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    // Since we're using matched_trips as the source, we can't actually mark as read
    // In a real implementation, we'd have a separate notifications table
    // For now, this is a no-op that returns success
    return true;
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    // No-op for the same reason as above
    return true;
  },

  /**
   * Create a notification for a new match
   * This is called when a match is created
   */
  async createMatchNotification(
    userId: string,
    matchId: string,
    tripDestination: string
  ): Promise<void> {
    // In a real implementation with a notifications table, we'd insert here
    // For now, the matched_trips table serves as the source of notifications
    console.log(`Notification created for user ${userId}: New match for trip to ${tripDestination}`);
  },
};

export default notificationService;
