import api from './api';
import type { Review, ReviewRequest, ReviewStats, PagedReviewResponse, AdminReplyRequest, ReviewStatus } from '../types/review';

class ReviewService {
  private getUserHeaderConfig(userId?: number) {
    if (typeof userId !== 'number') {
      return undefined;
    }

    return {
      headers: {
        'X-User-Id': userId.toString(),
      },
    };
  }

  /**
   * Get reviews for a specific product
   */
  async getProductReviews(
    productId: number,
    page: number = 0,
    size: number = 10,
    sortBy?: string,
    userId?: number
  ): Promise<PagedReviewResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (sortBy) {
      params.append('sortBy', sortBy);
    }

    const response = await api.get(
      `/reviews/product/${productId}?${params.toString()}`,
      this.getUserHeaderConfig(userId)
    );
    return response.data;
  }

  /**
   * Get review statistics for a product
   */
  async getProductReviewStats(productId: number): Promise<ReviewStats> {
    const response = await api.get(`/reviews/product/${productId}/stats`);
    return response.data;
  }

  /**
   * Create a new review
   */
  async createReview(request: ReviewRequest, userId: number): Promise<Review> {
    const response = await api.post('/reviews', request, this.getUserHeaderConfig(userId));
    return response.data;
  }

  /**
   * Update an existing review
   */
  async updateReview(reviewId: number, request: ReviewRequest, userId: number): Promise<Review> {
    const response = await api.put(
      `/reviews/${reviewId}`,
      request,
      this.getUserHeaderConfig(userId)
    );
    return response.data;
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: number, userId: number): Promise<void> {
    await api.delete(`/reviews/${reviewId}`, this.getUserHeaderConfig(userId));
  }

  /**
   * Vote on review helpfulness
   */
  async voteHelpful(reviewId: number, helpful: boolean, userId: number): Promise<Review> {
    const response = await api.post(
      `/reviews/${reviewId}/vote?helpful=${helpful}`,
      null,
      this.getUserHeaderConfig(userId)
    );
    return response.data;
  }

  // Admin methods

  /**
   * Get all reviews (admin)
   */
  async getAllReviews(
    page: number = 0,
    size: number = 20,
    status?: ReviewStatus
  ): Promise<PagedReviewResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await api.get(`/reviews/admin/all?${params.toString()}`);
    return response.data;
  }

  /**
   * Update review status (admin)
   */
  async updateReviewStatus(reviewId: number, status: ReviewStatus): Promise<Review> {
    const response = await api.patch(`/reviews/admin/${reviewId}/status?status=${status}`);
    return response.data;
  }

  /**
   * Add admin reply to review
   */
  async addAdminReply(reviewId: number, reply: string): Promise<Review> {
    const request: AdminReplyRequest = { adminReply: reply };
    const response = await api.post(`/reviews/admin/${reviewId}/reply`, request);
    return response.data;
  }
}

export default new ReviewService();
