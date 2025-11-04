export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  status: ReviewStatus;
  adminReply?: string;
  adminRepliedAt?: string;
  createdAt: string;
  updatedAt: string;
  userHasVoted?: boolean;
  userVotedHelpful?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

export interface ReviewRequest {
  productId: number;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export interface PagedReviewResponse {
  content: Review[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AdminReplyRequest {
  adminReply: string;
}
