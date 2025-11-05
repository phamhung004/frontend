import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/currency';
import type { Product } from '../../types/product';
import { useState, useEffect, useRef } from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useShop } from '../../contexts/ShopContext';
import type { SortBy } from '../../types/shop';
import Pagination from './Pagination';

interface ProductGridProps {
  onFilterClick?: () => void;
}

const ProductGrid = ({ onFilterClick }: ProductGridProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { 
    productsResponse, 
    loading, 
    error, 
    sortBy, 
    setSortBy, 
    viewMode, 
    setViewMode,
    productRatings
  } = useShop();
  
  const [togglingWishlist, setTogglingWishlist] = useState<number | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const products = productsResponse?.products || [];

  const sortOptions: Array<{ value: SortBy; label: string }> = [
    { value: 'latest', label: t('shop.sortLatest') || 'Mới nhất' },
    { value: 'price-asc', label: t('shop.sortPriceAsc') || 'Giá: Thấp đến cao' },
    { value: 'price-desc', label: t('shop.sortPriceDesc') || 'Giá: Cao đến thấp' },
    { value: 'name-asc', label: t('shop.sortNameAsc') || 'Tên: A-Z' },
    { value: 'name-desc', label: t('shop.sortNameDesc') || 'Tên: Z-A' },
    { value: 'rating', label: t('shop.sortRating') || 'Đánh giá cao' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || sortOptions[0].label;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDropdown]);

  const getBadgeColor = (badge: string | null) => {
    if (!badge) return '';
    if (badge === 'Hot') return 'bg-[#E35946]';
    if (badge === 'Sale') return 'bg-[#EDA62A]';
    if (badge === 'Trending') return 'bg-[#9F86D9]';
    if (badge === 'Free') return 'bg-[#39F5C4]';
    return 'bg-[#EDA62A]';
  };

  const getDisplayPrice = (product: Product) => {
    if (product.finalPrice !== null && product.finalPrice !== undefined) {
      return product.finalPrice;
    }
    const base = product.basePrice ?? product.salePrice ?? product.regularPrice ?? 0;
    return base;
  };

  const getOriginalPrice = (product: Product) => {
    const base = product.basePrice ?? product.regularPrice ?? product.salePrice ?? null;
    if (!base) return null;
    const final = product.finalPrice ?? base;
    if (Math.abs(base - final) < 0.01) {
      return null;
    }
    return base;
  };

  const renderDiscountTag = (product: Product) => {
    const discount = product.activeDiscount;
    if (!discount || !product.discountAmount || product.discountAmount <= 0) {
      return null;
    }
    return (
      <div className="mt-1 text-xs font-medium text-[#E35946]">
        {discount.discountType === 'PERCENTAGE'
          ? `-${discount.discountValue}%`
          : `-${formatCurrency(product.discountAmount ?? 0)}`}
      </div>
    );
  };

  const renderRatingStars = (rating: number) => {
    const clamped = Math.max(0, Math.min(5, rating));
    const percentage = (clamped / 5) * 100;

    return (
      <div className="relative flex">
        <div className="flex text-gray-300">
          {Array.from({ length: 5 }).map((_, index) => (
            <svg key={`empty-${index}`} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 0l2.5 6.5H20l-5.5 4.5 2 6.5L10 13l-6.5 4.5 2-6.5L0 6.5h7.5z" />
            </svg>
          ))}
        </div>
        <div
          className="absolute inset-0 overflow-hidden text-[#FCC605]"
          style={{ width: `${percentage}%` }}
        >
          <div className="flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <svg key={`filled-${index}`} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0l2.5 6.5H20l-5.5 4.5 2 6.5L10 13l-6.5 4.5 2-6.5L0 6.5h7.5z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation(); // Prevent navigation to product detail
    
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    try {
      setTogglingWishlist(productId);
      await toggleWishlist(productId);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setTogglingWishlist(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9F86D9] mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading') || 'Đang tải...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#9F86D9] text-white px-6 py-2 rounded hover:bg-[#8a6fc9]"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Filter Bar */}
      <div className="mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-8 w-full sm:w-auto overflow-x-auto">
            {/* Mobile Filter Button */}
            <button
              onClick={onFilterClick}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#9F86D9] text-white rounded-lg text-sm font-medium hover:bg-[#8a6fc9] transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Bộ lọc</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex-shrink-0" ref={sortDropdownRef}>
              <button 
                className="flex items-center gap-2 text-xs sm:text-sm text-gray-900 hover:text-[#9F86D9] whitespace-nowrap"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                <span className="hidden sm:inline">{currentSortLabel}</span>
                <span className="sm:hidden">Sắp xếp</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        sortBy === option.value ? 'text-[#9F86D9] font-medium' : 'text-gray-900'
                      }`}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Item Count */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                {productsResponse?.totalItems || 0} {t('shop.items')}
              </span>
            </div>
            {/* View Mode Toggle */}
            <div className="hidden sm:flex gap-2 flex-shrink-0">
              <button 
                className={`p-2 border rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'border-[#9F86D9] bg-[#9F86D9] text-white' 
                    : 'border-gray-200 hover:border-[#9F86D9]'
                }`}
                onClick={() => setViewMode('grid')}
                title={t('shop.gridView') || 'Dạng lưới'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button 
                className={`p-2 border rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'border-[#9F86D9] bg-[#9F86D9] text-white' 
                    : 'border-gray-200 hover:border-[#9F86D9]'
                }`}
                onClick={() => setViewMode('list')}
                title={t('shop.listView') || 'Dạng danh sách'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h4M4 12h4M4 18h4M12 6h8M12 12h8M12 18h8" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-gray-900 w-full sm:w-auto text-left sm:text-right">
            {productsResponse && productsResponse.totalItems > 0
              ? t('shop.showingResults', {
                  from: (productsResponse.currentPage - 1) * productsResponse.pageSize + 1,
                  to: Math.min(productsResponse.currentPage * productsResponse.pageSize, productsResponse.totalItems),
                  total: productsResponse.totalItems
                }) || `Hiển thị ${(productsResponse.currentPage - 1) * productsResponse.pageSize + 1}–${Math.min(productsResponse.currentPage * productsResponse.pageSize, productsResponse.totalItems)} trong ${productsResponse.totalItems} kết quả`
              : t('shop.noResults') || 'Không có kết quả'}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9F86D9] mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading') || 'Đang tải...'}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#9F86D9] text-white px-6 py-2 rounded hover:bg-[#8a6fc9]"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && products.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">{t('shop.noProducts') || 'Không tìm thấy sản phẩm'}</p>
            <p className="text-gray-500 text-sm">{t('shop.tryDifferentFilters') || 'Thử thay đổi bộ lọc của bạn'}</p>
          </div>
        </div>
      )}

      {/* Product Grid/List */}
      {!loading && !error && products.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12' : 'space-y-4 sm:space-y-6 mb-12'}>
          {products.map((product) => {
            const isPdfProduct = product.productType === 'PDF';
            
            if (viewMode === 'list') {
              // List View
              return (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(isPdfProduct ? `/product-pdf/${product.id}` : `/product/${product.id}`)}
                >
                  <div className="relative w-full sm:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={product.thumbnailUrl || '/images/placeholder.webp'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.badgeLabel && (
                      <div className={`absolute top-2 left-2 ${getBadgeColor(product.badgeLabel)} text-white text-xs font-bold px-3 py-1 rounded`}>
                        {product.badgeLabel}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        {renderRatingStars(productRatings[product.id]?.averageRating ?? 0)}
                        <span className="text-xs text-gray-500">
                          {productRatings[product.id]?.totalReviews ?? 0}{' '}
                          {t('shop.reviewsLabel') || 'đánh giá'}
                        </span>
                      </div>
                      {product.shortDescription && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.shortDescription}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-end">
                        <p className="text-[#9F86D9] font-bold text-xl">
                          {isPdfProduct && (getDisplayPrice(product) === 0)
                            ? 'MIỄN PHÍ'
                            : formatCurrency(getDisplayPrice(product))}
                        </p>
                        {getOriginalPrice(product) !== null && (
                          <p className="text-sm text-gray-400 line-through">
                            {formatCurrency(getOriginalPrice(product) ?? 0)}
                          </p>
                        )}
                        {renderDiscountTag(product)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleWishlistToggle(e, product.id)}
                          disabled={togglingWishlist === product.id}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
                            isInWishlist(product.id)
                              ? 'bg-[#9F86D9] text-white border-[#9F86D9]'
                              : 'bg-white border-gray-200 hover:bg-[#9F86D9] hover:text-white hover:border-[#9F86D9]'
                          }`}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? 'white' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <button className="px-6 py-2 bg-[#9F86D9] text-white font-bold rounded hover:bg-[#8a6fc9] transition-colors">
                          {t('shop.addToCart')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Grid View (existing code)
            return (
              <div 
                key={product.id} 
                className="group cursor-pointer"
                onClick={() => navigate(isPdfProduct ? `/product-pdf/${product.id}` : `/product/${product.id}`)}
              >
                <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 sm:mb-6">
                  <img
                    src={product.thumbnailUrl || '/images/placeholder.webp'}
                    alt={product.name}
                    className="w-full h-48 sm:h-64 md:h-80 lg:h-[397px] object-cover"
                  />
                  {product.badgeLabel && (
                    <div className={`absolute top-3 left-3 sm:top-5 sm:left-5 ${getBadgeColor(product.badgeLabel)} text-white text-xs font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded`}>
                      {product.badgeLabel}
                    </div>
                  )}
                  {/* Hover Actions */}
                  <div className="absolute right-3 top-3 sm:right-5 sm:top-5 flex flex-col space-y-2 sm:space-y-3 opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleWishlistToggle(e, product.id)}
                      disabled={togglingWishlist === product.id}
                      className={`w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center transition-colors border border-gray-200 ${
                        isInWishlist(product.id)
                          ? 'text-[#9F86D9] ring-1 ring-[#9F86D9]'
                          : 'hover:bg-[#9F86D9] hover:text-white'
                      } ${togglingWishlist === product.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={isInWishlist(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill={isInWishlist(product.id) ? '#9F86D9' : 'none'}
                        stroke={isInWishlist(product.id) ? '#9F86D9' : 'currentColor'}
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full items-center justify-center hover:bg-[#9F86D9] hover:text-white">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full items-center justify-center hover:bg-[#9F86D9] hover:text-white">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </button>
                  </div>
                  {/* Add to Cart Button */}
                  <button className="hidden md:block absolute bottom-3 sm:bottom-5 left-1/2 transform -translate-x-1/2 w-[calc(100%-24px)] sm:w-[calc(100%-40px)] bg-[#9F86D9] text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded text-sm sm:text-base opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('shop.addToCart')}
                  </button>
                </div>
                <div className="text-center px-2">
                  <h3 className="font-bold text-sm sm:text-base mb-2 truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 sm:gap-2 justify-center mb-2">
                    {renderRatingStars(productRatings[product.id]?.averageRating ?? 0)}
                    <span className="text-xs text-gray-500">
                      {productRatings[product.id]?.totalReviews ?? 0}{' '}
                      {t('shop.reviewsLabel') || 'đánh giá'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-[#9F86D9] font-normal text-base sm:text-lg">
                      {isPdfProduct && getDisplayPrice(product) === 0
                        ? 'MIỄN PHÍ'
                        : formatCurrency(getDisplayPrice(product))}
                    </p>
                    {getOriginalPrice(product) !== null && (
                      <p className="text-xs sm:text-sm text-gray-400 line-through">
                        {formatCurrency(getOriginalPrice(product) ?? 0)}
                      </p>
                    )}
                    {renderDiscountTag(product)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && products.length > 0 && <Pagination />}
    </div>
  );
};

export default ProductGrid;
