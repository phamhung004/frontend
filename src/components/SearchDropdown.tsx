import { useNavigate } from 'react-router-dom';
import type { Product } from '../types/product';

interface SearchDropdownProps {
  products: Product[];
  loading: boolean;
  onClose: () => void;
}

const SearchDropdown = ({ products, loading, onClose }: SearchDropdownProps) => {
  const navigate = useNavigate();
  const placeholderImage = '/images/placeholder.webp';

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F86D9]"></div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
        <p className="text-center text-gray-500 py-4">Không tìm thấy sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
      <div className="p-2">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product.id)}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
          >
            <img
              src={product.thumbnailUrl || placeholderImage}
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = placeholderImage;
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-[#9F86D9]">
                  {formatCurrency(product.salePrice || product.regularPrice)}
                </span>
                {product.salePrice && product.salePrice < product.regularPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatCurrency(product.regularPrice)}
                  </span>
                )}
              </div>
              {product.stockQuantity === 0 && (
                <span className="text-xs text-red-600 mt-1 inline-block">
                  Hết hàng
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchDropdown;
