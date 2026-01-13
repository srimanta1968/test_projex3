import { dataService } from './dataService';

export interface Notification {
  id: string;
  type: 'match_found' | 'match_confirmed' | 'refund_approved' | 'refund_rejected' | 'refund_processed' | 'refund_cancelled' | 'dispute_filed';
  message: string;
  match_id?: string;
  refund_id?: string;
  dispute_id?: string;
  amount?: number;
  status?: string;
  created_at: Date;
  read: boolean;
}

export interface RefundNotification {
  id: string;
  type: 'refund_approved' | 'refund_rejected' | 'refund_processed' | 'refund_cancelled';
  message: string;
  refund_id: string;
  amount: number;
  status: string;
  created_at: Date;
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

  /**
   * Get refund notifications for a user
   * Returns refunds with status changes (approved, rejected, processed, cancelled)
   */
  async getRefundNotifications(userId: string): Promise<{ notifications: RefundNotification[] }> {
    const refunds = await dataService.query<{
      id: string;
      refund_id: string;
      amount: number;
      status: string;
      updated_at: Date;
    }>(
      `SELECT id, refund_id, amount, status, updated_at
       FROM refunds
       WHERE user_id = $1 AND status IN ('approved', 'rejected', 'processed', 'cancelled')
       ORDER BY updated_at DESC
       LIMIT 20`,
      [userId]
    );

    const notifications: RefundNotification[] = refunds.map((refund) => {
      let message: string;
      let type: RefundNotification['type'];

      switch (refund.status) {
        case 'approved':
          type = 'refund_approved';
          message = `Your refund request for $${refund.amount.toFixed(2)} has been approved`;
          break;
        case 'rejected':
          type = 'refund_rejected';
          message = `Your refund request for $${refund.amount.toFixed(2)} has been rejected`;
          break;
        case 'processed':
          type = 'refund_processed';
          message = `Your refund of $${refund.amount.toFixed(2)} has been processed`;
          break;
        case 'cancelled':
          type = 'refund_cancelled';
          message = `Your refund request for $${refund.amount.toFixed(2)} has been cancelled`;
          break;
        default:
          type = 'refund_approved';
          message = `Refund status update: ${refund.status}`;
      }

      return {
        id: refund.id,
        type,
        message,
        refund_id: refund.refund_id,
        amount: refund.amount,
        status: refund.status,
        created_at: refund.updated_at,
      };
    });

    return { notifications };
  },

  /**
   * Create a refund status notification
   * This is called when refund status changes
   */
  async createRefundNotification(
    userId: string,
    refundId: string,
    amount: number,
    status: string
  ): Promise<void> {
    // In a real implementation with a notifications table, we'd insert here
    // For now, the refunds table status field serves as the notification source
    console.log(`Refund notification for user ${userId}: Refund ${refundId} is now ${status}`);
  },
};

export default notificationService;
