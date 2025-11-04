import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { productService, type ProductsResponse, createEmptyRatingCounts, type RatingCounts } from '../services/productService';
import type { ShopFilters, SortBy, PaginationParams, ViewMode } from '../types/shop';
import type { ProductRatingSummary } from '../types/review';

interface ShopContextType {
  // Filters
  filters: ShopFilters;
  setFilters: (filters: ShopFilters) => void;
  toggleCategory: (categoryId: number) => void;
  setPriceRange: (from: number, to: number | null) => void;
  setMinRating: (rating: number | null) => void;
  clearFilters: () => void;
  
  // Sorting
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  
  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Pagination
  pagination: PaginationParams;
  setPage: (page: number) => void;
  
  // Products
  productsResponse: ProductsResponse | null;
  loading: boolean;
  error: string | null;
  ratingCounts: RatingCounts;
  productRatings: Record<number, ProductRatingSummary>;
  
  // Actions
  refreshProducts: () => void;
}

const defaultFilters: ShopFilters = {
  categoryIds: [],
  priceRange: null,
  minRating: null,
  searchKeyword: '',
};

const defaultPagination: PaginationParams = {
  page: 1,
  pageSize: 12,
  totalItems: 0,
  totalPages: 0,
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<ShopFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortBy>('latest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [pagination, setPagination] = useState<PaginationParams>(defaultPagination);
  const [productsResponse, setProductsResponse] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingCounts, setRatingCounts] = useState<RatingCounts>(createEmptyRatingCounts());
  const [productRatings, setProductRatings] = useState<Record<number, ProductRatingSummary>>({});

  // Fetch products whenever filters, sorting, or pagination changes
  useEffect(() => {
    fetchProducts();
  }, [filters, sortBy, pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        categoryIds: filters.categoryIds,
        minPrice: filters.priceRange?.from,
        maxPrice: filters.priceRange?.to || undefined,
        minRating: filters.minRating || undefined,
        searchKeyword: filters.searchKeyword || undefined,
        sortBy,
        page: pagination.page,
        pageSize: pagination.pageSize,
        published: true,
      };

      const response = await productService.getFilteredProducts(queryParams);
      setProductsResponse(response);
      setRatingCounts(response.ratingCounts);
      setProductRatings((prev) => ({ ...prev, ...response.productRatings }));
      setPagination({
        page: response.currentPage,
        pageSize: response.pageSize,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setFilters(prev => {
      const categoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      return { ...prev, categoryIds };
    });
    // Reset to page 1 when filter changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const setPriceRange = (from: number, to: number | null) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { from, to },
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const setMinRating = (rating: number | null) => {
    setFilters(prev => ({
      ...prev,
      minRating: rating,
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshProducts = () => {
    fetchProducts();
  };

  return (
    <ShopContext.Provider
      value={{
        filters,
        setFilters,
        toggleCategory,
        setPriceRange,
        setMinRating,
        clearFilters,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        pagination,
        setPage,
        productsResponse,
        loading,
        error,
        ratingCounts,
        productRatings,
        refreshProducts,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
