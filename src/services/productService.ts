import api from './api';
import type { Product, ProductDetail, ProductRequest, ProductVariant } from '../types/product';
import type { ProductQueryParams } from '../types/shop';

export interface ProductsResponse {
  products: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

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
      // Build query parameters
      const params: Record<string, any> = {};
      
      if (queryParams.published !== undefined) {
        params.published = queryParams.published;
      }
      
      if (queryParams.categoryIds && queryParams.categoryIds.length > 0) {
        // For now, we'll filter by the first category ID
        // Backend would need to support multiple category filtering
        params.categoryId = queryParams.categoryIds[0];
      }
      
      if (queryParams.searchKeyword) {
        params.keyword = queryParams.searchKeyword;
      }

      // Fetch all products (since backend doesn't support pagination yet)
      const response = await api.get('/products', { params });
      let products: Product[] = response.data;

      // Client-side filtering for price range
      if (queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined) {
        products = products.filter(product => {
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

      // Client-side filtering for rating (if needed in the future)
      // Currently products don't have rating field, so we skip this

      // Client-side sorting
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
            case 'latest':
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            default:
              return 0;
          }
        });
      }

      // Client-side pagination
      const page = queryParams.page || 1;
      const pageSize = queryParams.pageSize || 12;
      const totalItems = products.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProducts = products.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        totalItems,
        totalPages,
        currentPage: page,
        pageSize
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
