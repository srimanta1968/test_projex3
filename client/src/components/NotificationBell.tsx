import { useState, useEffect } from 'react';
import { useWebSocket, useNotifications, useRideUpdates } from '../hooks/useWebSocket';
import { WebSocketEventType, WebSocketMessage } from '../services/websocketService';

/**
 * Notification Bell component with real-time updates
 */
export function NotificationBell() {
  const { connectionState, isConnected, isAuthenticated } = useWebSocket();
  const { notifications, clearNotifications, removeNotification } = useNotifications();
  const { newOffers, newRequests, matchUpdates, clearOffers, clearRequests, clearMatches } = useRideUpdates();
  const [showDropdown, setShowDropdown] = useState(false);

  // Total unread count
  const totalCount = notifications.length + newOffers.length + newRequests.length + matchUpdates.length;

  // Connection status indicator
  const getStatusColor = () => {
    if (isAuthenticated) return 'bg-green-500';
    if (isConnected) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (isAuthenticated) return 'Connected';
    if (isConnected) return 'Connecting...';
    return 'Disconnected';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: WebSocketEventType) => {
    switch (type) {
      case WebSocketEventType.NEW_RIDE_OFFER:
        return '🚗';
      case WebSocketEventType.NEW_RIDE_REQUEST:
        return '📍';
      case WebSocketEventType.MATCH_CREATED:
      case WebSocketEventType.MATCH_ACCEPTED:
        return '🤝';
      case WebSocketEventType.MATCH_COMPLETED:
        return '✅';
      case WebSocketEventType.PAYMENT_RECEIVED:
        return '💰';
      case WebSocketEventType.NOTIFICATION:
        return '🔔';
      default:
        return '📢';
    }
  };

  const getNotificationTitle = (message: WebSocketMessage) => {
    const payload = message.payload as Record<string, unknown>;
    switch (message.type) {
      case WebSocketEventType.NEW_RIDE_OFFER:
        return 'New Ride Offer';
      case WebSocketEventType.NEW_RIDE_REQUEST:
        return 'New Ride Request';
      case WebSocketEventType.MATCH_CREATED:
        return 'Match Created';
      case WebSocketEventType.MATCH_ACCEPTED:
        return 'Match Accepted';
      case WebSocketEventType.MATCH_COMPLETED:
        return 'Ride Completed';
      case WebSocketEventType.NOTIFICATION:
        return (payload.title as string) || 'Notification';
      default:
        return 'Update';
    }
  };

  const getNotificationBody = (message: WebSocketMessage) => {
    const payload = message.payload as Record<string, unknown>;
    switch (message.type) {
      case WebSocketEventType.NEW_RIDE_OFFER:
        return `${payload.pickup_location || 'Unknown'} to ${payload.dropoff_location || 'Unknown'}`;
      case WebSocketEventType.NEW_RIDE_REQUEST:
        return `From ${payload.pickup_location || 'Unknown'}`;
      case WebSocketEventType.NOTIFICATION:
        return (payload.message as string) || '';
      default:
        return '';
    }
  };

  const clearAll = () => {
    clearNotifications();
    clearOffers();
    clearRequests();
    clearMatches();
    setShowDropdown(false);
  };

  // All combined messages sorted by time
  const allMessages = [
    ...notifications,
    ...newOffers,
    ...newRequests,
    ...matchUpdates,
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        title={getStatusText()}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Count Badge */}
        {totalCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}

        {/* Connection Status Dot */}
        <span
          className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white ${getStatusColor()}`}
        />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-block h-2 w-2 rounded-full ${getStatusColor()}`} />
              <span className="text-xs text-gray-500">{getStatusText()}</span>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {allMessages.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="mt-2 text-sm">No notifications yet</p>
              </div>
            ) : (
              allMessages.slice(0, 20).map((message, index) => (
                <div
                  key={`${message.type}-${message.timestamp}-${index}`}
                  className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start">
                    <span className="text-xl mr-3">{getNotificationIcon(message.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getNotificationTitle(message)}
                      </p>
                      {getNotificationBody(message) && (
                        <p className="text-sm text-gray-500 truncate">
                          {getNotificationBody(message)}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {allMessages.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <button
                onClick={clearAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

export default NotificationBell;
