import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import categoryService, { type Category } from '../../services/categoryService';
import { formatCurrency } from '../../utils/currency';
import { useShop } from '../../contexts/ShopContext';
import type { RatingKey } from '../../services/productService';

interface ShopSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const ShopSidebar = ({ isOpen = true, onClose }: ShopSidebarProps) => {
  const { t } = useTranslation();
  const loadErrorMessage = t('shop.categoriesLoadError');
  const noCategoriesMessage = t('shop.noCategories');
  
  const { filters, toggleCategory, setPriceRange, setMinRating, clearFilters, ratingCounts } = useShop();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [priceSliderValues, setPriceSliderValues] = useState<[number, number]>([0, 500000]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await categoryService.getAllCategories();
        if (!isMounted) {
          return;
        }
        const rootCategories = data
          .filter((category) => category.parentId == null)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        setCategories(rootCategories);
        setCategoryError(null);
      } catch (error) {
        console.error('Failed to load categories for shop sidebar:', error);
        if (isMounted) {
          setCategoryError(loadErrorMessage);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [loadErrorMessage]);

  const priceRanges = [
    { from: 0, to: 50000, count: 12 },
    { from: 50000, to: 100000, count: 24 },
    { from: 100000, to: 150000, count: 54 },
    { from: 150000, to: 200000, count: 78 },
    { from: 200000, to: null, count: 125 },
  ];
  const ratingOptions: RatingKey[] = [5, 4, 3, 2, 1];

  const totalRatings = useMemo(
    () => Object.values(ratingCounts).reduce((total, count) => total + count, 0),
    [ratingCounts]
  );

  const itemsLabel = t('shop.items') || 'sản phẩm';

  const renderRatingStars = (filledStars: number) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill={index < filledStars ? '#FCC605' : '#E5E7EB'}
        >
          <path d="M10 0l2.5 6.5H20l-5.5 4.5 2 6.5L10 13l-6.5 4.5 2-6.5L0 6.5h7.5z" />
        </svg>
      ))}
    </div>
  );

  // Handle category toggle
  const handleCategoryClick = (categoryId: number | undefined) => {
    if (typeof categoryId !== 'number') {
      return;
    }
    toggleCategory(categoryId);
  };

  // Handle price range click
  const handlePriceRangeClick = (from: number, to: number | null) => {
    if (filters.priceRange?.from === from && filters.priceRange?.to === to) {
      // If already selected, clear the filter
      setPriceRange(0, null);
    } else {
      setPriceRange(from, to);
    }
  };

  // Handle rating filter click
  const handleRatingClick = (rating: number) => {
    if (filters.minRating === rating) {
      // If already selected, clear the filter
      setMinRating(null);
    } else {
      setMinRating(rating);
    }
  };

  // Check if a price range is selected
  const isPriceRangeSelected = (from: number, to: number | null) => {
    return filters.priceRange?.from === from && filters.priceRange?.to === to;
  };

  // Check if a rating is selected
  const isRatingSelected = (rating: number) => {
    return filters.minRating === rating;
  };

  // Update price slider when filter changes
  useEffect(() => {
    if (filters.priceRange) {
      setPriceSliderValues([
        filters.priceRange.from,
        filters.priceRange.to || 500000
      ]);
    }
  }, [filters.priceRange]);

  // Has any filters applied
  const hasFilters = filters.categoryIds.length > 0 || 
                     filters.priceRange !== null || 
                     filters.minRating !== null;

  // Mobile overlay and modal wrapper
  const sidebarContent = (
    <>
      {/* Clear Filters Button */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-900 transition-colors"
        >
          {t('shop.clearFilters') || 'Xóa bộ lọc'}
        </button>
      )}

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{t('shop.categoriesTitle')}</h3>
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
          </svg>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {isLoadingCategories
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-6 bg-gray-100 rounded animate-pulse"></div>
              ))
            : categoryError
              ? <p className="text-sm text-red-500">{categoryError}</p>
              : categories.length === 0
                ? <p className="text-sm text-gray-500">{noCategoriesMessage}</p>
                : categories.map((category) => {
                    if (category.id == null) {
                      return null;
                    }
                    const isSelected = filters.categoryIds.includes(category.id);
                    return (
                      <div
                        key={category.id}
                        className={`flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'text-[#9F86D9] font-medium' : 'hover:text-[#9F86D9]'
                        }`}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleCategoryClick(category.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleCategoryClick(category.id);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => {
                              event.stopPropagation();
                              handleCategoryClick(category.id);
                            }}
                            onClick={(event) => event.stopPropagation()}
                            className="w-4 h-4 text-[#9F86D9] border-gray-300 rounded focus:ring-[#9F86D9]"
                          />
                          <span className="text-sm sm:text-base">{category.name}</span>
                        </div>
                        {typeof category.productCount === 'number' && (
                          <span className={`px-2 py-1 rounded text-sm ${
                            isSelected ? 'bg-[#9F86D9] text-white' : 'bg-gray-100 text-gray-900'
                          }`}>
                            {category.productCount}
                          </span>
                        )}
                      </div>
                    );
                  })}
        </div>
        <div className="w-full h-px bg-gray-200 mt-4 sm:mt-6"></div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{t('shop.price')}</h3>
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
          </svg>
        </div>
        <div className="mb-3 sm:mb-4">
          <div className="relative w-full h-1 bg-gray-200 rounded">
            <div 
              className="absolute h-full bg-[#9F86D9] rounded" 
              style={{ 
                left: `${(priceSliderValues[0] / 500000) * 100}%`,
                width: `${((priceSliderValues[1] - priceSliderValues[0]) / 500000) * 100}%`
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs sm:text-sm">
            <span className="text-gray-500">{t('shop.priceRange')}</span>
            <span className="text-gray-900">
              {formatCurrency(priceSliderValues[0])} - {formatCurrency(priceSliderValues[1])}
            </span>
          </div>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {priceRanges.map((range, index) => {
            const isSelected = isPriceRangeSelected(range.from, range.to);
            return (
              <div 
                key={index} 
                className={`flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? 'text-[#9F86D9] font-medium' : 'hover:text-[#9F86D9]'
                }`}
                onClick={() => handlePriceRangeClick(range.from, range.to)}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 text-[#9F86D9] border-gray-300 focus:ring-[#9F86D9]"
                  />
                  <span className="text-base">
                    {range.to ? `${formatCurrency(range.from)} - ${formatCurrency(range.to)}` : `${t('shop.over') || 'Trên'} ${formatCurrency(range.from)}`}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  isSelected ? 'bg-[#9F86D9] text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  {range.count}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full h-px bg-gray-200 mt-4 sm:mt-6"></div>
      </div>

      {/* Rating */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{t('shop.ratingTitle')}</h3>
          <span className="text-xs text-gray-500">
            {totalRatings > 0 ? `${totalRatings} ${itemsLabel}` : t('shop.noRatings') || 'Chưa có dữ liệu'}
          </span>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {ratingOptions.map((star) => {
            const isSelected = isRatingSelected(star);
            const count = ratingCounts[star] ?? 0;
            const isDisabled = count === 0;

            return (
              <div
                key={star}
                className={`flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-colors border ${
                  isSelected
                    ? 'border-[#9F86D9] bg-[#F6F1FF] text-[#4B3E82]'
                    : 'border-gray-200 hover:border-[#9F86D9] hover:bg-[#F6F1FF]'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed hover:border-gray-200 hover:bg-transparent' : ''}`}
                onClick={() => {
                  if (!isDisabled) {
                    handleRatingClick(star);
                  }
                }}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                onKeyDown={(event) => {
                  if (isDisabled) {
                    return;
                  }
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleRatingClick(star);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => {}}
                    className="w-4 h-4 text-[#9F86D9] border-gray-300 focus:ring-[#9F86D9]"
                  />
                  {renderRatingStars(star)}
                  <span className="text-sm text-gray-900">{t('shop.ratingLabel', { count: star }) || `${star} sao`}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  isSelected ? 'bg-[#9F86D9] text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full h-px bg-gray-200 mt-6"></div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mobile: Slide-up Drawer */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 max-h-[85vh] overflow-y-auto ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">
            {t('shop.filters') || 'Bộ lọc'}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 space-y-6">
          {sidebarContent}
        </div>

        {/* Drawer Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
          <button
            onClick={clearFilters}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-900 transition-colors"
          >
            {t('shop.reset') || 'Đặt lại'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-[#9F86D9] hover:bg-[#8a6fc9] text-white rounded-lg text-sm font-medium transition-colors"
          >
            {t('shop.applyFilters') || 'Áp dụng'}
          </button>
        </div>
      </div>

      {/* Desktop: Regular Sidebar */}
      <aside className="hidden lg:block w-[306px] flex-shrink-0 space-y-8">
        {sidebarContent}
      </aside>
    </>
  );
};

export default ShopSidebar;
