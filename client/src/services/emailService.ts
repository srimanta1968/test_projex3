import api from './api';
import { ApiResponse } from '../types';

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<{ userId: string; email: string }> {
  const response = await api.post<ApiResponse<{ userId: string; email: string }>>('/email/verify', {
    token,
  });
  if (!response.data.data) {
    throw new Error('Verification failed');
  }
  return response.data.data;
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(): Promise<{ expires: string }> {
  const response = await api.post<ApiResponse<{ expires: string }>>('/email/resend-verification');
  if (!response.data.data) {
    throw new Error('Failed to resend verification email');
  }
  return response.data.data;
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await api.post('/email/forgot-password', { email });
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post('/email/reset-password', { token, password });
}

/**
 * Check email verification status
 */
export async function getVerificationStatus(): Promise<boolean> {
  const response = await api.get<ApiResponse<{ email_verified: boolean }>>('/email/verification-status');
  return response.data.data?.email_verified ?? false;
}

export default {
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  getVerificationStatus,
};
