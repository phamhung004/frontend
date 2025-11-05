import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/outline';
import reviewService from '../services/reviewService';
import type { ReviewRequest } from '../types/review';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ui/ToastContainer';

interface ReviewFormProps {
  productId: number;
  productName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm = ({ productId, productName, onSuccess, onCancel }: ReviewFormProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Limit to 5 images
    if (images.length + files.length > 5) {
      toast.warning('Giới hạn ảnh', 'Chỉ có thể tải lên tối đa 5 ảnh');
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (max 500KB for base64 storage)
        if (file.size > 500 * 1024) {
          toast.warning('File quá lớn', `File ${file.name} quá lớn. Kích thước tối đa 500KB`);
          continue;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.warning('Định dạng không hợp lệ', `File ${file.name} không phải là ảnh`);
          continue;
        }

        // Convert to base64 for preview (in production, upload to server)
        const reader = new FileReader();
        const url = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        uploadedUrls.push(url);
      }

      setImages([...images, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Lỗi tải ảnh', 'Có lỗi khi tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    } else if (title.length > 200) {
      newErrors.title = 'Tiêu đề không được quá 200 ký tự';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Vui lòng nhập nội dung đánh giá';
    } else if (comment.length > 2000) {
      newErrors.comment = 'Nội dung không được quá 2000 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.warning('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để viết đánh giá');
      return;
    }

    if (typeof user.backendUserId !== 'number') {
      toast.error('Lỗi xác thực', 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const request: ReviewRequest = {
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined,
      };

  await reviewService.createReview(request, user.backendUserId);
      
      toast.success('Gửi đánh giá thành công', 'Đánh giá của bạn đã được gửi và đang chờ duyệt. Cảm ơn bạn!');
      
      // Reset form
      setRating(5);
      setTitle('');
      setComment('');
      setImages([]);
      setErrors({});
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error('Lỗi gửi đánh giá', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-[#DBE2E5]">
      <h3 className="text-xl font-bold text-[#1C1D1D] mb-4">Viết đánh giá cho {productName}</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-[#1C1D1D] mb-2">
            Đánh giá của bạn <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                {star <= (hoverRating || rating) ? (
                  <StarIcon className="w-10 h-10 text-[#FCC605]" />
                ) : (
                  <StarOutlineIcon className="w-10 h-10 text-[#DBE2E5]" />
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-[#646667] mt-1">
            {rating === 5 && 'Xuất sắc'}
            {rating === 4 && 'Tốt'}
            {rating === 3 && 'Trung bình'}
            {rating === 2 && 'Kém'}
            {rating === 1 && 'Rất kém'}
          </p>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[#1C1D1D] mb-2">
            Tiêu đề <span className="text-red-600">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tóm tắt ngắn gọn về trải nghiệm của bạn"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] ${
              errors.title ? 'border-red-500' : 'border-[#DBE2E5]'
            }`}
            maxLength={200}
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
          )}
          <p className="text-xs text-[#646667] mt-1">{title.length}/200 ký tự</p>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-[#1C1D1D] mb-2">
            Nội dung đánh giá <span className="text-red-600">*</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ chi tiết về sản phẩm, chất lượng, dịch vụ..."
            rows={5}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] resize-none ${
              errors.comment ? 'border-red-500' : 'border-[#DBE2E5]'
            }`}
            maxLength={2000}
          />
          {errors.comment && (
            <p className="text-sm text-red-600 mt-1">{errors.comment}</p>
          )}
          <p className="text-xs text-[#646667] mt-1">{comment.length}/2000 ký tự</p>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-[#1C1D1D] mb-2">
            Hình ảnh (Tùy chọn)
          </label>
          <div className="space-y-3">
            {/* Image Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-[#DBE2E5]"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#DBE2E5] rounded-lg cursor-pointer hover:border-[#9F86D9] transition-colors">
                <div className="flex flex-col items-center justify-center text-center">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9F86D9]"></div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-[#646667] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-xs text-[#646667]">Tải ảnh lên ({images.length}/5)</p>
                      <p className="text-xs text-[#646667]">Tối đa 500KB/ảnh</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 px-6 py-3 bg-[#9F86D9] text-white rounded-lg font-medium transition-colors ${
              submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#8a75c4]'
            }`}
          >
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-[#DBE2E5] text-[#646667] rounded-lg font-medium hover:border-[#9F86D9] transition-colors"
            >
              Hủy
            </button>
          )}
        </div>

        <p className="text-xs text-[#646667]">
          Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển thị công khai.
        </p>
      </form>
    </div>
  );
};

export default ReviewForm;
