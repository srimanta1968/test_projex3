import { useEffect, useState, useCallback, useRef } from 'react';
import {
  websocketService,
  WebSocketEventType,
  WebSocketMessage,
  ConnectionState,
} from '../services/websocketService';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for WebSocket connection and event handling
 */
export function useWebSocket() {
  const { token, isAuthenticated } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    websocketService.getConnectionState()
  );
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (isAuthenticated && token) {
      websocketService.connect(token);

      // Update connection state periodically
      const interval = setInterval(() => {
        setConnectionState(websocketService.getConnectionState());
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    } else {
      websocketService.disconnect();
      setConnectionState(ConnectionState.DISCONNECTED);
    }
  }, [isAuthenticated, token]);

  // Global message handler to track last message
  useEffect(() => {
    const unsubscribe = websocketService.onAll((message) => {
      setLastMessage(message);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const subscribe = useCallback(
    (eventType: WebSocketEventType, handler: (message: WebSocketMessage) => void) => {
      return websocketService.on(eventType, handler);
    },
    []
  );

  const subscribeAll = useCallback((handler: (message: WebSocketMessage) => void) => {
    return websocketService.onAll(handler);
  }, []);

  const isConnected = websocketService.isConnected();
  const isWsAuthenticated = websocketService.isAuthenticated();

  return {
    connectionState,
    lastMessage,
    isConnected,
    isAuthenticated: isWsAuthenticated,
    subscribe,
    subscribeAll,
  };
}

/**
 * Custom hook for subscribing to specific WebSocket events
 */
export function useWebSocketEvent<T = Record<string, unknown>>(
  eventType: WebSocketEventType,
  handler: (payload: T, message: WebSocketMessage) => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = websocketService.on(eventType, (message) => {
      handlerRef.current(message.payload as T, message);
    });

    return () => {
      unsubscribe();
    };
  }, [eventType]);
}

/**
 * Custom hook for real-time notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    const unsubscribe = websocketService.on(WebSocketEventType.NOTIFICATION, (message) => {
      setNotifications((prev) => [message, ...prev].slice(0, 50)); // Keep last 50
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    notifications,
    clearNotifications,
    removeNotification,
  };
}

/**
 * Custom hook for ride-related real-time updates
 */
export function useRideUpdates() {
  const [newOffers, setNewOffers] = useState<WebSocketMessage[]>([]);
  const [newRequests, setNewRequests] = useState<WebSocketMessage[]>([]);
  const [matchUpdates, setMatchUpdates] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    const unsubscribeOffer = websocketService.on(WebSocketEventType.NEW_RIDE_OFFER, (message) => {
      setNewOffers((prev) => [message, ...prev].slice(0, 20));
    });

    const unsubscribeRequest = websocketService.on(WebSocketEventType.NEW_RIDE_REQUEST, (message) => {
      setNewRequests((prev) => [message, ...prev].slice(0, 20));
    });

    const unsubscribeMatchCreated = websocketService.on(WebSocketEventType.MATCH_CREATED, (message) => {
      setMatchUpdates((prev) => [message, ...prev].slice(0, 20));
    });

    const unsubscribeMatchAccepted = websocketService.on(WebSocketEventType.MATCH_ACCEPTED, (message) => {
      setMatchUpdates((prev) => [message, ...prev].slice(0, 20));
    });

    const unsubscribeMatchCompleted = websocketService.on(WebSocketEventType.MATCH_COMPLETED, (message) => {
      setMatchUpdates((prev) => [message, ...prev].slice(0, 20));
    });

    return () => {
      unsubscribeOffer();
      unsubscribeRequest();
      unsubscribeMatchCreated();
      unsubscribeMatchAccepted();
      unsubscribeMatchCompleted();
    };
  }, []);

  const clearOffers = useCallback(() => setNewOffers([]), []);
  const clearRequests = useCallback(() => setNewRequests([]), []);
  const clearMatches = useCallback(() => setMatchUpdates([]), []);

  return {
    newOffers,
    newRequests,
    matchUpdates,
    clearOffers,
    clearRequests,
    clearMatches,
  };
}
