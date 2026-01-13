import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface BillingRecord {
  id: string;
  type: 'payment' | 'trip_charge' | 'refund';
  description: string;
  amount: number;
  status: string;
  created_at: string;
  reference_id: string;
}

interface BillingSummary {
  totalSpent: number;
  recordCount: number;
  lastBillingDate: string | null;
}

interface BillingFilters {
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  type: string;
}

/**
 * BillingHistory component for displaying user's billing records
 */
export default function BillingHistory() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<BillingFilters>({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    type: 'all',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchBillingHistory();
  }, [navigate]);

  /**
   * Fetch billing history from API with filters
   */
  const fetchBillingHistory = async (appliedFilters?: BillingFilters) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Build query string from filters
      const params = new URLSearchParams();
      const filterValues = appliedFilters || filters;

      if (filterValues.startDate) {
        params.append('startDate', filterValues.startDate);
      }
      if (filterValues.endDate) {
        params.append('endDate', filterValues.endDate);
      }
      if (filterValues.minAmount) {
        params.append('minAmount', filterValues.minAmount);
      }
      if (filterValues.maxAmount) {
        params.append('maxAmount', filterValues.maxAmount);
      }
      if (filterValues.type && filterValues.type !== 'all') {
        params.append('type', filterValues.type);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/billing?${queryString}` : '/api/billing';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setRecords(data.data.records);
        setSummary(data.data.summary);
      } else {
        setError(data.error || 'Failed to load billing history');
      }
    } catch (err) {
      setError('Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (field: keyof BillingFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Apply filters
   */
  const handleApplyFilters = () => {
    fetchBillingHistory(filters);
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    const clearedFilters: BillingFilters = {
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      type: 'all',
    };
    setFilters(clearedFilters);
    fetchBillingHistory(clearedFilters);
  };

  /**
   * Format currency for display
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get type badge styling
   */
  const getTypeBadge = (type: string): string => {
    switch (type) {
      case 'payment':
        return 'bg-blue-100 text-blue-800';
      case 'trip_charge':
        return 'bg-indigo-100 text-indigo-800';
      case 'refund':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading billing history...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Billing History</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="payment">Payment</option>
              <option value="trip_charge">Trip Charge</option>
              <option value="refund">Refund</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Min Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              placeholder="0.00"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Max Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              placeholder="1000.00"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {summary && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.totalSpent)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.recordCount}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Last Activity</p>
              <p className="text-2xl font-bold text-purple-600">
                {summary.lastBillingDate
                  ? formatDate(summary.lastBillingDate)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Billing Records */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Billing Records ({records.length})
        </h2>

        {records.length === 0 ? (
          <p className="text-gray-500">No billing records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(
                          record.type
                        )}`}
                      >
                        {record.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(record.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
