import { useState } from 'react';
import { Filter, X, Star } from 'lucide-react';

export interface ProductFilters {
  categories?: number[];
  priceRange?: {
    min: number;
    max: number;
  };
  minRating?: number;
  inStock?: boolean;
}

interface ProductFilterPanelProps {
  categories?: Array<{ id: number; name: string }>;
  onFilterChange: (filters: ProductFilters) => void;
  initialFilters?: ProductFilters;
  className?: string;
}

const ProductFilterPanel = ({
  categories = [],
  onFilterChange,
  initialFilters = {},
  className = ''
}: ProductFilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    initialFilters.categories || []
  );
  const [priceMin, setPriceMin] = useState<string>(
    initialFilters.priceRange?.min?.toString() || ''
  );
  const [priceMax, setPriceMax] = useState<string>(
    initialFilters.priceRange?.max?.toString() || ''
  );
  const [minRating, setMinRating] = useState<number | undefined>(
    initialFilters.minRating
  );
  const [inStock, setInStock] = useState<boolean>(
    initialFilters.inStock || false
  );

  const toggleCategory = (categoryId: number) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newCategories);
  };

  const handleApplyFilters = () => {
    const filters: ProductFilters = {};

    if (selectedCategories.length > 0) {
      filters.categories = selectedCategories;
    }

    const minPrice = priceMin ? Number.parseFloat(priceMin) : undefined;
    const maxPrice = priceMax ? Number.parseFloat(priceMax) : undefined;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.priceRange = {
        min: minPrice || 0,
        max: maxPrice || Number.MAX_SAFE_INTEGER
      };
    }

    if (minRating !== undefined) {
      filters.minRating = minRating;
    }

    if (inStock) {
      filters.inStock = true;
    }

    onFilterChange(filters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceMin('');
    setPriceMax('');
    setMinRating(undefined);
    setInStock(false);
    onFilterChange({});
  };

  const activeFiltersCount = 
    selectedCategories.length +
    (priceMin || priceMax ? 1 : 0) +
    (minRating ? 1 : 0) +
    (inStock ? 1 : 0);

  return (
    <div className={className}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-5 h-5" />
        <span className="font-medium">Bộ lọc</span>
        {activeFiltersCount > 0 && (
          <span className="px-2 py-0.5 text-xs bg-brand-purple text-white rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
          {/* Backdrop (mobile only) */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-xl lg:absolute lg:top-full lg:mt-2 lg:rounded-lg overflow-y-auto animate-slideInRight lg:animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Bộ lọc sản phẩm</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="p-4 space-y-6">
              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Danh mục</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="w-4 h-4 text-brand-purple rounded focus:ring-brand-purple"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <h4 className="font-semibold mb-3">Khoảng giá</h4>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Đến"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="font-semibold mb-3">Đánh giá</h4>
                <div className="space-y-2">
                  {[5, 4, 3].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(minRating === rating ? undefined : rating)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        minRating === rating
                          ? 'border-brand-purple bg-purple-50'
                          : 'border-gray-200 hover:border-brand-purple'
                      }`}
                    >
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm">trở lên</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 text-brand-purple rounded focus:ring-brand-purple"
                  />
                  <span className="text-sm font-medium">Chỉ hiển thị sản phẩm còn hàng</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t space-y-2">
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-2 bg-brand-purple text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Áp dụng bộ lọc
              </button>
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilterPanel;
