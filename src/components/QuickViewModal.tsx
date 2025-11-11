import { useState, useEffect } from 'react';
import { X, Heart, ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ui/ToastContainer';
import { formatCurrency } from '../utils/currency';
import { resolveProductPricing } from '../utils/pricing';
import type { Product, ProductDetail, ProductVariant } from '../types/product';
import { productService } from '../services/productService';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const toast = useToast();
  
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (isOpen && product.id) {
      setLoading(true);
      productService.getProductById(product.id)
        .then((data) => {
          setProductDetail(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load product details:', error);
          setLoading(false);
        });
    }
  }, [isOpen, product.id]);

  useEffect(() => {
    if (user) {
      setIsWishlisted(isInWishlist(product.id));
    }
  }, [product.id, user, isInWishlist]);

  if (!isOpen) return null;

  const pricing = resolveProductPricing(
    productDetail || product,
    selectedVariant
  );

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity: quantity
    });
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào wishlist');
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        setIsWishlisted(false);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await addToWishlist(product.id);
        setIsWishlisted(true);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  const images = productDetail?.media?.map(m => m.imageUrl) || [product.thumbnailUrl].filter(Boolean) as string[];
  const reviewCount = 0; // Will be added from review stats when available

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={images[selectedImage] || '/images/placeholder.webp'}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-brand-purple'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image || '/images/placeholder.webp'}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col space-y-4">
                {/* Category */}
                {product.categoryName && (
                  <p className="text-sm text-brand-purple font-semibold uppercase tracking-wide">
                    {product.categoryName}
                  </p>
                )}

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(pricing.basePrice)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({reviewCount} đánh giá)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-brand-purple">
                    {formatCurrency(pricing.finalPrice)}
                  </span>
                  {pricing.hasDiscount && pricing.basePrice && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatCurrency(pricing.basePrice)}
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.shortDescription && (
                  <p className="text-gray-600 line-clamp-3">
                    {product.shortDescription}
                  </p>
                )}

                {/* Variants */}
                {productDetail?.variants && productDetail.variants.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Lựa chọn:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {productDetail.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            selectedVariant?.id === variant.id
                              ? 'border-brand-purple bg-purple-50'
                              : 'border-gray-200 hover:border-brand-purple'
                          }`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Số lượng:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 hover:border-brand-purple transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 hover:border-brand-purple transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Thêm vào giỏ
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      isWishlisted
                        ? 'border-red-500 text-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-brand-purple'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* View Full Details */}
                <button
                  onClick={handleViewFullDetails}
                  className="w-full text-center text-brand-purple font-semibold hover:underline"
                >
                  Xem chi tiết đầy đủ →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
