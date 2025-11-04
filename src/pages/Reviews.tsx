import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import reviewService from '../services/reviewService';
import type { Review, ReviewStatus } from '../types/review';

const Reviews = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | 'ALL'>('ALL');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [currentPage, filterStatus]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const status = filterStatus === 'ALL' ? undefined : filterStatus;
      const response = await reviewService.getAllReviews(currentPage, 20, status);
      setReviews(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId: number, status: ReviewStatus) => {
    try {
      await reviewService.updateReviewStatus(reviewId, status);
      await fetchReviews();
      alert(`Đánh giá đã được ${status === 'APPROVED' ? 'chấp nhận' : 'từ chối'}`);
    } catch (error) {
      console.error('Error updating review status:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleReply = async (reviewId: number) => {
    if (!replyText.trim()) {
      alert('Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.addAdminReply(reviewId, replyText.trim());
      await fetchReviews();
      setSelectedReview(null);
      setReplyText('');
      alert('Phản hồi đã được gửi thành công');
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: ReviewStatus) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };

    const labels = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Đã từ chối',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1D1D]">
            {t('admin.reviewManagement', 'Quản lý đánh giá')}
          </h2>
          <p className="text-sm text-[#646667] mt-1">
            Xem và quản lý đánh giá từ khách hàng
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 flex items-center gap-4">
        <FunnelIcon className="w-5 h-5 text-[#646667]" />
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-[#9F86D9] text-white'
                : 'bg-gray-100 text-[#646667] hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'PENDING'
                ? 'bg-[#9F86D9] text-white'
                : 'bg-gray-100 text-[#646667] hover:bg-gray-200'
            }`}
          >
            Chờ duyệt
          </button>
          <button
            onClick={() => setFilterStatus('APPROVED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'APPROVED'
                ? 'bg-[#9F86D9] text-white'
                : 'bg-gray-100 text-[#646667] hover:bg-gray-200'
            }`}
          >
            Đã duyệt
          </button>
          <button
            onClick={() => setFilterStatus('REJECTED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'REJECTED'
                ? 'bg-[#9F86D9] text-white'
                : 'bg-gray-100 text-[#646667] hover:bg-gray-200'
            }`}
          >
            Đã từ chối
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F86D9]"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#646667]">Không có đánh giá nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Người đánh giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Đánh giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nội dung
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-[#1C1D1D]">
                        ID: {review.productId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#9F86D9] to-[#EDA62A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#1C1D1D]">
                            {review.userName}
                          </div>
                          {review.isVerifiedPurchase && (
                            <span className="text-xs text-green-600">Đã mua</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            width="14"
                            height="14"
                            viewBox="0 0 20 20"
                            fill={i < review.rating ? '#FCC605' : '#DBE2E5'}
                          >
                            <path d="M10 0l2.5 6.5H20l-5.5 4.5 2 6.5L10 13l-6.5 4.5 2-6.5L0 6.5h7.5z" />
                          </svg>
                        ))}
                        <span className="text-xs text-[#646667] ml-1">
                          ({review.rating}/5)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <div className="text-sm font-medium text-[#1C1D1D] mb-1">
                        {review.title}
                      </div>
                      <div className="text-xs text-[#646667] line-clamp-2">
                        {review.comment}
                      </div>
                      {review.images && review.images.length > 0 && (
                        <div className="text-xs text-[#9F86D9] mt-1">
                          {review.images.length} ảnh
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(review.status)}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-[#646667]">
                        {formatDate(review.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {review.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(review.id, 'APPROVED')}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Chấp nhận"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(review.id, 'REJECTED')}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Từ chối"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setReplyText(review.adminReply || '');
                          }}
                          className="p-1 text-[#9F86D9] hover:bg-purple-50 rounded transition-colors"
                          title="Phản hồi"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-[#646667]">
              Trang {currentPage + 1} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 border border-[#DBE2E5] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#9F86D9]"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 border border-[#DBE2E5] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#9F86D9]"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold text-[#1C1D1D] mb-4">
              Phản hồi đánh giá
            </h3>

            {/* Review Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-[#1C1D1D]">{selectedReview.userName}</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      width="14"
                      height="14"
                      viewBox="0 0 20 20"
                      fill={i < selectedReview.rating ? '#FCC605' : '#DBE2E5'}
                    >
                      <path d="M10 0l2.5 6.5H20l-5.5 4.5 2 6.5L10 13l-6.5 4.5 2-6.5L0 6.5h7.5z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="text-sm font-medium text-[#1C1D1D] mb-1">
                {selectedReview.title}
              </div>
              <div className="text-sm text-[#646667]">{selectedReview.comment}</div>
            </div>

            {/* Reply Form */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1C1D1D] mb-2">
                Nội dung phản hồi
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-[#DBE2E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] resize-none"
                placeholder="Nhập nội dung phản hồi..."
                maxLength={1000}
              />
              <p className="text-xs text-[#646667] mt-1">{replyText.length}/1000 ký tự</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleReply(selectedReview.id)}
                disabled={submitting}
                className={`flex-1 px-6 py-3 bg-[#9F86D9] text-white rounded-lg font-medium transition-colors ${
                  submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#8a75c4]'
                }`}
              >
                {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setReplyText('');
                }}
                className="px-6 py-3 border border-[#DBE2E5] text-[#646667] rounded-lg font-medium hover:border-[#9F86D9] transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
