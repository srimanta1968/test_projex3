import { Server as HTTPServer } from 'http';
import { WebSocket, WebSocketServer as WSServer } from 'ws';
import { verify } from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * WebSocket event types for real-time updates
 */
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

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: Record<string, unknown>;
  timestamp: string;
  targetUserId?: string;
}

/**
 * Extended WebSocket with user information
 */
interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive: boolean;
}

/**
 * JWT payload structure
 */
interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * WebSocket Server for real-time updates
 */
class WebSocketServerInstance {
  private wss: WSServer | null = null;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server attached to HTTP server
   */
  initialize(server: HTTPServer): void {
    this.wss = new WSServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
      ws.isAlive = true;
      logger.info('New WebSocket connection established');

      // Send welcome message
      this.sendToSocket(ws, {
        type: WebSocketEventType.CONNECTED,
        payload: { message: 'Connected to Quick Taxi WebSocket server' },
        timestamp: new Date().toISOString(),
      });

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        this.handleMessage(ws, data);
      });

      // Handle pong responses for heartbeat
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle close
      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
        this.handleDisconnect(ws);
      });
    });

    // Start heartbeat to detect dead connections
    this.startHeartbeat();

    logger.info('WebSocket server initialized on /ws');
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(ws: AuthenticatedWebSocket, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());

      // Handle authentication message
      if (message.type === 'authenticate') {
        this.authenticateClient(ws, message.token);
        return;
      }

      // For other messages, ensure client is authenticated
      if (!ws.userId) {
        this.sendToSocket(ws, {
          type: WebSocketEventType.ERROR,
          payload: { message: 'Not authenticated. Send authentication token first.' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Handle ping/pong for client-side heartbeat
      if (message.type === 'ping') {
        this.sendToSocket(ws, {
          type: WebSocketEventType.NOTIFICATION,
          payload: { type: 'pong' },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('Error parsing WebSocket message:', error);
      this.sendToSocket(ws, {
        type: WebSocketEventType.ERROR,
        payload: { message: 'Invalid message format' },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Authenticate WebSocket client using JWT
   */
  private authenticateClient(ws: AuthenticatedWebSocket, token: string): void {
    try {
      const decoded = verify(token, env.JWT_SECRET) as JwtPayload;
      ws.userId = decoded.userId;

      // Add to clients map
      if (!this.clients.has(decoded.userId)) {
        this.clients.set(decoded.userId, new Set());
      }
      this.clients.get(decoded.userId)!.add(ws);

      this.sendToSocket(ws, {
        type: WebSocketEventType.AUTHENTICATED,
        payload: {
          message: 'Authentication successful',
          userId: decoded.userId,
        },
        timestamp: new Date().toISOString(),
      });

      logger.info(`WebSocket client authenticated: ${decoded.userId}`);
    } catch (error) {
      logger.error('WebSocket authentication failed:', error);
      this.sendToSocket(ws, {
        type: WebSocketEventType.ERROR,
        payload: { message: 'Authentication failed. Invalid token.' },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(ws: AuthenticatedWebSocket): void {
    if (ws.userId) {
      const userSockets = this.clients.get(ws.userId);
      if (userSockets) {
        userSockets.delete(ws);
        if (userSockets.size === 0) {
          this.clients.delete(ws.userId);
        }
      }
      logger.info(`WebSocket client disconnected: ${ws.userId}`);
    }
  }

  /**
   * Start heartbeat interval to detect dead connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.wss?.clients.forEach((ws) => {
        const authWs = ws as AuthenticatedWebSocket;
        if (!authWs.isAlive) {
          this.handleDisconnect(authWs);
          return authWs.terminate();
        }
        authWs.isAlive = false;
        authWs.ping();
      });
    }, 30000); // 30 second heartbeat
  }

  /**
   * Send message to a specific socket
   */
  private sendToSocket(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send message to a specific user (all their connected clients)
   */
  sendToUser(userId: string, message: Omit<WebSocketMessage, 'timestamp'>): void {
    const userSockets = this.clients.get(userId);
    if (userSockets) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString(),
      };
      userSockets.forEach((ws) => {
        this.sendToSocket(ws, fullMessage);
      });
    }
  }

  /**
   * Send message to multiple users
   */
  sendToUsers(userIds: string[], message: Omit<WebSocketMessage, 'timestamp'>): void {
    userIds.forEach((userId) => this.sendToUser(userId, message));
  }

  /**
   * Broadcast message to all connected and authenticated clients
   */
  broadcast(message: Omit<WebSocketMessage, 'timestamp'>): void {
    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    };

    this.clients.forEach((sockets) => {
      sockets.forEach((ws) => {
        this.sendToSocket(ws, fullMessage);
      });
    });
  }

  /**
   * Get count of connected clients
   */
  getConnectedClientCount(): number {
    let count = 0;
    this.clients.forEach((sockets) => {
      count += sockets.size;
    });
    return count;
  }

  /**
   * Get count of authenticated users
   */
  getAuthenticatedUserCount(): number {
    return this.clients.size;
  }

  /**
   * Check if a user is currently connected
   */
  isUserConnected(userId: string): boolean {
    return this.clients.has(userId) && this.clients.get(userId)!.size > 0;
  }

  /**
   * Cleanup and close WebSocket server
   */
  close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss?.close();
    this.clients.clear();
    logger.info('WebSocket server closed');
  }

  // ============================================
  // Convenience methods for specific event types
  // ============================================

  /**
   * Notify about new ride offer
   */
  notifyNewRideOffer(offer: Record<string, unknown>): void {
    this.broadcast({
      type: WebSocketEventType.NEW_RIDE_OFFER,
      payload: offer,
    });
  }

  /**
   * Notify about ride offer update
   */
  notifyRideOfferUpdate(driverId: string, offer: Record<string, unknown>): void {
    this.sendToUser(driverId, {
      type: WebSocketEventType.RIDE_OFFER_UPDATED,
      payload: offer,
    });
  }

  /**
   * Notify about new ride request (to matching drivers)
   */
  notifyNewRideRequest(driverIds: string[], request: Record<string, unknown>): void {
    this.sendToUsers(driverIds, {
      type: WebSocketEventType.NEW_RIDE_REQUEST,
      payload: request,
    });
  }

  /**
   * Notify rider about request update
   */
  notifyRideRequestUpdate(riderId: string, request: Record<string, unknown>): void {
    this.sendToUser(riderId, {
      type: WebSocketEventType.RIDE_REQUEST_UPDATED,
      payload: request,
    });
  }

  /**
   * Notify about new match
   */
  notifyMatchCreated(riderId: string, driverId: string, match: Record<string, unknown>): void {
    this.sendToUsers([riderId, driverId], {
      type: WebSocketEventType.MATCH_CREATED,
      payload: match,
    });
  }

  /**
   * Notify about match acceptance
   */
  notifyMatchAccepted(riderId: string, driverId: string, match: Record<string, unknown>): void {
    this.sendToUsers([riderId, driverId], {
      type: WebSocketEventType.MATCH_ACCEPTED,
      payload: match,
    });
  }

  /**
   * Notify about match completion
   */
  notifyMatchCompleted(riderId: string, driverId: string, match: Record<string, unknown>): void {
    this.sendToUsers([riderId, driverId], {
      type: WebSocketEventType.MATCH_COMPLETED,
      payload: match,
    });
  }

  /**
   * Notify about match cancellation
   */
  notifyMatchCancelled(riderId: string, driverId: string, match: Record<string, unknown>): void {
    this.sendToUsers([riderId, driverId], {
      type: WebSocketEventType.MATCH_CANCELLED,
      payload: match,
    });
  }

  /**
   * Notify about payment
   */
  notifyPaymentReceived(userId: string, payment: Record<string, unknown>): void {
    this.sendToUser(userId, {
      type: WebSocketEventType.PAYMENT_RECEIVED,
      payload: payment,
    });
  }

  /**
   * Notify about transaction update
   */
  notifyTransactionUpdate(userId: string, transaction: Record<string, unknown>): void {
    this.sendToUser(userId, {
      type: WebSocketEventType.TRANSACTION_UPDATED,
      payload: transaction,
    });
  }

  /**
   * Send a general notification to user
   */
  notifyUser(userId: string, title: string, message: string, data?: Record<string, unknown>): void {
    this.sendToUser(userId, {
      type: WebSocketEventType.NOTIFICATION,
      payload: {
        title,
        message,
        ...data,
      },
    });
  }
}

// Export singleton instance
export const webSocketServer = new WebSocketServerInstance();
