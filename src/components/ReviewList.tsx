import { useState, useEffect } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon, HandThumbDownIcon as HandThumbDownSolidIcon } from '@heroicons/react/24/solid';
import reviewService from '../services/reviewService';
import type { Review, ReviewStats } from '../types/review';
import { useAuth } from '../contexts/AuthContext';

interface ReviewListProps {
  productId: number;
  onWriteReview?: () => void;
}

const ReviewList = ({ productId, onWriteReview }: ReviewListProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [productId, currentPage, sortBy, user?.backendUserId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getProductReviews(
        productId,
        currentPage,
        5,
        sortBy,
        user?.backendUserId
      );
      setReviews(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await reviewService.getProductReviewStats(productId);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const handleVote = async (reviewId: number, helpful: boolean) => {
    if (!user) {
      alert('Vui lòng đăng nhập để đánh giá');
      return;
    }

    if (typeof user.backendUserId !== 'number') {
      alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      const updatedReview = await reviewService.voteHelpful(reviewId, helpful, user.backendUserId);
      setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
    } catch (error) {
      console.error('Error voting:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
      return `${Math.floor(diffDays / 365)} năm trước`;
    } catch {
      return dateString;
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F86D9]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      {stats && (
        <div className="bg-[#EFF2F3] rounded-lg p-8">
          <div className="flex items-center gap-12">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-[#1C1D1D] mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex gap-1 mb-2 justify-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill={i < Math.round(stats.averageRating) ? '#FCC605' : '#DBE2E5'}>
                    <path d="M10 0l2.5 6.5H20l-5.5 4.5 2 6.5L10 13l-6.5 4.5 2-6.5L0 6.5h7.5z"/>
                  </svg>
                ))}
              </div>
              <div className="text-sm text-[#646667]">
                {stats.totalReviews} đánh giá
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-[#646667] w-8">{rating} sao</span>
                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FCC605]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-[#646667] w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sort and Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-[#DBE2E5] rounded-lg text-sm focus:outline-none focus:border-[#9F86D9]"
          >
            <option value="recent">Mới nhất</option>
            <option value="helpful">Hữu ích nhất</option>
            <option value="rating_high">Điểm cao nhất</option>
            <option value="rating_low">Điểm thấp nhất</option>
          </select>
        </div>

        {onWriteReview && (
          <button
            onClick={onWriteReview}
            className="px-6 py-2 bg-[#9F86D9] text-white rounded-lg font-medium hover:bg-[#8a75c4] transition-colors"
          >
            Viết đánh giá
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#646667] mb-4">Chưa có đánh giá nào</p>
            {onWriteReview && (
              <button
                onClick={onWriteReview}
                className="px-6 py-2 bg-[#9F86D9] text-white rounded-lg font-medium hover:bg-[#8a75c4] transition-colors"
              >
                Viết đánh giá đầu tiên
              </button>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-[#DBE2E5]">
              {/* User Info */}
              <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#9F86D9] to-[#EDA62A] rounded-full flex items-center justify-center text-white font-bold">
                  {review.userAvatar ? (
                    <img src={review.userAvatar} alt={review.userName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    review.userName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[#1C1D1D]">{review.userName}</span>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Đã mua hàng
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill={i < review.rating ? '#FCC605' : '#DBE2E5'}>
                          <path d="M10 0l2.5 6.5H20l-5.5 4.5 2 6.5L10 13l-6.5 4.5 2-6.5L0 6.5h7.5z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-[#646667]">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-3">
                <h4 className="font-bold text-[#1C1D1D] mb-2">{review.title}</h4>
                <p className="text-sm text-[#646667]">{review.comment}</p>
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                    />
                  ))}
                </div>
              )}

              {/* Admin Reply */}
              {review.adminReply && (
                <div className="bg-purple-50 rounded-lg p-4 mb-3 border-l-4 border-[#9F86D9]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-[#9F86D9]">Phản hồi từ Shop</span>
                    <span className="text-xs text-[#646667]">
                      {review.adminRepliedAt && formatDate(review.adminRepliedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-[#646667]">{review.adminReply}</p>
                </div>
              )}

              {/* Helpful Buttons */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#646667]">Đánh giá này hữu ích?</span>
                <button
                  onClick={() => handleVote(review.id, true)}
                  className={`flex items-center gap-1 px-3 py-1 rounded border transition-colors ${
                    review.userVotedHelpful === true
                      ? 'border-[#9F86D9] bg-purple-50 text-[#9F86D9]'
                      : 'border-[#DBE2E5] text-[#646667] hover:border-[#9F86D9]'
                  }`}
                >
                  {review.userVotedHelpful === true ? (
                    <HandThumbUpSolidIcon className="w-4 h-4" />
                  ) : (
                    <HandThumbUpIcon className="w-4 h-4" />
                  )}
                  <span className="text-sm">{review.helpfulCount}</span>
                </button>
                <button
                  onClick={() => handleVote(review.id, false)}
                  className={`flex items-center gap-1 px-3 py-1 rounded border transition-colors ${
                    review.userVotedHelpful === false
                      ? 'border-[#E35946] bg-red-50 text-[#E35946]'
                      : 'border-[#DBE2E5] text-[#646667] hover:border-[#E35946]'
                  }`}
                >
                  {review.userVotedHelpful === false ? (
                    <HandThumbDownSolidIcon className="w-4 h-4" />
                  ) : (
                    <HandThumbDownIcon className="w-4 h-4" />
                  )}
                  <span className="text-sm">{review.notHelpfulCount}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 border border-[#DBE2E5] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#9F86D9]"
          >
            Trước
          </button>
          <span className="text-sm text-[#646667]">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 border border-[#DBE2E5] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#9F86D9]"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
