import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { verifyAccessToken } from '../utils/jwt';
import logger from '../utils/logger';

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocket>> = new Map();

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.initialize();
  }

  private initialize(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      try {
        // Extract token from query string
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token');

        if (!token) {
          ws.close(1008, 'Token required');
          return;
        }

        // Verify token
        const payload = verifyAccessToken(token);
        const userId = payload.userId;

        // Add client to user's set
        if (!this.clients.has(userId)) {
          this.clients.set(userId, new Set());
        }
        this.clients.get(userId)!.add(ws);

        logger.info('WebSocket connected', { userId });

        // Handle messages
        ws.on('message', (message: string) => {
          try {
            const data = JSON.parse(message.toString());
            logger.debug('WebSocket message', { userId, data });
          } catch (error) {
            logger.error('WebSocket message error', { error });
          }
        });

        // Handle disconnect
        ws.on('close', () => {
          this.clients.get(userId)?.delete(ws);
          if (this.clients.get(userId)?.size === 0) {
            this.clients.delete(userId);
          }
          logger.info('WebSocket disconnected', { userId });
        });

        // Send welcome message
        ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to Banking Portal' }));
      } catch (error) {
        logger.error('WebSocket connection error', { error });
        ws.close(1008, 'Authentication failed');
      }
    });
  }

  /**
   * Broadcast message to specific user
   */
  sendToUser(userId: string, message: any): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const messageStr = JSON.stringify(message);
      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: any): void {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(userClients => {
      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    });
  }
}
