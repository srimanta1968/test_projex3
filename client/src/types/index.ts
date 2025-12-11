export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  fields?: Record<string, string>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface RideRequestFormData {
  pickupLocation: string;
  dropoffLocation: string;
  scheduledTime?: string;
  notes?: string;
}

export interface Ride {
  id: string;
  userId: string;
  driverId?: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: RideStatus;
  scheduledTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type RideStatus =
  | 'pending'
  | 'accepted'
  | 'driver_assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Driver {
  id: string;
  name: string;
  licenseNumber: number;
  vehicleDetails: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RideResponse {
  success: boolean;
  data?: Ride;
  error?: string;
}

export type PartnerCategory =
  | 'restaurant'
  | 'hotel'
  | 'healthcare'
  | 'education'
  | 'retail'
  | 'entertainment'
  | 'corporate';

export type PartnerStatus = 'prospect' | 'active' | 'inactive';

export type PartnerTier = 'gold' | 'silver' | 'bronze';

export interface Partnership {
  id: string;
  businessName: string;
  contactInfo: string;
  promotionDetails: string;
  category?: PartnerCategory;
  status?: PartnerStatus;
  tier?: PartnerTier;
  createdAt: string;
  updatedAt: string;
}
