/**
 * WebSocket Service for Real-Time Updates
 * Handles connection, authentication, and message handling for real-time notifications
 */

// WebSocket event types matching server
export enum WebSocketEventType {
  // Connection events
  CONNECTED = 'connected',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error',

  // Ride offer events
  NEW_RIDE_OFFER = 'new_ride_offer',
  RIDE_OFFER_UPDATED = 'ride_offer_updated',
  RIDE_OFFER_CANCELLED = 'ride_offer_cancelled',

  // Ride request events
  NEW_RIDE_REQUEST = 'new_ride_request',
  RIDE_REQUEST_UPDATED = 'ride_request_updated',
  RIDE_REQUEST_CANCELLED = 'ride_request_cancelled',

  // Match events
  MATCH_CREATED = 'match_created',
  MATCH_ACCEPTED = 'match_accepted',
  MATCH_REJECTED = 'match_rejected',
  MATCH_COMPLETED = 'match_completed',
  MATCH_CANCELLED = 'match_cancelled',

  // Payment events
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_PROCESSED = 'payment_processed',

  // Transaction events
  TRANSACTION_CREATED = 'transaction_created',
  TRANSACTION_UPDATED = 'transaction_updated',

  // Notification events
  NOTIFICATION = 'notification',
}

// WebSocket message structure
export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: Record<string, unknown>;
  timestamp: string;
}

// Event handler type
type EventHandler = (message: WebSocketMessage) => void;

// Connection state
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error',
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private eventHandlers: Map<WebSocketEventType, Set<EventHandler>> = new Map();
  private globalHandlers: Set<EventHandler> = new Set();
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private heartbeatInterval: number | null = null;
  private url: string;

  constructor() {
    // Determine WebSocket URL based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_HOST || window.location.hostname;
    const port = import.meta.env.VITE_WS_PORT || '3000';
    this.url = `${protocol}//${host}:${port}/ws`;
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Connect to WebSocket server
   */
  connect(authToken: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.token = authToken;
    this.connectionState = ConnectionState.CONNECTING;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.connectionState = ConnectionState.CONNECTED;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        // Authenticate immediately after connection
        if (this.token) {
          this.authenticate(this.token);
        }

        // Start heartbeat
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.connectionState = ConnectionState.DISCONNECTED;
        this.stopHeartbeat();

        // Attempt reconnect if not intentionally closed
        if (event.code !== 1000 && this.token) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionState = ConnectionState.ERROR;
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connectionState = ConnectionState.ERROR;
    }
  }

  /**
   * Authenticate with the server using JWT token
   */
  private authenticate(token: string): void {
    this.send({ type: 'authenticate', token });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    // Update connection state on authentication
    if (message.type === WebSocketEventType.AUTHENTICATED) {
      this.connectionState = ConnectionState.AUTHENTICATED;
      console.log('WebSocket authenticated');
    }

    // Call specific event handlers
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }

    // Call global handlers
    this.globalHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in global handler:', error);
      }
    });
  }

  /**
   * Send a message to the server
   */
  private send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // 30 second heartbeat
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(`Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  /**
   * Subscribe to specific event type
   */
  on(eventType: WebSocketEventType, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Subscribe to all events
   */
  onAll(handler: EventHandler): () => void {
    this.globalHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  /**
   * Remove all handlers for an event type
   */
  off(eventType: WebSocketEventType): void {
    this.eventHandlers.delete(eventType);
  }

  /**
   * Remove all handlers
   */
  removeAllHandlers(): void {
    this.eventHandlers.clear();
    this.globalHandlers.clear();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    this.removeAllHandlers();
    this.token = null;
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect

    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }

    this.connectionState = ConnectionState.DISCONNECTED;
  }

  /**
   * Check if connected and authenticated
   */
  isAuthenticated(): boolean {
    return this.connectionState === ConnectionState.AUTHENTICATED;
  }

  /**
   * Check if connected (but not necessarily authenticated)
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
