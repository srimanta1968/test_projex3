import { useState, useEffect } from 'react';
import {
  Dispute,
  DisputeType,
  DisputeStatus,
  CreateDisputePayload,
  DisputeMessage,
  getDisputes,
  getDisputeById,
  createDispute,
  addMessage,
  closeDispute,
  escalateDispute,
  DISPUTE_TYPE_LABELS,
  DISPUTE_STATUS_LABELS,
  getStatusColor,
} from '../services/disputeService';

/**
 * Disputes page component
 */
export default function Disputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<DisputeStatus | ''>('');

  // Form state for new dispute
  const [newDispute, setNewDispute] = useState<CreateDisputePayload>({
    dispute_type: 'service',
    reason: '',
    description: '',
  });

  // Load disputes
  useEffect(() => {
    loadDisputes();
  }, [filterStatus]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getDisputes(filterStatus || undefined);
      setDisputes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  // View dispute details
  const viewDispute = async (id: string) => {
    try {
      setError('');
      const data = await getDisputeById(id);
      setSelectedDispute(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dispute');
    }
  };

  // Create new dispute
  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await createDispute(newDispute);
      setShowCreateModal(false);
      setNewDispute({ dispute_type: 'service', reason: '', description: '' });
      loadDisputes();
    } catch (err: any) {
      setError(err.message || 'Failed to create dispute');
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !newMessage.trim()) return;

    try {
      setError('');
      await addMessage(selectedDispute.id, newMessage);
      setNewMessage('');
      viewDispute(selectedDispute.id);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    }
  };

  // Close dispute
  const handleCloseDispute = async () => {
    if (!selectedDispute) return;
    if (!confirm('Are you sure you want to close this dispute?')) return;

    try {
      setError('');
      await closeDispute(selectedDispute.id);
      setSelectedDispute(null);
      loadDisputes();
    } catch (err: any) {
      setError(err.message || 'Failed to close dispute');
    }
  };

  // Escalate dispute
  const handleEscalateDispute = async () => {
    if (!selectedDispute) return;
    if (!confirm('Are you sure you want to escalate this dispute?')) return;

    try {
      setError('');
      await escalateDispute(selectedDispute.id);
      viewDispute(selectedDispute.id);
      loadDisputes();
    } catch (err: any) {
      setError(err.message || 'Failed to escalate dispute');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Disputes</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          New Dispute
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Status
        </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as DisputeStatus | '')}
          className="input w-48"
        >
          <option value="">All</option>
          {Object.entries(DISPUTE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disputes list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-900">Your Disputes</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : disputes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No disputes found</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {disputes.map((dispute) => (
                  <li
                    key={dispute.id}
                    onClick={() => viewDispute(dispute.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedDispute?.id === dispute.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">
                        {DISPUTE_TYPE_LABELS[dispute.dispute_type]}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          dispute.status
                        )}`}
                      >
                        {DISPUTE_STATUS_LABELS[dispute.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{dispute.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(dispute.created_at)}
                    </p>
                    {dispute.message_count !== undefined && dispute.message_count > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {dispute.message_count} message(s)
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Dispute details */}
        <div className="lg:col-span-2">
          {selectedDispute ? (
            <div className="bg-white rounded-lg shadow">
              {/* Header */}
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {DISPUTE_TYPE_LABELS[selectedDispute.dispute_type]}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Created {formatDate(selectedDispute.created_at)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                    selectedDispute.status
                  )}`}
                >
                  {DISPUTE_STATUS_LABELS[selectedDispute.status]}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Reason */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reason</h3>
                  <p className="mt-1 text-gray-900">{selectedDispute.reason}</p>
                </div>

                {/* Description */}
                {selectedDispute.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-gray-900">{selectedDispute.description}</p>
                  </div>
                )}

                {/* Resolution */}
                {selectedDispute.resolution && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Resolution</h3>
                    <p className="mt-1 text-gray-900">{selectedDispute.resolution}</p>
                  </div>
                )}

                {/* Messages */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    Communication
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
                    {selectedDispute.messages && selectedDispute.messages.length > 0 ? (
                      selectedDispute.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${
                            msg.is_admin
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">
                              {msg.is_admin ? 'Support' : msg.user_name || 'You'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No messages yet</p>
                    )}
                  </div>

                  {/* Send message form */}
                  {selectedDispute.status !== 'resolved' &&
                    selectedDispute.status !== 'closed' && (
                      <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="input flex-1"
                        />
                        <button type="submit" className="btn btn-primary">
                          Send
                        </button>
                      </form>
                    )}
                </div>
              </div>

              {/* Actions */}
              {selectedDispute.status !== 'resolved' &&
                selectedDispute.status !== 'closed' && (
                  <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
                    <button
                      onClick={handleCloseDispute}
                      className="btn btn-secondary"
                    >
                      Close Dispute
                    </button>
                    {selectedDispute.status !== 'escalated' && (
                      <button
                        onClick={handleEscalateDispute}
                        className="btn bg-red-600 text-white hover:bg-red-700"
                      >
                        Escalate
                      </button>
                    )}
                  </div>
                )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Select a dispute to view details
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Dispute
              </h2>
            </div>
            <form onSubmit={handleCreateDispute} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={newDispute.dispute_type}
                  onChange={(e) =>
                    setNewDispute({
                      ...newDispute,
                      dispute_type: e.target.value as DisputeType,
                    })
                  }
                  className="input w-full"
                  required
                >
                  {Object.entries(DISPUTE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <input
                  type="text"
                  value={newDispute.reason}
                  onChange={(e) =>
                    setNewDispute({ ...newDispute, reason: e.target.value })
                  }
                  className="input w-full"
                  placeholder="Brief summary of the issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDispute.description || ''}
                  onChange={(e) =>
                    setNewDispute({ ...newDispute, description: e.target.value })
                  }
                  className="input w-full"
                  rows={4}
                  placeholder="Provide more details about the issue..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
