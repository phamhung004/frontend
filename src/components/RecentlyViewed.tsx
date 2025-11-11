import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import recentlyViewedService, { type RecentProduct } from '../services/recentlyViewedService';
import { formatCurrency } from '../utils/currency';
import { X } from 'lucide-react';

interface RecentlyViewedProps {
  currentProductId?: number;
  maxItems?: number;
  className?: string;
}

const RecentlyViewed = ({ currentProductId, maxItems = 6, className = '' }: RecentlyViewedProps) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    loadProducts();
  }, [currentProductId]);

  const loadProducts = () => {
    let recentProducts = recentlyViewedService.getProducts();
    
    // Filter out current product if provided
    if (currentProductId) {
      recentProducts = recentProducts.filter(p => p.id !== currentProductId);
    }

    // Limit to maxItems
    setProducts(recentProducts.slice(0, maxItems));
  };

  const handleRemove = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    recentlyViewedService.removeProduct(productId);
    loadProducts();
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold mb-4">Đã xem gần đây</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => {
          const displayPrice = product.finalPrice || product.salePrice || product.regularPrice;
          const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;

          return (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
            >
              {/* Remove Button */}
              <button
                onClick={(e) => handleRemove(product.id, e)}
                className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                aria-label="Remove from recently viewed"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              {/* Image */}
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={product.thumbnailUrl || '/images/placeholder.webp'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Info */}
              <div className="p-3 space-y-1">
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h4>
                
                <div className="flex items-center gap-2">
                  <span className="text-brand-purple font-bold text-sm">
                    {formatCurrency(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatCurrency(product.regularPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyViewed;
