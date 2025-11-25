import api from './api';

// Types
export interface PaymentMethod {
  id: string;
  card_last_four: string;
  expiry_date: string;
  cardholder_name: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_date: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
}

export interface Refund {
  id: string;
  transaction_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  created_at: string;
}

export interface CreatePaymentMethodData {
  card_last_four: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
}

export interface CreateTransactionData {
  amount: number;
}

export interface CreateRefundData {
  transaction_id: string;
  amount: number;
  reason?: string;
}

// Payment Methods
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get('/payments/methods');
  return response.data.data;
};

export const getPaymentMethodById = async (methodId: string): Promise<PaymentMethod> => {
  const response = await api.get(`/payments/methods/${methodId}`);
  return response.data.data;
};

export const addPaymentMethod = async (data: CreatePaymentMethodData): Promise<PaymentMethod> => {
  const response = await api.post('/payments/methods', data);
  return response.data.data;
};

export const deletePaymentMethod = async (methodId: string): Promise<void> => {
  await api.delete(`/payments/methods/${methodId}`);
};

// Transactions
export const getTransactions = async (limit = 20): Promise<Transaction[]> => {
  const response = await api.get(`/payments/transactions?limit=${limit}`);
  return response.data.data;
};

export const getTransactionById = async (transactionId: string): Promise<Transaction> => {
  const response = await api.get(`/payments/transactions/${transactionId}`);
  return response.data.data;
};

export const createTransaction = async (data: CreateTransactionData): Promise<Transaction> => {
  const response = await api.post('/payments/transactions', data);
  return response.data.data;
};

export const processPayment = async (transactionId: string): Promise<Transaction> => {
  const response = await api.post(`/payments/transactions/${transactionId}/process`);
  return response.data.data;
};

// Refunds
export const getRefunds = async (limit = 20): Promise<Refund[]> => {
  const response = await api.get(`/payments/refunds?limit=${limit}`);
  return response.data.data;
};

export const getRefundById = async (refundId: string): Promise<Refund> => {
  const response = await api.get(`/payments/refunds/${refundId}`);
  return response.data.data;
};

export const requestRefund = async (data: CreateRefundData): Promise<Refund> => {
  const response = await api.post('/payments/refunds', data);
  return response.data.data;
};
