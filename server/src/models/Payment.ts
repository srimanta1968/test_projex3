/**
 * Payment Method entity - matches database schema
 */
export interface PaymentMethod {
  id: string;
  user_id: string | null;
  card_number: number | null;
  expiry_date: Date | null;
  cardholder_name: string | null;
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
 * Refund entity - matches database schema
 */
export interface Refund {
  id: string;
  transaction_id: string | null;
  user_id: string | null;
  amount: number | null;
  status: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Transaction status enum
 */
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

/**
 * Refund status enum
 */
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed';

/**
 * Create payment method DTO (masked for security)
 */
export interface CreatePaymentMethodDTO {
  card_last_four: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
  card_type?: string;
}

/**
 * Create transaction DTO
 */
export interface CreateTransactionDTO {
  amount: number;
  ride_id?: string;
  payment_method_id?: string;
  description?: string;
}

/**
 * Create refund DTO
 */
export interface CreateRefundDTO {
  transaction_id: string;
  amount: number;
  reason?: string;
}

/**
 * Payment method response (masked)
 */
export interface PaymentMethodResponseDTO {
  id: string;
  card_last_four: string;
  expiry_date: string;
  cardholder_name: string;
  created_at: Date;
}

/**
 * Transaction response
 */
export interface TransactionResponseDTO {
  id: string;
  user_id: string;
  amount: number;
  transaction_date: Date;
  status: TransactionStatus;
  created_at: Date;
}

/**
 * Refund response
 */
export interface RefundResponseDTO {
  id: string;
  transaction_id: string;
  amount: number;
  status: RefundStatus;
  created_at: Date;
}

/**
 * Convert payment method to response DTO (mask card number)
 */
export function toPaymentMethodResponse(pm: PaymentMethod): PaymentMethodResponseDTO {
  const cardStr = pm.card_number?.toString() || '0000';
  return {
    id: pm.id,
    card_last_four: cardStr.slice(-4).padStart(4, '0'),
    expiry_date: pm.expiry_date ? pm.expiry_date.toISOString().slice(0, 7) : '',
    cardholder_name: pm.cardholder_name || '',
    created_at: pm.created_at,
  };
}

/**
 * Convert transaction to response DTO
 */
export function toTransactionResponse(tx: Transaction): TransactionResponseDTO {
  return {
    id: tx.id,
    user_id: tx.user_id || '',
    amount: tx.amount || 0,
    transaction_date: tx.transaction_date || tx.created_at,
    status: (tx.status as TransactionStatus) || 'pending',
    created_at: tx.created_at,
  };
}

/**
 * Convert refund to response DTO
 */
export function toRefundResponse(refund: Refund): RefundResponseDTO {
  return {
    id: refund.id,
    transaction_id: refund.transaction_id || '',
    amount: refund.amount || 0,
    status: (refund.status as RefundStatus) || 'pending',
    created_at: refund.created_at,
  };
}
