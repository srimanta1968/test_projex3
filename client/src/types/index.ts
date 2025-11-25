/**
 * User type - matches server UserResponseDTO
 */
export interface User {
  id: string;
  name: string | null;
  email: string;
  preferences: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Auth response from server
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
  };
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

/**
 * Dashboard statistics
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
 * Ride offer
 */
export interface RideOffer {
  id: string;
  user_id: string;
  pickup_location: string | null;
  dropoff_location: string | null;
  available_seats: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Ride request
 */
export interface RideRequest {
  id: string;
  user_id: string;
  offer_id: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Activity item
 */
export interface ActivityItem {
  id: string;
  type: 'ride_offer' | 'ride_request' | 'match' | 'transaction';
  description: string;
  timestamp: string;
}

/**
 * Dashboard data
 */
export interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  myOffers: RideOffer[];
  myRequests: RideRequest[];
}
