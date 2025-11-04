import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/currency';
import { useEffect } from 'react';
import { resolveProductPricing } from '../utils/pricing';

const Wishlist = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRemove = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9F86D9] mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading') || 'Đang tải...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sản phẩm yêu thích
          </h1>
          <p className="text-gray-600">
            {wishlistItems.length} sản phẩm
          </p>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg 
              className="w-24 h-24 mx-auto text-gray-300 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Danh sách yêu thích trống
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong danh sách yêu thích
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-[#9F86D9] text-white px-8 py-3 rounded-lg hover:bg-[#8a6fc9] transition-colors"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const itemPricing = resolveProductPricing(item.product);

              return (
              <div 
                key={item.id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div 
                  className="relative bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/product/${item.product.id}`)}
                >
                  <img
                    src={item.product.thumbnailUrl || '/images/placeholder.webp'}
                    alt={item.product.name}
                    className="w-full h-64 object-cover"
                  />
                  {item.product.badgeLabel && (
                    <div className="absolute top-3 left-3 bg-[#9F86D9] text-white text-xs font-bold px-3 py-1 rounded">
                      {item.product.badgeLabel}
                    </div>
                  )}
                  {/* Remove Button - Show on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.product.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    title="Xóa khỏi yêu thích"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 
                    className="font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-[#9F86D9]"
                    onClick={() => navigate(`/product/${item.product.id}`)}
                    title={item.product.name}
                  >
                    {item.product.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">★</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[#9F86D9] font-semibold text-lg">
                        {formatCurrency(itemPricing.finalPrice)}
                      </p>
                      {itemPricing.hasDiscount && (
                        <p className="text-gray-400 line-through text-sm">
                          {formatCurrency(itemPricing.basePrice)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/product/${item.product.id}`)}
                      className="flex-1 bg-[#9F86D9] text-white py-2 px-4 rounded hover:bg-[#8a6fc9] transition-colors text-sm font-medium"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.product.id);
                      }}
                      className="p-2 border border-gray-300 rounded hover:border-red-500 hover:text-red-500 transition-colors"
                      title="Xóa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/shop')}
              className="text-[#9F86D9] hover:text-[#8a6fc9] font-medium inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
