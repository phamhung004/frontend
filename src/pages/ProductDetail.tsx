import { useState, useEffect, useMemo, type KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { resolveProductPricing } from '../utils/pricing';
import RecentlyViewed from '../components/shop/RecentlyViewed';
import InstagramFeed from '../components/InstagramFeed';
import { productService } from '../services/productService';
import type { ProductDetail, ProductVariant } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/ui/ToastContainer';
import ProductLanding from './ProductLanding';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const toast = useToast();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const placeholderImage = '/images/placeholder.webp';

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('ID sản phẩm không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await productService.getProductById(parseInt(id, 10));

        if (data.productType === 'PDF') {
          navigate(`/product-pdf/${id}`, { replace: true });
          return;
        }

        setProduct(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const uniqueImages = new Map<string, { src: string; alt: string }>();

    const addImage = (src?: string | null, altText?: string | null) => {
      if (!src || uniqueImages.has(src)) return;
      uniqueImages.set(src, { src, alt: altText ?? product.name });
    };

    const sortedMedia = [...(product.media ?? [])].sort((a, b) => {
      const orderA = a.displayOrder ?? 0;
      const orderB = b.displayOrder ?? 0;
      return orderA - orderB;
    });

    sortedMedia.forEach((media) => addImage(media.imageUrl, media.altText));
    addImage(product.thumbnailUrl, product.name);

    (product.variants ?? []).forEach((variant) => {
      addImage(variant.imageUrl, variant.name);
    });

    return Array.from(uniqueImages.values());
  }, [product]);

  useEffect(() => {
    if (!product) {
      setSelectedVariant(null);
      setMainImage(null);
      return;
    }

    const primaryMediaImage = product.media?.find((item) => item.isPrimary)?.imageUrl;
    const fallbackImage = primaryMediaImage ?? galleryImages[0]?.src ?? product.thumbnailUrl ?? placeholderImage;

    const defaultVariant = product.variants && product.variants.length > 0
      ? product.variants.find((variant) => variant.stockQuantity > 0) ?? product.variants[0]
      : null;

    setSelectedVariant(defaultVariant ?? null);
    setMainImage(defaultVariant?.imageUrl ?? fallbackImage);
  }, [product, galleryImages, placeholderImage]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  useEffect(() => {
    setQuantityInput(quantity.toString());
  }, [quantity]);

  const recommendedProducts = [
    { name: 'Tô màu chú chó Labrador dễ thương', price: 56.40, image: '/images/tomaucho.webp' },
    { name: 'Bảng chữ cái viết thường tiếng việt', price: 253.0, image: '/images/bangchucai.webp' },
    { name: 'Kéo Capybara an toàn cho bé', price: 150.6, image: '/images/keocapi.webp' },
  ];

  const pricing = useMemo(() => {
    if (!product) {
      return null;
    }
    return resolveProductPricing(product, selectedVariant ?? undefined);
  }, [product, selectedVariant]);

  const hasDiscount = pricing?.hasDiscount ?? false;
  const discountLabel = hasDiscount && pricing
    ? pricing.discountPercent !== null
      ? `Giảm ${pricing.discountPercent}%`
      : `Tiết kiệm ${formatCurrency(pricing.discountAmount)}`
    : null;

  const isVariantSelected = (variant: ProductVariant) => {
    if (!selectedVariant) return false;
    if (selectedVariant.id !== undefined && variant.id !== undefined) {
      return selectedVariant.id === variant.id;
    }
    return selectedVariant.name === variant.name;
  };

  // Add to cart handler
  const handleAddToCart = async (): Promise<boolean> => {
    if (!product) return false;
    
    if (currentStock <= 0) {
      toast.error('Không thể thêm vào giỏ', 'Sản phẩm đã hết hàng');
      return false;
    }

    const normalizedQuantity = normalizeQuantityInput(quantityInput);

    if (!normalizedQuantity) {
      return false;
    }

    // Ensure we don't exceed available stock considering current cart contents
    const existingInCart = cart?.items?.find((ci) => ci.productId === product.id && (ci.variantId ?? null) === (selectedVariant?.id ?? null));
    const existingQty = existingInCart ? existingInCart.quantity : 0;
    const availableLeft = currentStock - existingQty;

    if (availableLeft <= 0) {
      toast.error('Không thể thêm vào giỏ', 'Bạn đã có tối đa số lượng sản phẩm trong giỏ hàng');
      return false;
    }

    let toAdd = normalizedQuantity;
    if (normalizedQuantity > availableLeft) {
      toAdd = availableLeft;
      toast.warning('Số lượng điều chỉnh', `Chỉ còn ${availableLeft} sản phẩm có thể thêm vì bạn đã có ${existingQty} trong giỏ`);
    }

    try {
      setAddingToCart(true);
      await addToCart({
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity: toAdd,
      });

      toast.success(
        'Đã thêm vào giỏ hàng!',
        `${toAdd} x ${product.name}${selectedVariant ? ' - ' + selectedVariant.name : ''}`
      );
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(
        'Không thể thêm vào giỏ hàng',
        'Vui lòng thử lại sau hoặc liên hệ hỗ trợ'
      );
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy now handler
  const handleBuyNow = async () => {
    const added = await handleAddToCart();
    if (added) {
      navigate('/cart');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#9F86D9] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  
  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy sản phẩm'}</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-[#9F86D9] text-white px-6 py-2 rounded hover:bg-[#8a75c4]"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  if (product.landingPageEnabled) {
    return <ProductLanding initialProduct={product} />;
  }

  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;

  const handleQuantityInputChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setQuantityInput(value);
    }
  };

  const normalizeQuantityInput = (rawValue: string, { suppressToast = false }: { suppressToast?: boolean } = {}): number | null => {
    const stockLimit = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;
    const trimmedValue = rawValue.trim();

    const warn = (title: string, message: string) => {
      if (!suppressToast) {
        toast.warning(title, message);
      }
    };

    if (trimmedValue === '') {
      warn('Số lượng không hợp lệ', 'Số lượng phải lớn hơn 0');
      setQuantity(1);
      setQuantityInput('1');
      return null;
    }

    const parsedQuantity = parseInt(trimmedValue, 10);

    if (!parsedQuantity || parsedQuantity < 1) {
      warn('Số lượng không hợp lệ', 'Số lượng phải lớn hơn 0');
      setQuantity(1);
      setQuantityInput('1');
      return null;
    }

    if (stockLimit > 0 && parsedQuantity > stockLimit) {
      warn('Không đủ hàng', `Chỉ còn ${stockLimit} sản phẩm trong kho`);
      setQuantity(stockLimit);
      setQuantityInput(stockLimit.toString());
      return null;
    }

    setQuantity(parsedQuantity);
    setQuantityInput(parsedQuantity.toString());
    return parsedQuantity;
  };

  const handleQuantityInputBlur = () => {
    normalizeQuantityInput(quantityInput);
  };

  const handleQuantityInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      (event.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-[#EFF2F3] py-4">
        <div className="max-w-[1434px] mx-auto px-4">
          <div className="flex items-center gap-3 text-base">
            <a href="/" className="text-[#9F86D9] hover:underline">Home</a>
            <span className="text-[#646667]">›</span>
            <a href="/shop" className="text-[#9F86D9] hover:underline">Shop</a>
            <span className="text-[#646667]">›</span>
            <span className="text-[#646667]">{product.categoryName || 'Sản phẩm'}</span>
          </div>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="max-w-[1434px] mx-auto px-4 py-16">
        <div className="flex gap-10">
          {/* Left Side - Images */}
          <div className="flex gap-4">
            {/* Thumbnail Column */}
            <div className="flex flex-col gap-4">
              {galleryImages.map((img) => (
                <div
                  key={img.src}
                  onClick={() => setMainImage(img.src)}
                  className={`w-[100px] h-[120px] bg-[#EFF2F3] cursor-pointer border-2 ${
                    mainImage === img.src ? 'border-[#9F86D9]' : 'border-transparent'
                  }`}
                >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Main Image */}
            <div className="w-[460px] h-[645px] bg-[#EFF2F3]">
              <img 
                src={mainImage || product.thumbnailUrl || placeholderImage} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="flex-1 max-w-[610px]">
            {/* Extra Discount Badge */}
            {hasDiscount && pricing && (
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="#E35946"/>
                    <path d="M6 12h12M12 8l4 4-4 4" stroke="white" strokeWidth="2"/>
                  </svg>
                  <span className="text-[#E35946] text-base">
                    {discountLabel}
                  </span>
                </div>
                {pricing.activeDiscount?.campaignName && (
                  <span className="text-xs text-[#646667]">
                    Chương trình: {pricing.activeDiscount.campaignName}
                  </span>
                )}
              </div>
            )}

            {/* Badge Label */}
            {product.badgeLabel && (
              <div className="inline-block px-3 py-1 bg-[#E35946] text-white text-xs font-bold rounded mb-4">
                {product.badgeLabel}
              </div>
            )}

            {/* Product Title */}
            <h1 className="text-2xl font-bold text-[#1C1D1D] mb-4">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#FCC605">
                    <path d="M10 0l2.5 6.5H20l-5.5 4.5 2 6.5L10 13l-6.5 4.5 2-6.5L0 6.5h7.5z"/>
                  </svg>
                ))}
              </div>
              <span className="text-[#646667]">(14 Đánh giá - 25 Đơn hàng)</span>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-[#9F86D9]">
                  {formatCurrency(pricing?.finalPrice ?? 0)}
                </span>
                {hasDiscount && pricing && (
                  <div className="relative">
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#646667]"></div>
                    <span className="text-2xl text-[#646667]">
                      {formatCurrency(pricing.basePrice)}
                    </span>
                  </div>
                )}
              </div>
              {hasDiscount && pricing && pricing.discountAmount > 0 && (
                <span className="text-sm text-[#E35946]">
                  Tiết kiệm {formatCurrency(pricing.discountAmount)} mỗi sản phẩm
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <span className={`text-sm ${currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currentStock > 0 
                  ? `Còn ${currentStock} sản phẩm` 
                  : 'Hết hàng'}
              </span>
            </div>

            {/* Color Selection */}
            {/* <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-[#1C1D1D]">Color:</span>
                <span className="text-sm font-bold text-[#1C1D1D]">{selectedColor}</span>
              </div>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color.name ? 'border-[#9F86D9]' : 'border-[#DBE2E5]'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div> */}

            {/* Variant Selection with Images */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6 pb-6 border-b border-[#DBE2E5]">
                <div className="mb-4">
                  <span className="text-sm font-medium text-[#1C1D1D]">Phân Loại</span>
                </div>
                <div className="flex gap-3">
                  {product.variants.map((variant) => {
                    const isSelected = isVariantSelected(variant);
                    const variantPricing = resolveProductPricing(product, variant);
                    const variantHasDiscount = variantPricing.hasDiscount;

                    return (
                      <button
                        key={variant.id ?? variant.name}
                        onClick={() => {
                          setSelectedVariant(variant);
                          setMainImage(variant.imageUrl ?? (galleryImages[0]?.src ?? product.thumbnailUrl ?? placeholderImage));
                        }}
                        className={`relative flex flex-col items-center p-2 rounded border-2 transition-all hover:border-[#9F86D9] ${
                          isSelected ? 'border-[#9F86D9] bg-[#F5F2FF]' : 'border-[#DBE2E5] bg-white'
                        }`}
                      >
                        {/* Checkmark cho variant được chọn */}
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-[#9F86D9] rounded-full flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}

                        {/* Thumbnail ảnh */}
                        <div className="w-16 h-16 mb-2 rounded overflow-hidden">
                          <img 
                            src={variant.imageUrl ?? product.thumbnailUrl ?? placeholderImage}
                            alt={variant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Tên phân loại */}
                        <span className={`text-xs text-center leading-tight ${
                          isSelected ? 'text-[#9F86D9] font-medium' : 'text-[#646667]'
                        }`}>
                          {variant.name}
                        </span>
                        <div className="flex flex-col items-center mt-1 leading-tight">
                          <span className="text-[11px] text-[#9F86D9] font-medium">
                            {formatCurrency(variantPricing.finalPrice)}
                          </span>
                          {variantHasDiscount && (
                            <span className="text-[10px] text-[#646667] line-through">
                              {formatCurrency(variantPricing.basePrice)}
                            </span>
                          )}
                        </div>
                        {variantHasDiscount && variantPricing.discountPercent !== null && (
                          <span className="absolute top-1 left-1 text-[10px] font-semibold text-white bg-[#E35946] px-1.5 py-0.5 rounded">
                            -{variantPricing.discountPercent}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="mb-6">
              <div className="mb-4">
                <span className="text-sm font-medium text-[#1C1D1D]">Số Lượng</span>
              </div>
              
              {/* Quantity Selector - Standalone */}
              <div className="flex items-center border border-[#DBE2E5] rounded w-fit mb-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#EFF2F3] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10" stroke="#646667" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quantityInput}
                  onChange={(event) => handleQuantityInputChange(event.target.value)}
                  onBlur={handleQuantityInputBlur}
                  onKeyDown={handleQuantityInputKeyDown}
                  disabled={addingToCart || currentStock === 0}
                  className="w-14 text-center text-sm font-medium text-[#1C1D1D] border-x border-[#DBE2E5] outline-none bg-transparent disabled:text-gray-400"
                />
                <button
                  onClick={() => setQuantity(Math.min(currentStock || 1, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#EFF2F3] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="#646667" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  disabled={currentStock === 0 || addingToCart}
                  className={`flex-1 h-12 flex items-center justify-center gap-2 border-2 rounded font-medium text-sm transition-colors ${
                    currentStock === 0 || addingToCart
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'border-[#9F86D9] text-[#9F86D9] hover:bg-[#9F86D9] hover:text-white'
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      <span>Đang thêm...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {currentStock === 0 ? 'Hết hàng' : 'Thêm Vào Giỏ Hàng'}
                    </>
                  )}
                </button>

                {/* Buy Now Button */}
                <button 
                  onClick={handleBuyNow}
                  disabled={currentStock === 0 || addingToCart}
                  className={`flex-1 h-12 rounded font-medium text-sm transition-colors ${
                    currentStock === 0 || addingToCart
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#9F86D9] text-white hover:bg-[#8a75c4]'
                  }`}
                >
                  {currentStock === 0 ? 'Hết hàng' : 'Mua Ngay'}
                </button>
              </div>
            </div>

            {/* Chi tiết sản phẩm (đã chuyển xuống tab) */}
          </div>

          {/* Recommended Products Sidebar */}
          <div className="w-[171px]">
            <h3 className="text-base text-center text-[#646667] mb-6 leading-tight">
              Gợi ý<br />cho bạn
            </h3>
            <div className="space-y-6">
              {recommendedProducts.map((product, index) => (
                <div key={index} className="cursor-pointer">
                  <div className="w-[171px] h-[171px] bg-[#EFF2F3] mb-2">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1C1D1D] mb-1">{product.name}</h4>
                  <p className="text-sm text-[#9F86D9]">{formatCurrency(product.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-[1434px] mx-auto px-4 mb-16">
        <div className="border-b-2 border-[#DBE2E5] mb-8">
          <div className="flex gap-12">
            <button
              onClick={() => setActiveTab('description')}
              className={`text-xl pb-4 ${
                activeTab === 'description'
                  ? 'text-[#9F86D9] border-b-2 border-[#9F86D9]'
                  : 'text-[#1C1D1D]'
              }`}
            >
              Mô tả sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`text-xl pb-4 ${
                activeTab === 'ingredients'
                  ? 'text-[#9F86D9] border-b-2 border-[#9F86D9]'
                  : 'text-[#1C1D1D]'
              }`}
            >
              Chi tiết sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('vendor')}
              className={`text-xl pb-4 ${
                activeTab === 'vendor'
                  ? 'text-[#9F86D9] border-b-2 border-[#9F86D9]'
                  : 'text-[#1C1D1D]'
              }`}
            >
              Đánh giá sản phẩm
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex gap-16">
          {/* Left Content */}
          <div className="flex-1 max-w-[1004px]">
            {activeTab === 'description' && (
              <div className="space-y-6 text-base text-[#1C1D1D]">
                <h3 className="text-xl font-bold text-[#1C1D1D]">MÔ TẢ SẢN PHẨM</h3>

                {product.shortDescription && (
                  <p className="text-sm">
                    {product.shortDescription}
                  </p>
                )}

                {product.longDescription && (
                  <div 
                    className="text-sm prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.longDescription }}
                  />
                )}

                {!product.shortDescription && !product.longDescription && (
                  <p className="text-sm text-gray-500">Chưa có mô tả cho sản phẩm này.</p>
                )}
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-6 text-base text-[#1C1D1D]">
                <h3 className="text-lg font-bold text-[#1C1D1D] mb-4">CHI TIẾT SẢN PHẨM</h3>
                <div className="space-y-4">
                  {product.categoryName && (
                    <div className="flex gap-4">
                      <span className="text-sm text-[#646667] w-[160px]">Danh Mục</span>
                      <span className="text-sm text-[#1C1D1D]">{product.categoryName}</span>
                    </div>
                  )}

                  {selectedVariant && (
                    <div className="flex gap-4">
                      <span className="text-sm text-[#646667] w-[160px]">Biến thể</span>
                      <span className="text-sm text-[#1C1D1D]">{selectedVariant.name}</span>
                    </div>
                  )}

                  {(selectedVariant?.sku || product.sku) && (
                    <div className="flex gap-4">
                      <span className="text-sm text-[#646667] w-[160px]">SKU</span>
                      <span className="text-sm text-[#1C1D1D]">{selectedVariant?.sku ?? product.sku}</span>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <span className="text-sm text-[#646667] w-[160px]">Tồn kho</span>
                    <span className="text-sm text-[#1C1D1D]">{currentStock} sản phẩm</span>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-sm text-[#646667] w-[160px]">Trạng thái</span>
                    <span className="text-sm text-[#1C1D1D]">
                      {product.isPublished ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </div>

                  {product.createdAt && (
                    <div className="flex gap-4">
                      <span className="text-sm text-[#646667] w-[160px]">Ngày đăng</span>
                      <span className="text-sm text-[#1C1D1D]">
                        {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'vendor' && product.id && (
              <div>
                {showReviewForm ? (
                  <ReviewForm
                    productId={product.id}
                    productName={product.name}
                    onSuccess={() => {
                      setShowReviewForm(false);
                      // Refresh review list by re-mounting
                      setActiveTab('description');
                      setTimeout(() => setActiveTab('vendor'), 0);
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                ) : (
                  <ReviewList
                    productId={product.id}
                    onWriteReview={() => setShowReviewForm(true)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Customer Reviews */}
          <div className="w-[336px]">
            <h3 className="text-base font-bold text-[#9F86D9] mb-4">Đánh giá của khách hàng</h3>
            <div className="space-y-3">
              {[
                { stars: 5, percentage: 80 },
                { stars: 4, percentage: 72 },
                { stars: 3, percentage: 25 },
                { stars: 2, percentage: 16 },
                { stars: 1, percentage: 4 },
              ].map((review) => (
                <div key={review.stars} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#1C1D1D] w-[55px]">{review.stars} Sao</span>
                    <div className="w-[202px] h-1 bg-[#DBE2E5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#9F86D9]"
                        style={{ width: `${review.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-[#1C1D1D] border border-[#DBE2E5] rounded px-2 py-1">
                    {review.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customers Also Viewed */}
      <RecentlyViewed />

      {/* Instagram Feed */}
      <InstagramFeed />
    </div>
  );
};

export default ProductDetail;
