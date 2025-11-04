export interface PriceRange {
  from: number;
  to: number | null;
}

export interface ShopFilters {
  categoryIds: number[];
  priceRange: PriceRange | null;
  minRating: number | null;
  searchKeyword: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export type SortBy = 'latest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating';

export interface PaginationParams {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ProductQueryParams {
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  searchKeyword?: string;
  sortBy?: SortBy;
  page?: number;
  pageSize?: number;
  published?: boolean;
}

export type ViewMode = 'grid' | 'list';
