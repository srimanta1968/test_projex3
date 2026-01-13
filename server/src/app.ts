import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import tripHistoryRoutes from './routes/tripHistoryRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import tripRoutes from './routes/tripRoutes';
import matchingRoutes from './routes/matchingRoutes';
import notificationRoutes from './routes/notificationRoutes';
import paymentRoutes from './routes/paymentRoutes';
import billingRoutes from './routes/billingRoutes';
import refundRoutes from './routes/refundRoutes';
import disputeRoutes from './routes/disputeRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(morgan(config.logFormat));
app.use(express.json({ limit: config.bodyLimit }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/trip-history', tripHistoryRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/disputes', disputeRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
