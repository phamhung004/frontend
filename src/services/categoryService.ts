import api from './api';

export interface Category {
  id?: number;
  slug: string;
  name: string;
  description?: string;
  parentId?: number;
  parentName?: string;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
  children?: Category[];
  productCount?: number;
}

export interface CategoryRequest {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  displayOrder: number;
}

class CategoryService {
  private basePath = '/categories';

  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>(this.basePath);
      console.log('Categories fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await api.get<Category>(`${this.basePath}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  }

  async createCategory(categoryData: CategoryRequest): Promise<Category> {
    try {
      const response = await api.post<Category>(this.basePath, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id: number, categoryData: CategoryRequest): Promise<Category> {
    try {
      const response = await api.put<Category>(`${this.basePath}/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      await api.delete(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    try {
      const response = await api.get<Category>(`${this.basePath}/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category by slug ${slug}:`, error);
      throw error;
    }
  }

  async getTopLevelCategories(): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>(`${this.basePath}/top-level`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top-level categories:', error);
      throw error;
    }
  }
}

export default new CategoryService();
