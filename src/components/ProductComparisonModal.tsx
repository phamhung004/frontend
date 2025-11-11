import { useState, useEffect } from 'react';
import { X, GitCompare, Check, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productComparisonService from '../services/productComparisonService';
import type { Product } from '../types/product';
import { formatCurrency } from '../utils/currency';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductComparisonModal = ({ isOpen, onClose }: ProductComparisonModalProps) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = () => {
    setProducts(productComparisonService.getProducts());
  };

  const handleRemove = (productId: number) => {
    productComparisonService.removeProduct(productId);
    loadProducts();
  };

  const handleClearAll = () => {
    productComparisonService.clear();
    loadProducts();
  };

  const handleViewProduct = (productId: number) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  if (!isOpen) return null;

  if (products.length === 0) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <GitCompare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Chưa có sản phẩm nào để so sánh</h3>
            <p className="text-gray-600">Thêm sản phẩm vào danh sách so sánh để bắt đầu</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <GitCompare className="w-6 h-6 text-brand-purple" />
              <h2 className="text-2xl font-bold">So sánh sản phẩm</h2>
              <span className="text-sm text-gray-600">({products.length} sản phẩm)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Xóa tất cả
              </button>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <div className="p-6">
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                {/* Product Images & Names */}
                <div className="font-semibold text-gray-700">Sản phẩm</div>
                {products.map((product) => (
                  <div key={product.id} className="relative">
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="absolute -top-2 -right-2 z-10 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={product.thumbnailUrl || '/images/placeholder.webp'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                        <button
                          onClick={() => handleViewProduct(product.id)}
                          className="text-xs text-brand-purple hover:underline"
                        >
                          Xem chi tiết →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Price */}
                <div className="font-semibold text-gray-700 py-4 border-t">Giá</div>
                {products.map((product) => {
                  const price = product.finalPrice || product.salePrice || product.regularPrice;
                  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;
                  
                  return (
                    <div key={`price-${product.id}`} className="py-4 border-t">
                      <div className="text-xl font-bold text-brand-purple">
                        {formatCurrency(price)}
                      </div>
                      {hasDiscount && (
                        <div className="text-sm text-gray-400 line-through">
                          {formatCurrency(product.regularPrice)}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Category */}
                <div className="font-semibold text-gray-700 py-4 border-t">Danh mục</div>
                {products.map((product) => (
                  <div key={`cat-${product.id}`} className="py-4 border-t">
                    <span className="text-sm text-gray-600">
                      {product.categoryName || 'Không có'}
                    </span>
                  </div>
                ))}

                {/* Stock */}
                <div className="font-semibold text-gray-700 py-4 border-t">Tình trạng</div>
                {products.map((product) => (
                  <div key={`stock-${product.id}`} className="py-4 border-t">
                    {product.stockQuantity > 0 ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600">
                        <Check className="w-4 h-4" />
                        Còn hàng ({product.stockQuantity})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-red-600">
                        <Minus className="w-4 h-4" />
                        Hết hàng
                      </span>
                    )}
                  </div>
                ))}

                {/* Short Description */}
                <div className="font-semibold text-gray-700 py-4 border-t">Mô tả</div>
                {products.map((product) => (
                  <div key={`desc-${product.id}`} className="py-4 border-t">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {product.shortDescription || 'Không có mô tả'}
                    </p>
                  </div>
                ))}

                {/* Badge */}
                <div className="font-semibold text-gray-700 py-4 border-t">Nhãn</div>
                {products.map((product) => (
                  <div key={`badge-${product.id}`} className="py-4 border-t">
                    {product.badgeLabel ? (
                      <span className="inline-block px-2 py-1 text-xs bg-brand-orange text-white rounded">
                        {product.badgeLabel}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparisonModal;
