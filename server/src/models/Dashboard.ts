/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
  totalRideOffers: number;
  totalRideRequests: number;
  activeMatches: number;
  pendingRequests: number;
  totalTransactions: number;
  totalSpent: number;
}

/**
 * Ride offer entity - matches database schema
 */
export interface RideOffer {
  id: string;
  user_id: string;
  pickup_location: string | null;
  dropoff_location: string | null;
  available_seats: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Ride request entity - matches database schema
 */
export interface RideRequest {
  id: string;
  user_id: string;
  offer_id: string | null;
  status: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Matched ride entity - matches database schema
 */
export interface MatchedRide {
  id: string;
  ride_offer_id: string | null;
  user_id: string | null;
  status: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Transaction entity - matches database schema
 */
export interface Transaction {
  id: string;
  user_id: string | null;
  amount: number | null;
  transaction_date: Date | null;
  status: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Recent activity item for dashboard
 */
export interface ActivityItem {
  id: string;
  type: 'ride_offer' | 'ride_request' | 'match' | 'transaction';
  description: string;
  timestamp: Date;
}

/**
 * Dashboard data response
 */
export interface DashboardDataDTO {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  myOffers: RideOffer[];
  myRequests: RideRequest[];
}
