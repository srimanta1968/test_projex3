import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Refund {
  id: string;
  refund_id: string;
  payment_id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  created_at: string;
}

interface Payment {
  id: string;
  payment_id: string;
  amount: number;
  payment_status: string;
  created_at: string;
}

/**
 * Refunds component for managing refund requests
 */
export default function Refunds() {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [selectedPayment, setSelectedPayment] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  /**
   * Fetch refunds and payments
   */
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch refunds and payments in parallel
      const [refundsRes, paymentsRes] = await Promise.all([
        fetch('/api/refunds', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/payments', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      const refundsData = await refundsRes.json();
      const paymentsData = await paymentsRes.json();

      if (refundsData.success) {
        setRefunds(refundsData.data.refunds);
      }

      if (paymentsData.success) {
        // Filter to only show completed payments that can be refunded
        const refundablePayments = paymentsData.data.payments.filter(
          (p: Payment) => p.payment_status === 'completed'
        );
        setPayments(refundablePayments);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle refund request submission
   */
  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedPayment) {
      setError('Please select a payment to refund');
      return;
    }

    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      setError('Please enter a valid refund amount');
      return;
    }

    if (!refundReason.trim()) {
      setError('Please provide a reason for the refund');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: selectedPayment,
          amount: parseFloat(refundAmount),
          reason: refundReason.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Refund request submitted successfully!');
        setSelectedPayment('');
        setRefundAmount('');
        setRefundReason('');
        fetchData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Failed to submit refund request');
      }
    } catch (err) {
      setError('Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status: Refund['status']): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Handle payment selection change
   */
  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayment(paymentId);
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      setRefundAmount(payment.amount.toString());
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading refunds...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Refund Requests</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Request Refund Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Request a Refund</h2>

        {payments.length === 0 ? (
          <p className="text-gray-500">No completed payments available for refund.</p>
        ) : (
          <form onSubmit={handleSubmitRefund} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Select Payment</label>
              <select
                value={selectedPayment}
                onChange={(e) => handlePaymentSelect(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Select a payment --</option>
                {payments.map((payment) => (
                  <option key={payment.id} value={payment.id}>
                    {formatCurrency(payment.amount)} - {formatDate(payment.created_at)} (
                    {payment.payment_id.substring(0, 8)}...)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Refund Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Reason for Refund</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Please explain why you are requesting a refund..."
                rows={3}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Refund Request'}
            </button>
          </form>
        )}
      </div>

      {/* Refund History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Refund History ({refunds.length})
        </h2>

        {refunds.length === 0 ? (
          <p className="text-gray-500">No refund requests yet.</p>
        ) : (
          <div className="space-y-4">
            {refunds.map((refund) => (
              <div
                key={refund.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">
                      {formatCurrency(refund.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      ID: {refund.refund_id.substring(0, 8)}...
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(refund.created_at)}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      Reason: {refund.reason}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      refund.status
                    )}`}
                  >
                    {refund.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
