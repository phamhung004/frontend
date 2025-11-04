import api from './api';
import reviewService from './reviewService';
import type { Product, ProductDetail, ProductRequest, ProductVariant } from '../types/product';
import type { ProductQueryParams } from '../types/shop';
import type { ProductRatingSummary, ReviewStats } from '../types/review';

export interface ProductsResponse {
  products: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  ratingCounts: RatingCounts;
  productRatings: Record<number, ProductRatingSummary>;
}

export type RatingKey = 1 | 2 | 3 | 4 | 5;
export type RatingCounts = Record<RatingKey, number>;

export const createEmptyRatingCounts = (): RatingCounts => ({
  5: 0,
  4: 0,
  3: 0,
  2: 0,
  1: 0,
});

const reviewStatsCache = new Map<number, ReviewStats | null>();

const getCachedReviewStats = async (productId: number): Promise<ReviewStats | null> => {
  if (reviewStatsCache.has(productId)) {
    return reviewStatsCache.get(productId) ?? null;
  }

  try {
    const stats = await reviewService.getProductReviewStats(productId);
    reviewStatsCache.set(productId, stats);
    return stats;
  } catch (error) {
    console.error(`Error fetching review stats for product ${productId}:`, error);
    reviewStatsCache.set(productId, null);
    return null;
  }
};

const computeRatingCounts = (products: Product[], statsMap: Record<number, ReviewStats | null>): RatingCounts => {
  const counts = createEmptyRatingCounts();

  products.forEach((product) => {
    const stats = statsMap[product.id];
    if (!stats || stats.totalReviews === 0) {
      return;
    }

    const rounded = Math.round(stats.averageRating);
    if (rounded >= 1 && rounded <= 5) {
      const bucket = rounded as RatingKey;
      counts[bucket] += 1;
    }
  });

  return counts;
};

export const productService = {
  // Get all products with filters and pagination
  getAllProducts: async (published?: boolean): Promise<Product[]> => {
    const params = published !== undefined ? { published } : {};
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get products with advanced filtering, sorting, and pagination
  getFilteredProducts: async (queryParams: ProductQueryParams): Promise<ProductsResponse> => {
    try {
      const params: Record<string, any> = {};

      if (queryParams.published !== undefined) {
        params.published = queryParams.published;
      }

      if (queryParams.categoryIds && queryParams.categoryIds.length === 1) {
        params.categoryId = queryParams.categoryIds[0];
      }

      if (queryParams.searchKeyword) {
        params.keyword = queryParams.searchKeyword;
      }

      const response = await api.get('/products', { params });
      let products: Product[] = response.data;

      if (queryParams.categoryIds && queryParams.categoryIds.length > 0) {
        const selectedCategoryIds = new Set(queryParams.categoryIds);
        products = products.filter((product) => {
          if (product.categoryId == null) {
            return false;
          }
          return selectedCategoryIds.has(product.categoryId);
        });
      }

      const ratingStatsMap: Record<number, ReviewStats | null> = {};
      if (products.length > 0) {
        await Promise.all(
          products.map(async (product) => {
            ratingStatsMap[product.id] = await getCachedReviewStats(product.id);
          })
        );
      }

      if (queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined) {
        products = products.filter((product) => {
          const price = product.finalPrice ?? product.salePrice ?? product.regularPrice;
          if (queryParams.minPrice !== undefined && price < queryParams.minPrice) {
            return false;
          }
          if (queryParams.maxPrice !== undefined && price > queryParams.maxPrice) {
            return false;
          }
          return true;
        });
      }

      const ratingCounts = computeRatingCounts(products, ratingStatsMap);

      if (queryParams.minRating !== undefined && queryParams.minRating !== null) {
        products = products.filter((product) => {
          const stats = ratingStatsMap[product.id];
          if (!stats || stats.totalReviews === 0) {
            return false;
          }

          const rounded = Math.round(stats.averageRating);
          if (rounded < 1 || rounded > 5) {
            return false;
          }

          const bucket = rounded as RatingKey;
          return bucket === queryParams.minRating;
        });
      }

      if (queryParams.sortBy) {
        products = [...products].sort((a, b) => {
          const priceA = a.finalPrice ?? a.salePrice ?? a.regularPrice;
          const priceB = b.finalPrice ?? b.salePrice ?? b.regularPrice;

          switch (queryParams.sortBy) {
            case 'price-asc':
              return priceA - priceB;
            case 'price-desc':
              return priceB - priceA;
            case 'name-asc':
              return a.name.localeCompare(b.name);
            case 'name-desc':
              return b.name.localeCompare(a.name);
            case 'rating': {
              const ratingA = ratingStatsMap[a.id]?.averageRating ?? 0;
              const ratingB = ratingStatsMap[b.id]?.averageRating ?? 0;
              return ratingB - ratingA;
            }
            case 'latest':
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            default:
              return 0;
          }
        });
      }

      const page = queryParams.page || 1;
      const pageSize = queryParams.pageSize || 12;
      const totalItems = products.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = products.slice(startIndex, endIndex);

      const productRatings: Record<number, ProductRatingSummary> = {};
      paginatedProducts.forEach((product) => {
        const stats = ratingStatsMap[product.id];
        if (stats) {
          productRatings[product.id] = {
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews,
          };
        }
      });

      return {
        products: paginatedProducts,
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
        ratingCounts,
        productRatings,
      };
    } catch (error) {
      console.error('Error fetching filtered products:', error);
      throw error;
    }
  },

  // Get product by ID (detailed information)
  getProductById: async (id: number): Promise<ProductDetail> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get product by slug
  getProductBySlug: async (slug: string): Promise<ProductDetail> => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  // Search products
  searchProducts: async (keyword: string): Promise<Product[]> => {
    const response = await api.get('/products/search', {
      params: { keyword }
    });
    return response.data;
  },

  // Create product
  createProduct: async (data: ProductRequest): Promise<ProductDetail> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Update product
  updateProduct: async (id: number, data: ProductRequest): Promise<ProductDetail> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Toggle landing page for a product
  toggleLandingPage: async (id: number): Promise<ProductDetail> => {
    const response = await api.patch(`/products/${id}/toggle-landing`);
    return response.data;
  },

  // Get all product variants (optional product filter handled server-side)
  getAllVariants: async (): Promise<ProductVariant[]> => {
    const response = await api.get<ProductVariant[]>('/products/variants');
    return response.data;
  },

  // Get variants for a specific product
  getVariantsByProduct: async (productId: number): Promise<ProductVariant[]> => {
    const response = await api.get<ProductVariant[]>('/products/variants', {
      params: { productId }
    });
    return response.data;
  }
};
