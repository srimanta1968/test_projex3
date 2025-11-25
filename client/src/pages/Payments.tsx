import { useState, useEffect } from 'react';
import {
  PaymentMethod,
  Transaction,
  Refund,
  getPaymentMethods,
  getTransactions,
  getRefunds,
  addPaymentMethod,
  deletePaymentMethod,
  requestRefund,
  CreatePaymentMethodData,
} from '../services/paymentService';

export default function Payments() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'methods' | 'transactions' | 'refunds'>('methods');
  const [showAddCard, setShowAddCard] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [cardForm, setCardForm] = useState<CreatePaymentMethodData>({
    card_last_four: '',
    expiry_month: 1,
    expiry_year: 2025,
    cardholder_name: '',
  });
  const [refundAmount, setRefundAmount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [methods, txs, refs] = await Promise.all([
        getPaymentMethods(),
        getTransactions(),
        getRefunds(),
      ]);
      setPaymentMethods(methods);
      setTransactions(txs);
      setRefunds(refs);
    } catch (err) {
      setError('Failed to load payment data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPaymentMethod(cardForm);
      setShowAddCard(false);
      setCardForm({
        card_last_four: '',
        expiry_month: 1,
        expiry_year: 2025,
        cardholder_name: '',
      });
      loadData();
    } catch (err) {
      setError('Failed to add payment method');
      console.error(err);
    }
  };

  const handleDeleteCard = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    try {
      await deletePaymentMethod(methodId);
      loadData();
    } catch (err) {
      setError('Failed to delete payment method');
      console.error(err);
    }
  };

  const handleRequestRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestRefund({
        transaction_id: selectedTransactionId,
        amount: refundAmount,
      });
      setShowRefundForm(false);
      setSelectedTransactionId('');
      setRefundAmount(0);
      alert('Refund requested successfully!');
      loadData();
    } catch (err) {
      setError('Failed to request refund');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Payments</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('methods')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'methods'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Payment Methods ({paymentMethods.length})
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Transactions ({transactions.length})
              </button>
              <button
                onClick={() => setActiveTab('refunds')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'refunds'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Refunds ({refunds.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Payment Methods */}
        {activeTab === 'methods' && (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setShowAddCard(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Payment Method
              </button>
            </div>

            {paymentMethods.length === 0 ? (
              <p className="text-gray-500">No payment methods added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          **** **** **** {method.card_last_four}
                        </p>
                        <p className="text-sm text-gray-600">{method.cardholder_name}</p>
                        <p className="text-sm text-gray-500">Expires: {method.expiry_date}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCard(method.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transactions */}
        {activeTab === 'transactions' && (
          <div>
            {transactions.length === 0 ? (
              <p className="text-gray-500">No transactions yet.</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">${tx.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(tx.transaction_date).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                            tx.status
                          )}`}
                        >
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                        {tx.status === 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedTransactionId(tx.id);
                              setRefundAmount(tx.amount);
                              setShowRefundForm(true);
                            }}
                            className="text-sm text-primary-600 hover:text-primary-800"
                          >
                            Request Refund
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Refunds */}
        {activeTab === 'refunds' && (
          <div>
            {refunds.length === 0 ? (
              <p className="text-gray-500">No refund requests yet.</p>
            ) : (
              <div className="space-y-4">
                {refunds.map((refund) => (
                  <div key={refund.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">${refund.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          Requested: {new Date(refund.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                          refund.status
                        )}`}
                      >
                        {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Card Modal */}
        {showAddCard && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Payment Method</h2>
              <form onSubmit={handleAddCard}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Card Last 4 Digits
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    pattern="\d{4}"
                    value={cardForm.card_last_four}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, card_last_four: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Expiry Month
                    </label>
                    <select
                      value={cardForm.expiry_month}
                      onChange={(e) =>
                        setCardForm({ ...cardForm, expiry_month: parseInt(e.target.value) })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Expiry Year
                    </label>
                    <select
                      value={cardForm.expiry_year}
                      onChange={(e) =>
                        setCardForm({ ...cardForm, expiry_year: parseInt(e.target.value) })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      {Array.from({ length: 10 }, (_, i) => 2025 + i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardForm.cardholder_name}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, cardholder_name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCard(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Add Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Refund Request Modal */}
        {showRefundForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Request Refund</h2>
              <form onSubmit={handleRequestRefund}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Refund Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRefundForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
