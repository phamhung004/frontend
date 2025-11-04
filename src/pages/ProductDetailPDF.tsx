import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/productService';
import { pdfProductService } from '../services/pdfProductService';
import type { ProductDetail } from '../types/product';
import InstagramFeed from '../components/InstagramFeed';
import { formatCurrency } from '../utils/currency';
import { resolveProductPricing } from '../utils/pricing';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';

const ProductDetailPDF = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('description');
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await productService.getProductById(parseInt(id));
        
        if (data.productType !== 'PDF') {
          navigate(`/product/${id}`);
          return;
        }
        
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleDownload = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để tải xuống tài liệu miễn phí');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    if (typeof user.backendUserId !== 'number') {
      alert('Không thể xác định tài khoản của bạn. Vui lòng đăng xuất và đăng nhập lại.');
      return;
    }

    if (!product || !product.id) {
      return;
    }

    try {
      setDownloading(true);
      const response = await pdfProductService.downloadPdf(product.id, user.backendUserId);
      
      const targetUrl = response.downloadUrl || product.fileUrl;

      if (!targetUrl) {
        throw new Error('Không tìm thấy đường dẫn tải xuống');
      }

      const fileResponse = await fetch(targetUrl);

      if (!fileResponse.ok) {
        throw new Error(`Download failed with status ${fileResponse.status}`);
      }

      const blob = await fileResponse.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = response.fileName || `${product.slug}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      alert('Tải xuống thành công! Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.');
    } catch (err) {
      console.error('Download error:', err);
      alert('Có lỗi xảy ra khi tải xuống. Vui lòng thử lại sau.');
    } finally {
      setDownloading(false);
    }
  };

  const pricing = useMemo(() => (product ? resolveProductPricing(product) : null), [product]);
  const finalPrice = pricing?.finalPrice ?? product?.regularPrice ?? 0;
  const basePrice = pricing?.basePrice ?? product?.regularPrice ?? finalPrice;
  const hasDiscount = pricing?.hasDiscount ?? false;
  const isFree = finalPrice === 0;

  const recommendedProducts = [
    { name: 'Tập tô màu', price: 56.40, image: '/images/product-1.png' },
    { name: 'Bộ tranh học tập', price: 253.0, image: '/images/product-2.png' },
    { name: 'Sách hướng dẫn', price: 150.6, image: '/images/product-3.png' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9F86D9] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy sản phẩm'}</p>
          <button 
            onClick={() => navigate('/shop')}
            className="bg-[#9F86D9] text-white px-6 py-2 rounded hover:bg-[#8a6fc9]"
          >
            Quay về Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-[#EFF2F3] py-4">
        <div className="max-w-[1434px] mx-auto px-4">
          <div className="flex items-center gap-3 text-base">
            <a href="/" className="text-[#9F86D9] hover:underline">Home</a>
            <span className="text-[#646667]">›</span>
            <a href="/shop" className="text-[#9F86D9] hover:underline">Shop</a>
            <span className="text-[#646667]">›</span>
            <span className="text-[#646667]">Tài liệu miễn phí</span>
          </div>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="max-w-[1434px] mx-auto px-4 py-16">
        <div className="flex gap-10">
          {/* Left Side - PDF Preview */}
          <div className="w-[564px]">
            <div className="bg-[#EFF2F3] rounded-lg p-8 flex flex-col items-center justify-center" style={{ minHeight: '645px' }}>
              {/* PDF Icon */}
              <div className="mb-6">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  <rect width="120" height="120" rx="8" fill="#E35946"/>
                  <path d="M40 30h40v60H40z" fill="white" opacity="0.2"/>
                  <text x="60" y="70" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">PDF</text>
                </svg>
              </div>
              
              {/* File Info */}
              <h3 className="text-xl font-bold text-[#1C1D1D] mb-2 text-center">
                Xem trước tài liệu
              </h3>
              <div className="flex items-center gap-4 text-sm text-[#646667] mb-6">
                <span className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5 4v8l7-4-7-4z"/>
                  </svg>
                  {product.pageCount || 0} trang
                </span>
                <span>•</span>
                <span>{product.fileSize || 'N/A'}</span>
                <span>•</span>
                <span>{product.fileFormat || 'PDF'}</span>
              </div>

              {/* Preview Button */}
              <button className="px-6 py-3 bg-white text-[#9F86D9] border-2 border-[#9F86D9] rounded-lg font-medium hover:bg-[#9F86D9] hover:text-white transition-colors mb-4">
                Xem trước toàn bộ
              </button>
              
              <p className="text-sm text-[#646667] text-center">
                Nhấn để xem trước nội dung file PDF
              </p>
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="flex-1 max-w-[610px]">
            {/* Free Badge */}
            {isFree && (
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#39F5C4] text-white text-base font-bold px-4 py-1.5 rounded">
                  MIỄN PHÍ
                </div>
              </div>
            )}

            {/* Product Title */}
            <h1 className="text-2xl font-bold text-[#1C1D1D] mb-4">
              {product.name}
            </h1>

            {/* Rating & Downloads */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#FCC605">
                    <path d="M10 0l2.5 6.5H20l-5.5 4.5 2 6.5L10 13l-6.5 4.5 2-6.5L0 6.5h7.5z"/>
                  </svg>
                ))}
              </div>
              <span className="text-[#646667]">(247 Lượt tải - 89 Đánh giá)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#DBE2E5]">
              {isFree ? (
                <>
                  <span className="text-3xl font-bold text-[#39F5C4]">MIỄN PHÍ</span>
                  <span className="text-lg text-[#646667]">(0đ)</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-[#9F86D9]">{formatCurrency(finalPrice)}</span>
                  {hasDiscount && (
                    <span className="text-lg text-[#646667] line-through">{formatCurrency(basePrice)}</span>
                  )}
                </>
              )}
            </div>

            {/* File Information */}
            <div className="bg-[#EFF2F3] rounded-lg p-6 mb-6">
              <h3 className="text-base font-bold text-[#1C1D1D] mb-4">Thông tin file</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#646667]">Định dạng:</span>
                  <span className="text-sm font-medium text-[#1C1D1D]">{product.fileFormat || 'PDF'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#646667]">Kích thước:</span>
                  <span className="text-sm font-medium text-[#1C1D1D]">{product.fileSize || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#646667]">Số trang:</span>
                  <span className="text-sm font-medium text-[#1C1D1D]">{product.pageCount || 0} trang</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#646667]">Ngôn ngữ:</span>
                  <span className="text-sm font-medium text-[#1C1D1D]">Tiếng Việt</span>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className={`w-full h-14 bg-[#9F86D9] text-white rounded-lg font-bold text-base hover:bg-[#8a75c4] transition-colors flex items-center justify-center gap-3 mb-4 ${
                downloading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {downloading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang tải...
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/>
                  </svg>
                  {isFree ? 'Tải xuống miễn phí' : 'Tải xuống'}
                </>
              )}
            </button>

            {/* Info Note */}
            {product.requiresLogin && (
              <div className="bg-[#FFF9E6] border border-[#FCC605] rounded-lg p-4 flex gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#FCC605" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4m0 4h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div className="text-sm text-[#1C1D1D]">
                  <p className="font-medium mb-1">Lưu ý:</p>
                  <p>
                    {isFree 
                      ? 'Tài liệu này hoàn toàn miễn phí. Bạn cần đăng nhập để tải về và sử dụng cho mục đích học tập.' 
                      : 'Bạn cần đăng nhập để tải xuống tài liệu này.'}
                    {isFree && ' Vui lòng không sử dụng cho mục đích thương mại.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Products Sidebar */}
          <div className="w-[171px]">
            <h3 className="text-base text-center text-[#646667] mb-6 leading-tight">
              Gợi ý<br />cho bạn
            </h3>
            <div className="space-y-6">
              {recommendedProducts.map((product, index) => (
                <div key={index} className="cursor-pointer">
                  <div className="w-[171px] h-[171px] bg-[#EFF2F3] mb-2">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1C1D1D] mb-1">{product.name}</h4>
                  <p className="text-sm text-[#9F86D9]">{product.price.toLocaleString('vi-VN')}đ</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-[1434px] mx-auto px-4 mb-16">
        <div className="border-b-2 border-[#DBE2E5] mb-8">
          <div className="flex gap-12">
            <button
              onClick={() => setActiveTab('description')}
              className={`text-xl pb-4 ${
                activeTab === 'description'
                  ? 'text-[#9F86D9] border-b-2 border-[#9F86D9]'
                  : 'text-[#1C1D1D]'
              }`}
            >
              Mô tả tài liệu
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`text-xl pb-4 ${
                activeTab === 'content'
                  ? 'text-[#9F86D9] border-b-2 border-[#9F86D9]'
                  : 'text-[#1C1D1D]'
              }`}
            >
              Nội dung chi tiết
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-xl pb-4 ${
                activeTab === 'reviews'
                  ? 'text-[#9F86D9] border-b-2 border-[#9F86D9]'
                  : 'text-[#1C1D1D]'
              }`}
            >
              Đánh giá
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex gap-16">
          {/* Left Content */}
          <div className="flex-1 max-w-[1004px]">
            {activeTab === 'description' && (
              <div className="space-y-6 text-base text-[#1C1D1D]">
                <h3 className="text-xl font-bold text-[#1C1D1D]">MÔ TẢ TÀI LIỆU</h3>

                <p className="text-sm">
                  Tài liệu miễn phí hướng dẫn phát triển kỹ năng toàn diện cho bé từ 3-6 tuổi. Nội dung được biên soạn bởi các chuyên gia giáo dục mầm non với phương pháp khoa học, phù hợp với sự phát triển tự nhiên của trẻ.
                </p>

                <div>
                  <h4 className="text-sm font-bold mb-2">⭐ NỘI DUNG CHÍNH:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3 text-sm">
                      <span className="text-[#9F86D9]">✓</span>
                      <span>Phát triển kỹ năng vận động tinh và vận động thô</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="text-[#9F86D9]">✓</span>
                      <span>Rèn luyện khả năng tư duy logic và sáng tạo</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="text-[#9F86D9]">✓</span>
                      <span>Phát triển ngôn ngữ và giao tiếp xã hội</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="text-[#9F86D9]">✓</span>
                      <span>Bài tập thực hành kèm hướng dẫn chi tiết</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-2">🎯 PHÙ HỢP VỚI:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2 text-sm">
                    <li>Phụ huynh có con từ 3-6 tuổi</li>
                    <li>Giáo viên mầm non</li>
                    <li>Người quan tâm đến giáo dục sớm</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-2">📦 CAM KẾT</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                    <li>Nội dung chất lượng cao, được biên soạn bởi chuyên gia</li>
                    <li>File PDF rõ nét, dễ đọc và in ấn</li>
                    <li>Hoàn toàn miễn phí, không giới hạn lượt tải</li>
                    <li>Cập nhật nội dung định kỳ</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6 text-base text-[#1C1D1D]">
                <h3 className="text-lg font-bold text-[#1C1D1D] mb-4">NỘI DUNG CHI TIẾT</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-[#9F86D9] pl-4 py-2">
                    <h4 className="font-bold mb-2">Chương 1: Phát triển vận động (Trang 1-8)</h4>
                    <p className="text-sm text-[#646667]">Các hoạt động rèn luyện kỹ năng vận động tinh và thô, phối hợp tay mắt</p>
                  </div>

                  <div className="border-l-4 border-[#9F86D9] pl-4 py-2">
                    <h4 className="font-bold mb-2">Chương 2: Phát triển tư duy (Trang 9-15)</h4>
                    <p className="text-sm text-[#646667]">Bài tập logic, giải quyết vấn đề, sáng tạo</p>
                  </div>

                  <div className="border-l-4 border-[#9F86D9] pl-4 py-2">
                    <h4 className="font-bold mb-2">Chương 3: Phát triển ngôn ngữ (Trang 16-20)</h4>
                    <p className="text-sm text-[#646667]">Hoạt động phát triển vốn từ, kỹ năng giao tiếp</p>
                  </div>

                  <div className="border-l-4 border-[#9F86D9] pl-4 py-2">
                    <h4 className="font-bold mb-2">Chương 4: Kỹ năng xã hội (Trang 21-25)</h4>
                    <p className="text-sm text-[#646667]">Rèn luyện kỹ năng sống, làm việc nhóm, cảm xúc</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && product.id && (
              <div>
                {showReviewForm ? (
                  <ReviewForm
                    productId={product.id}
                    productName={product.name}
                    onSuccess={() => {
                      setShowReviewForm(false);
                      // Refresh review list by re-mounting
                      setActiveTab('description');
                      setTimeout(() => setActiveTab('reviews'), 0);
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                ) : (
                  <ReviewList
                    productId={product.id}
                    onWriteReview={() => setShowReviewForm(true)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Download Stats */}
          <div className="w-[336px]">
            <h3 className="text-base font-bold text-[#9F86D9] mb-4">Thống kê</h3>
            <div className="bg-[#EFF2F3] rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#646667]">Lượt tải:</span>
                <span className="text-lg font-bold text-[#1C1D1D]">247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#646667]">Đánh giá:</span>
                <span className="text-lg font-bold text-[#1C1D1D]">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#646667]">Đánh giá TB:</span>
                <span className="text-lg font-bold text-[#1C1D1D]">4.8/5</span>
              </div>
            </div>

            <div className="mt-6 bg-[#F5F2FF] rounded-lg p-6">
              <h4 className="text-sm font-bold text-[#1C1D1D] mb-3">💡 Mẹo sử dụng</h4>
              <ul className="space-y-2 text-xs text-[#646667]">
                <li>• In file ra giấy A4 để dễ thực hành</li>
                <li>• Làm theo từng chương một cách tuần tự</li>
                <li>• Dành 15-20 phút mỗi ngày cho bé</li>
                <li>• Khen ngợi và động viên bé thường xuyên</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Related Free Resources */}
      <div className="max-w-[1434px] mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold text-[#1C1D1D] mb-8">Tài liệu miễn phí khác</h2>
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="group cursor-pointer">
              <div className="bg-[#EFF2F3] rounded-lg h-48 mb-4 flex items-center justify-center">
                <svg width="60" height="60" viewBox="0 0 120 120" fill="none">
                  <rect width="120" height="120" rx="8" fill="#9F86D9"/>
                  <text x="60" y="70" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">PDF</text>
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2">Tài liệu học tập số {item}</h3>
              <p className="text-[#39F5C4] font-bold">MIỄN PHÍ</p>
            </div>
          ))}
        </div>
      </div>

      {/* Instagram Feed */}
      <InstagramFeed />
    </div>
  );
};

export default ProductDetailPDF;
