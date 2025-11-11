# UI/UX Improvements Implementation Guide

This document provides guidance on how to use the new UI/UX components added to the project.

## Components Overview

### 1. Loading Skeletons
Provide visual feedback while content is loading.

```tsx
import { ProductCardSkeleton, ProductGridSkeleton, ProductDetailSkeleton } from './components/ui';

// Single product card skeleton
<ProductCardSkeleton />

// Grid of product skeletons
<ProductGridSkeleton count={8} columns={4} />

// Product detail page skeleton
<ProductDetailSkeleton />
```

### 2. Quick View Modal
Show product details in a modal without navigating away from the current page.

```tsx
import QuickViewModal from './components/QuickViewModal';
import { useState } from 'react';

function ProductCard({ product }) {
  const [showQuickView, setShowQuickView] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowQuickView(true)}>
        Quick View
      </button>
      
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
}
```

### 3. Back to Top Button
Automatically displayed when user scrolls down. Already added globally in App.tsx.

```tsx
import BackToTop from './components/BackToTop';

// Basic usage (shows after 300px scroll)
<BackToTop />

// Custom threshold
<BackToTop showAfter={500} />
```

### 4. Breadcrumb Navigation
Display navigation hierarchy to improve user orientation.

```tsx
import Breadcrumb from './components/Breadcrumb';

function ProductDetail() {
  const breadcrumbItems = [
    { label: 'Cửa hàng', path: '/shop' },
    { label: 'Đồ chơi', path: '/shop?category=toys' },
    { label: 'Tên sản phẩm' } // Last item without path
  ];
  
  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      {/* Rest of content */}
    </div>
  );
}
```

### 5. Image Zoom
Interactive zoom on hover and click-to-fullscreen for product images.

```tsx
import ImageZoom from './components/ImageZoom';

function ProductGallery({ image }) {
  return (
    <ImageZoom
      src={image.url}
      alt={image.alt}
      className="rounded-lg"
    />
  );
}
```

### 6. Recently Viewed Products
Track and display products the user has viewed.

```tsx
import RecentlyViewed from './components/RecentlyViewed';
import recentlyViewedService from './services/recentlyViewedService';

// Add to recently viewed (typically in product detail page)
useEffect(() => {
  if (product) {
    recentlyViewedService.addProduct(product);
  }
}, [product]);

// Display recently viewed products
<RecentlyViewed 
  currentProductId={product.id} // Exclude current product
  maxItems={6}
  className="my-8"
/>
```

### 7. Product Filter Panel
Advanced filtering with categories, price range, and ratings.

```tsx
import ProductFilterPanel from './components/ProductFilterPanel';
import type { ProductFilters } from './components/ProductFilterPanel';

function Shop() {
  const categories = [
    { id: 1, name: 'Đồ chơi' },
    { id: 2, name: 'Quần áo' },
    // ...
  ];

  const handleFilterChange = (filters: ProductFilters) => {
    console.log('Filters:', filters);
    // Apply filters to product list
    // filters.categories - array of category IDs
    // filters.priceRange - { min: number, max: number }
    // filters.minRating - minimum rating
    // filters.inStock - boolean
  };

  return (
    <ProductFilterPanel
      categories={categories}
      onFilterChange={handleFilterChange}
    />
  );
}
```

### 8. Product Comparison
Compare multiple products side by side.

```tsx
import ProductComparisonModal from './components/ProductComparisonModal';
import productComparisonService from './services/productComparisonService';
import { useToast } from './components/ui';

function ProductCard({ product }) {
  const [showComparison, setShowComparison] = useState(false);
  const toast = useToast();

  const handleAddToCompare = () => {
    try {
      const added = productComparisonService.addProduct(product);
      if (added) {
        toast.success('Đã thêm vào so sánh');
      } else {
        toast.info('Sản phẩm đã có trong danh sách so sánh');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleViewComparison = () => {
    setShowComparison(true);
  };

  return (
    <>
      <button onClick={handleAddToCompare}>
        So sánh
      </button>
      
      <button onClick={handleViewComparison}>
        Xem so sánh ({productComparisonService.getCount()})
      </button>

      <ProductComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </>
  );
}
```

## Complete Example: Enhanced Shop Page

```tsx
import { useState, useEffect } from 'react';
import { ProductGridSkeleton } from './components/ui';
import ProductFilterPanel, { type ProductFilters } from './components/ProductFilterPanel';
import ProductCard from './components/ProductCard';
import RecentlyViewed from './components/RecentlyViewed';
import Breadcrumb from './components/Breadcrumb';

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({});

  const breadcrumbItems = [
    { label: 'Cửa hàng' }
  ];

  const categories = [
    { id: 1, name: 'Đồ chơi' },
    { id: 2, name: 'Quần áo' },
    { id: 3, name: 'Sách' }
  ];

  useEffect(() => {
    loadProducts(filters);
  }, [filters]);

  const loadProducts = async (filters: ProductFilters) => {
    setLoading(true);
    try {
      // Fetch products with filters
      const data = await fetchProducts(filters);
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />
      
      <div className="flex gap-6">
        <aside className="w-64">
          <ProductFilterPanel
            categories={categories}
            onFilterChange={setFilters}
          />
        </aside>

        <main className="flex-1">
          {loading ? (
            <ProductGridSkeleton count={12} columns={3} />
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      <RecentlyViewed maxItems={6} className="mt-12" />
    </div>
  );
}
```

## Integration Tips

1. **Loading States**: Always use skeleton loaders instead of spinners for better UX
2. **Recently Viewed**: Call `recentlyViewedService.addProduct()` in ProductDetail useEffect
3. **Breadcrumbs**: Add to all pages with navigation hierarchy
4. **Back to Top**: Already global, no additional setup needed
5. **Image Zoom**: Replace regular img tags with ImageZoom on product detail pages
6. **Quick View**: Add to product cards for faster browsing
7. **Filters**: Implement server-side filtering for best performance
8. **Comparison**: Limit to 4 products maximum (already enforced)

## Styling Notes

All components use Tailwind CSS with the project's color scheme:
- `brand-purple`: Primary actions and highlights
- `brand-orange`: Secondary highlights
- `brand-red`: Alerts and errors

Components are responsive by default and follow the project's design system.
