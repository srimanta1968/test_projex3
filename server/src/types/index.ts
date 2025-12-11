export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  email_verified: boolean;
  email_verification_token: string | null;
  email_verification_expires: Date | null;
  phone_verified: boolean;
  phone_verification_code: string | null;
  phone_verification_expires: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  user_id: string;
  profile_picture: string | null;
  bio: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | { fields: Record<string, string> };
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface SendVerificationEmailRequest {
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface SendPhoneVerificationRequest {
  phone: string;
}

export interface VerifyPhoneRequest {
  phone: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  email_verified: boolean;
  phone_verified: boolean;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
