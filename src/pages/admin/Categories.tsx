import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FolderIcon,
  TagIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import categoryService from '../../services/categoryService';
import type { Category, CategoryRequest } from '../../services/categoryService';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  displayOrder: string;
}

const Categories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    displayOrder: '0',
  });

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
      setFilteredCategories(data);
    } catch (err: any) {
      // Automatically fallback to mock data if API fails
      const errorMessage = err?.response?.status === 500 
        ? 'Backend server error. Using sample data.'
        : err?.message === 'Network Error'
        ? 'Cannot connect to backend. Using sample data.'
        : 'Failed to load categories. Using sample data.';
      
      setError(errorMessage);
      console.error('Error fetching categories:', err);
      // Fallback to mock data if API fails
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    const mockCategories: Category[] = [
      {
        id: 1,
        slug: 'clothing',
        name: 'Baby Clothing',
        description: 'Comfortable and safe clothing for babies',
        displayOrder: 1,
        createdAt: '2024-01-15T10:00:00',
        updatedAt: '2024-01-15T10:00:00',
      },
      {
        id: 2,
        slug: 'toys',
        name: 'Baby Toys',
        description: 'Educational and fun toys for development',
        displayOrder: 2,
        createdAt: '2024-01-16T10:00:00',
        updatedAt: '2024-01-16T10:00:00',
      },
      {
        id: 3,
        slug: 'feeding',
        name: 'Feeding & Nursing',
        description: 'Bottles, bibs, and feeding accessories',
        displayOrder: 3,
        createdAt: '2024-01-17T10:00:00',
        updatedAt: '2024-01-17T10:00:00',
      },
      {
        id: 4,
        slug: 'rompers',
        name: 'Rompers',
        description: 'Cute and comfy rompers',
        parentId: 1,
        parentName: 'Baby Clothing',
        displayOrder: 1,
        createdAt: '2024-01-18T10:00:00',
        updatedAt: '2024-01-18T10:00:00',
      },
      {
        id: 5,
        slug: 'bodysuits',
        name: 'Bodysuits',
        description: 'Essential bodysuits for daily wear',
        parentId: 1,
        parentName: 'Baby Clothing',
        displayOrder: 2,
        createdAt: '2024-01-19T10:00:00',
        updatedAt: '2024-01-19T10:00:00',
      },
    ];
    setCategories(mockCategories);
    setFilteredCategories(mockCategories);
  };

  // Search filter
  useEffect(() => {
    const filtered = categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId?.toString() || '',
        displayOrder: category.displayOrder.toString(),
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentId: '',
        displayOrder: '0',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: '',
      displayOrder: '0',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const categoryData: CategoryRequest = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
        displayOrder: parseInt(formData.displayOrder),
      };

      if (editingCategory && editingCategory.id) {
        await categoryService.updateCategory(editingCategory.id, categoryData);
      } else {
        await categoryService.createCategory(categoryData);
      }

      await fetchCategories();
      handleCloseModal();
    } catch (err) {
      setError('Failed to save category. Please try again.');
      console.error('Error saving category:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      setIsLoading(true);
      try {
        await categoryService.deleteCategory(id);
        await fetchCategories();
      } catch (err) {
        setError('Failed to delete category. Please try again.');
        console.error('Error deleting category:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get parent categories (categories without parent)
  const parentCategories = categories.filter((cat) => !cat.parentId);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-purple mb-2">{t('admin.categoriesManagement')}</h1>
        <p className="text-gray-600 text-sm">{t('admin.manageCategoriesSubcategories')}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg w-96">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Parent
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-purple"></div>
                    <span>Loading categories...</span>
                  </div>
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.parentId ? 'bg-orange-50' : 'bg-purple-50'}`}>
                        {category.parentId ? (
                          <TagIcon className="w-5 h-5 text-brand-orange" />
                        ) : (
                          <FolderIcon className="w-5 h-5 text-brand-purple" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {category.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    {category.parentName ? (
                      <span className="text-sm text-gray-600">{category.parentName}</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{category.displayOrder}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none"
                  placeholder="Enter category name"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none"
                  placeholder="category-slug"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly version of the name. Auto-generated from name.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="Enter category description"
                />
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none"
                >
                  <option value="">None (Top Level)</option>
                  {parentCategories
                    .filter((cat) => cat.id !== editingCategory?.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
