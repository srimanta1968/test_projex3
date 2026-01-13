import { dataService } from './dataService';

export interface FeedbackInput {
  rating: number;
  comments: string;
}

export interface Feedback {
  id: string;
  feedback_id: string;
  user_id: string;
  rating: number;
  comments: string;
  created_at: Date;
}

export interface FeedbackResponse {
  feedback: {
    id: string;
    user_id: string;
    rating: number;
    comments: string;
  };
}

export interface FeedbackListResponse {
  feedbacks: Feedback[];
}

export const feedbackService = {
  /**
   * Create new feedback
   */
  async createFeedback(
    userId: string,
    input: FeedbackInput
  ): Promise<FeedbackResponse> {
    const { rating, comments } = input;

    const feedback = await dataService.queryOne<Feedback>(
      `INSERT INTO user_feedback (user_id, rating, comments)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, rating, comments`,
      [userId, rating, comments]
    );

    if (!feedback) {
      throw new Error('Failed to create feedback');
    }

    return {
      feedback: {
        id: feedback.id,
        user_id: feedback.user_id,
        rating: feedback.rating,
        comments: feedback.comments,
      },
    };
  },

  /**
   * Get all feedback for a user
   */
  async getUserFeedback(userId: string): Promise<FeedbackListResponse> {
    const feedbacks = await dataService.query<Feedback>(
      `SELECT id, feedback_id, user_id, rating, comments, created_at
       FROM user_feedback
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return { feedbacks };
  },

  /**
   * Get average rating for a user
   */
  async getUserAverageRating(userId: string): Promise<number | null> {
    const result = await dataService.queryOne<{ avg: string }>(
      `SELECT AVG(rating)::numeric(3,2) as avg
       FROM user_feedback
       WHERE user_id = $1`,
      [userId]
    );

    return result?.avg ? parseFloat(result.avg) : null;
  },
};

export default feedbackService;
