import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface FeedbackFormData {
  rating: number;
  comments: string;
}

interface FeedbackError {
  message: string;
}

export default function Feedback() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FeedbackFormData>({
    rating: 5,
    comments: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<FeedbackError | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
    setError(null);
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, comments: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    if (!formData.comments.trim()) {
      setError({ message: 'Please provide your comments' });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: formData.rating,
          comments: formData.comments.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      setFormData({ rating: 5, comments: '' });
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to submit feedback',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className={`text-3xl focus:outline-none transition-colors ${
              star <= formData.rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            }`}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Submit Feedback
            </h1>

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                Thank you for your feedback!
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                {renderStars()}
                <p className="mt-1 text-sm text-gray-500">
                  {formData.rating} out of 5 stars
                </p>
              </div>

              <div>
                <label
                  htmlFor="comments"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Comments
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  rows={4}
                  value={formData.comments}
                  onChange={handleCommentsChange}
                  placeholder="Share your experience with us..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
