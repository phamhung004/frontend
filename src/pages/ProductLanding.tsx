import { useState, useEffect, useMemo } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { resolveProductPricing } from '../utils/pricing';
import { productService } from '../services/productService';
import type { ProductDetail, ProductVariant } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/ui/ToastContainer';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import ghnService, { type GHNDistrict, type GHNProvince, type GHNWard } from '../services/ghnService';

interface ProductLandingProps {
  initialProduct?: ProductDetail | null;
}

const ProductLanding = ({ initialProduct }: ProductLandingProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [product, setProduct] = useState<ProductDetail | null>(initialProduct ?? null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showFixedCTA, setShowFixedCTA] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'description' | 'recommendations'>('overview');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);

  // Address states
  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards] = useState<GHNWard[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const placeholderImage = '/images/placeholder.webp';
  const DEFAULT_LANDING_PRODUCT_ID = 1;

  const landingProductId = useMemo(() => {
    if (initialProduct?.id) {
      return initialProduct.id;
    }
    if (id) {
      const numericId = Number.parseInt(id, 10);
      if (!Number.isNaN(numericId)) {
        return numericId;
      }
    }
    return DEFAULT_LANDING_PRODUCT_ID;
  }, [id, initialProduct?.id]);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchProduct = async () => {
      if (!landingProductId) {
        setError('Không thể xác định sản phẩm cần hiển thị');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await productService.getProductById(landingProductId);
        setProduct(data);
        setError(null);
      } catch (fetchError) {
        console.error('Failed to load landing product:', fetchError);
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [initialProduct, landingProductId]);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await ghnService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Failed to load provinces:', error);
        toast.error('Không thể tải danh sách tỉnh thành');
      }
    };

    void loadProvinces();
  }, [toast]);

  // Handle province change
  const handleProvinceChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const provinceId = event.target.value ? Number(event.target.value) : null;
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
    setSelectedWard('');
    setDistricts([]);
    setWards([]);

    if (!provinceId) return;

    try {
      const districtData = await ghnService.getDistricts(provinceId);
      setDistricts(districtData);
    } catch (error) {
      console.error('Failed to load districts:', error);
      toast.error('Không thể tải danh sách quận/huyện');
    }
  };

  // Handle district change
  const handleDistrictChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const districtId = event.target.value ? Number(event.target.value) : null;
    setSelectedDistrict(districtId);
    setSelectedWard('');
    setWards([]);

    if (!districtId) return;

    try {
      const wardData = await ghnService.getWards(districtId);
      setWards(wardData);
    } catch (error) {
      console.error('Failed to load wards:', error);
      toast.error('Không thể tải danh sách phường/xã');
    }
  };

  // Handle ward change
  const handleWardChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedWard(event.target.value);
  };

  const variantOptions = useMemo<ProductVariant[]>(() => {
    if (!product) return [];
    if (product.variants && product.variants.length > 0) {
      return product.variants;
    }

    return [
      {
        id: undefined,
        productId: product.id,
        name: product.name,
        price: product.salePrice ?? product.regularPrice,
        basePrice: product.basePrice ?? product.regularPrice,
        finalPrice: product.finalPrice ?? product.salePrice ?? product.regularPrice,
        discountAmount: product.discountAmount ?? undefined,
        activeDiscount: product.activeDiscount ?? null,
        stockQuantity: product.stockQuantity,
        imageUrl: product.thumbnailUrl,
        sku: product.sku,
        attributes: null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    ];
  }, [product]);

  useEffect(() => {
    if (!variantOptions.length) {
      setSelectedVariant(null);
      return;
    }

    const variantWithStock = variantOptions.find((variant) => variant.stockQuantity > 0);
    setSelectedVariant((current) => {
      if (!current) {
        return variantWithStock ?? variantOptions[0];
      }

      const stillExists = variantOptions.find((variant) => {
        if (variant.id !== undefined && current.id !== undefined) {
          return variant.id === current.id;
        }
        return variant.name === current.name;
      });

      return stillExists ?? variantWithStock ?? variantOptions[0];
    });
  }, [variantOptions]);

  useEffect(() => {
    if (!product) return;

    const stockLimit = selectedVariant?.stockQuantity ?? product.stockQuantity ?? 1;

    if (!stockLimit || stockLimit <= 0) {
      setQuantity(1);
      return;
    }

    setQuantity((prev) => {
      const normalized = Math.max(1, Math.min(prev, stockLimit));
      return normalized;
    });
  }, [product, selectedVariant]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const uniqueImages = new Map<string, { src: string; alt: string }>();
    const addImage = (src?: string | null, alt?: string | null) => {
      if (!src || uniqueImages.has(src)) return;
      uniqueImages.set(src, { src, alt: alt ?? product.name });
    };

    const sortedMedia = [...(product.media ?? [])].sort((a, b) => {
      const orderA = a.displayOrder ?? 0;
      const orderB = b.displayOrder ?? 0;
      return orderA - orderB;
    });

    sortedMedia.forEach((mediaItem) => addImage(mediaItem.imageUrl, mediaItem.altText));
    addImage(product.thumbnailUrl, product.name);
    (product.variants ?? []).forEach((variant) => addImage(variant.imageUrl, variant.name));

    return Array.from(uniqueImages.values());
  }, [product]);

  const heroImageData = useMemo(() => {
    if (!product) {
      return { src: placeholderImage, alt: 'Hình sản phẩm' };
    }

    if (selectedVariant?.imageUrl) {
      return {
        src: selectedVariant.imageUrl,
        alt: selectedVariant.name ?? product.name ?? 'Hình sản phẩm',
      };
    }

    const primaryMedia = product.media?.find((item) => item.isPrimary && item.imageUrl);
    if (primaryMedia?.imageUrl) {
      return {
        src: primaryMedia.imageUrl,
        alt: primaryMedia.altText ?? product.name ?? 'Hình sản phẩm',
      };
    }

    if (galleryImages[0]) {
      return galleryImages[0];
    }

    if (product.thumbnailUrl) {
      return { src: product.thumbnailUrl, alt: product.name ?? 'Hình sản phẩm' };
    }

    return { src: placeholderImage, alt: 'Hình sản phẩm' };
  }, [galleryImages, product, selectedVariant]);

  const heroImage = heroImageData.src;
  const heroImageAlt = heroImageData.alt;

  const pricing = useMemo(() => {
    if (!product) {
      return null;
    }
    return resolveProductPricing(product, selectedVariant ?? undefined);
  }, [product, selectedVariant]);

  const currentStock = selectedVariant?.stockQuantity ?? product?.stockQuantity ?? 0;
  const availableStock = Math.max(0, currentStock);
  const subtotal = (pricing?.finalPrice ?? 0) * quantity;
  const totalSavings = pricing && pricing.discountAmount > 0 ? pricing.discountAmount * quantity : 0;
  const total = subtotal;

  // Sync quantityInput with quantity
  useEffect(() => {
    setQuantityInput(quantity.toString());
  }, [quantity]);

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const isVariantSelected = (variant: ProductVariant) => {
    if (!selectedVariant) return false;

    if (variant.id !== undefined && selectedVariant.id !== undefined) {
      return variant.id === selectedVariant.id;
    }

    return variant.name === selectedVariant.name;
  };

  const canIncreaseQuantity = availableStock > 0 ? quantity < availableStock : false;
  const canDecreaseQuantity = quantity > 1;

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show fixed CTA when scrolling and track active section
  useEffect(() => {
    const handleScroll = () => {
      setShowFixedCTA(window.scrollY > 800);

      // Update active tab based on scroll position
      const sections = ['overview', 'reviews', 'description', 'recommendations'];
      const scrollPosition = window.scrollY + 100; // Offset for better UX

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(`section-${sections[i]}`);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(sections[i] as 'overview' | 'reviews' | 'description' | 'recommendations');
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Quantity handlers
  const handleQuantityInputChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setQuantityInput(value);
    }
  };

  const normalizeQuantityInput = (rawValue: string, { suppressToast = false }: { suppressToast?: boolean } = {}): number | null => {
    const stockLimit = selectedVariant ? selectedVariant.stockQuantity : product?.stockQuantity ?? 0;
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

  // Add to cart handler
  const handleAddToCart = async (): Promise<boolean> => {
    if (!user) {
      toast.info('Đăng nhập để mua hàng', 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      setShowAuthModal(true);
      return false;
    }

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
    if (!user) {
      toast.info('Đăng nhập để mua hàng', 'Vui lòng đăng nhập để tiếp tục mua hàng');
      setShowAuthModal(true);
      return;
    }

    const added = await handleAddToCart();
    if (added) {
      navigate('/cart');
    }
  };

  const scrollToOrder = () => {
    const orderSection = document.getElementById('order-section');
    orderSection?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#646667]">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error || 'Không tìm thấy sản phẩm'}</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-[#9F86D9] text-white px-6 py-3 rounded-md hover:bg-[#8a75c4] transition-colors"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden pb-20 sm:pb-0">
      {/* Fixed CTA Bar - Shows after scroll */}
      {showFixedCTA && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 border-t-2 border-gray-200">
          <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <img src={heroImage} alt={heroImageAlt} className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  {/* Limit product name width so action buttons have room (truncates long names) */}
                  <p className="font-bold text-xs sm:text-sm line-clamp-1 truncate max-w-[140px] sm:max-w-[280px]">{product.name}</p>
                  <p className="text-red-600 font-bold text-sm sm:text-lg">{formatCurrency(pricing?.finalPrice ?? 0)}</p>
                </div>
              </div>
              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`px-2 py-2 sm:px-4 border-2 border-[#9F86D9] text-[#9F86D9] rounded-lg font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${addingToCart ? 'opacity-60 cursor-not-allowed' : 'hover:bg-purple-50'}`}
                >
                  {addingToCart ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-current" />
                      <span className="hidden sm:inline">Đang thêm...</span>
                    </span>
                  ) : (
                    <span className="hidden sm:inline">Thêm vào Giỏ hàng</span>
                  )}
                  {!addingToCart && <span className="sm:hidden">Thêm vào giỏ hàng</span>}
                </button>

                <button
                  onClick={scrollToOrder}
                  className="px-3 py-2 sm:px-6 bg-[#9F86D9] text-white rounded-lg font-bold text-xs sm:text-sm hover:bg-[#8a75c4] transition-all whitespace-nowrap"
                >
                  Mua Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-white pb-4">
        {/* Sticky Navigation Tabs - Fixed with higher z-index */}
        <div className="sticky top-0 bg-white z-[100] shadow-md border-b border-gray-200">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview' as const, label: 'Tổng quan' },
                { id: 'reviews' as const, label: 'Đánh giá' },
                { id: 'description' as const, label: 'Mô tả' },
                { id: 'recommendations' as const, label: 'Đề xuất' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    const section = document.getElementById(`section-${tab.id}`);
                    if (section) {
                      const yOffset = -80; // Offset for sticky header
                      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'text-[#9F86D9] border-b-2 border-[#9F86D9] bg-purple-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 mt-4">

          {/* Overview Section */}
          <div id="section-overview" className="scroll-mt-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
              {/* Left - Product Image */}
              <div className="space-y-4">
              {/* Main Product Image with Badges */}
              <div className="relative bg-gray-50 rounded-lg p-4 lg:p-6">
                <img
                  src={heroImage}
                  alt={heroImageAlt}
                  className="w-full rounded-lg object-contain max-h-96 lg:max-h-[500px]"
                />
                
                {/* Badges on Image */}
                <div className="absolute top-2 left-2 lg:top-4 lg:left-4 flex flex-col gap-2">
                  {/* EXTRA Badge */}
                  <div className="bg-[#00BFA5] text-white px-2 py-1 lg:px-3 lg:py-1.5 rounded text-xs lg:text-sm font-bold shadow-md">
                    <span>EXTRA</span>
                  </div>
                  
                  {/* BONUS Badge */}
                  <div className="bg-[#FFD600] text-black px-2 py-1 lg:px-3 lg:py-1.5 rounded text-xs lg:text-sm font-bold shadow-md">
                    <span>BONUS</span>
                  </div>
                </div>

                {/* Price and Discount Badge */}
                <div className="absolute bottom-2 left-2 right-2 lg:bottom-4 lg:left-4 lg:right-4">
                  <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-3 lg:p-4 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl lg:text-2xl font-bold">{formatCurrency(pricing?.finalPrice ?? 0)}</span>
                          {pricing && pricing.discountAmount > 0 && (
                            <span className="text-xs lg:text-sm line-through opacity-75">{formatCurrency(pricing.basePrice)}</span>
                          )}
                        </div>
                        {pricing && pricing.discountAmount > 0 && (
                          <div className="text-xs lg:text-sm mt-1">-{Math.round((pricing.discountAmount / pricing.basePrice) * 100)}%</div>
                        )}
                      </div>
                      
                      {/* Countdown Timer */}
                      <div className="bg-yellow-400 text-black px-2 py-1 lg:px-3 lg:py-2 rounded flex items-center gap-1 lg:gap-2 shadow-md">
                        <span className="text-base lg:text-lg">⚡</span>
                        <div className="text-xs font-bold">
                          <div className="whitespace-nowrap">Ưu đãi giờ vàng</div>
                          <div className="whitespace-nowrap">Kết thúc sau 1 ngày</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promotional Badge */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 hover:bg-red-100 transition-colors cursor-pointer">
                <span className="text-red-600 text-sm">🎫</span>
                <span className="text-red-600 text-sm font-medium flex-1">Giảm 20k</span>
                <button className="text-red-600 text-sm hover:translate-x-1 transition-transform">→</button>
              </div>
            </div>

            {/* Right - Product Info */}
            <div className="space-y-4 lg:space-y-5">
              {/* Sale Badge */}
              {pricing && pricing.discountAmount > 0 && (
                <div className="inline-block bg-red-600 text-white text-xs lg:text-sm px-3 py-1 rounded shadow-sm">
                  Sale sốc!!!
                </div>
              )}

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating and Sales */}
              <div className="flex items-center gap-3 lg:gap-4 flex-wrap bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-500 font-bold text-base lg:text-lg">4.8/5</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm lg:text-base">★</span>
                    ))}
                  </div>
                  <span className="text-xs lg:text-sm text-gray-600">(1.2k)</span>
                </div>
                <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
                <div className="text-xs lg:text-sm text-gray-700">
                  Đã bán <span className="font-bold text-red-600">12k</span>
                </div>
                <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
                <div className="text-red-600 text-xs lg:text-sm font-medium">
                  🚀 Miễn phí vận chuyển
                </div>
              </div>

              {/* Top Product Badge */}
              <div className="flex items-center gap-2 py-3 lg:py-4 border-y border-gray-200 bg-amber-50/50">
                <span className="text-lg lg:text-xl">🏆</span>
                <span className="text-xs lg:text-sm font-semibold text-gray-900">Sản phẩm hàng đầu</span>
                <span className="text-xs lg:text-sm text-gray-600 truncate flex-1">- Đồ chơi giáo dục trẻ em...</span>
                <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">→</button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-3">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span className="text-base">📝</span>
                  <span className="text-xs lg:text-sm font-medium text-gray-700">Thanh toán bảo mật</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <span className="text-base">🔙</span>
                  <span className="text-xs lg:text-sm font-medium text-gray-700">Hủy đơn dễ dàng</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                  <span className="text-base">🕐</span>
                  <span className="text-xs lg:text-sm font-medium text-gray-700">Hỗ trợ 24/7</span>
                </div>
              </div>

              {/* Variant Selection */}
              {variantOptions.length > 1 && (
                <div className="border-t border-gray-200 pt-4 lg:pt-5">
                  <h3 className="text-sm lg:text-base font-semibold mb-3 text-gray-900">Chọn phiên bản:</h3>
                  <div className="space-y-2">
                    {variantOptions.map((variant) => {
                      const variantPricing = resolveProductPricing(product, variant);
                      const selected = isVariantSelected(variant);
                      const outOfStock = variant.stockQuantity <= 0;

                      return (
                        <button
                          key={variant.id ?? variant.name}
                          onClick={() => !outOfStock && setSelectedVariant(variant)}
                          disabled={outOfStock}
                          className={`w-full p-3 lg:p-4 rounded-lg border-2 text-left transition-all ${
                            outOfStock
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : selected
                              ? 'border-[#9F86D9] bg-purple-50 shadow-md scale-105'
                              : 'border-gray-200 bg-white hover:border-[#9F86D9] hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`text-sm lg:text-base font-semibold truncate ${
                                  selected ? 'text-[#9F86D9]' : 'text-gray-900'
                                }`}>
                                  {variant.name}
                                </p>
                                {outOfStock && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                    Hết hàng
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                                {variantPricing.discountAmount > 0 ? (
                                  <>
                                    <span className="line-through">{formatCurrency(variantPricing.basePrice)}</span>
                                    <span className="text-red-600 font-medium">
                                      Tiết kiệm {formatCurrency(variantPricing.discountAmount)}
                                    </span>
                                  </>
                                ) : (
                                  <span>Còn {variant.stockQuantity} sản phẩm</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`text-base lg:text-xl font-bold ${
                                selected ? 'text-[#9F86D9]' : 'text-gray-900'
                              }`}>
                                {formatCurrency(variantPricing.finalPrice)}
                              </p>
                              {variantPricing.discountAmount > 0 && (
                                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                                  -{Math.round((variantPricing.discountAmount / variantPricing.basePrice) * 100)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Shipping Information */}
              <div className="border-t border-gray-200 pt-4 lg:pt-5 space-y-4">
                <div className="flex items-start gap-3 bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
                  <span className="text-xl flex-shrink-0">💰</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm lg:text-base font-semibold mb-2">Hình thức thanh toán</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-green-100 text-green-700 text-xs lg:text-sm px-3 py-1.5 rounded-lg font-semibold shadow-sm">COD</span>
                      <span className="text-xs lg:text-sm text-gray-600">Thanh toán bằng tiền mặt (COD)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
                  <span className="text-xl flex-shrink-0">🚚</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="text-sm lg:text-base font-semibold">Vận chuyển</div>
                      <div className="text-sm lg:text-base flex items-center gap-2">
                        <span className="line-through text-gray-400">32.000₫</span>
                        <span className="text-red-600 font-bold text-base lg:text-lg">Free</span>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">→</button>
                      </div>
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600 space-y-2">
                      <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <span className="text-base flex-shrink-0">💸</span>
                        <span className="font-medium">Voucher giảm phí vận chuyển</span>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed">
                        Giảm 5000đ phí vận chuyển đối với các đơn hàng từ giá 250000₫ trở lên, giảm 25000₫ phí vận chuyển đối với các đơn hàng từ giá 80.000₫ trở lên
                      </div>
                      <div className="text-xs lg:text-sm text-gray-700 mt-3 pt-3 border-t border-gray-200">
                        <div className="font-medium">📍 Từ Long Biên đến Nam Từ Liêm</div>
                        <div className="text-gray-600 mt-1">Ngày giao hàng dự kiến: <span className="font-semibold">3 ngày</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 lg:p-4">
                  <div className="text-sm lg:text-base font-semibold mb-2 text-gray-900">
                    ✅ Chính sách đổi trả, Kiểm tra hàng trước khi thanh toán
                  </div>
                  <div className="text-xs lg:text-sm text-gray-700 leading-relaxed">
                    Trả hàng trong vòng 7 ngày • Hủy đơn dễ dàng • Hoàn hàng miễn phí
                  </div>
                  <button 
                    onClick={scrollToOrder}
                    className="w-full sm:w-auto bg-[#9F86D9] text-white px-6 py-2.5 rounded-lg text-sm lg:text-base font-bold mt-3 hover:bg-[#8a75c4] shadow-md transition-all hover:scale-105"
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Reviews Section */}
          <div id="section-reviews" className="mt-8 border-t border-gray-200 pt-6 scroll-mt-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Đánh giá của khách hàng (1245 bình luận)</h2>
              <button className="text-[#9F86D9] text-sm font-medium hover:text-[#8a75c4] transition-colors">Xem thêm →</button>
            </div>

            {/* Average Rating */}
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">4.8/5</div>
                <div className="flex justify-center my-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
              {[
                {
                  name: 'Thanh Huyền',
                  date: 'Mất hàng · Hồng',
                  rating: 5,
                  comment: 'Sách hình ảnh rõ nét, màu sắc phong phú làm bé nhà mình rất thích và hứng thú học hành',
                  images: galleryImages.slice(0, 3),
                },
                {
                  name: 'Ánh Nhi',
                  date: 'Mất hàng · Hồng',
                  rating: 5,
                  comment: 'Với hệ thống hợp phần bộ trợ đi kèm vô cùng đầy đủ, phong phú đáp ứng đầy đủ cho nhu cầu học tập bao gồm Sách Mềm - phần mềm hó ..',
                  images: galleryImages.slice(0, 2),
                },
                {
                  name: 'Vân Dũng',
                  date: '',
                  rating: 5,
                  comment: '',
                  images: [],
                },
              ].map((review, i) => (
                <div key={i} className="border-b border-gray-100 pb-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{review.name}</div>
                      {review.date && <div className="text-xs text-gray-500">{review.date}</div>}
                    </div>
                  </div>
                  <div className="flex mb-2">
                    {[...Array(review.rating)].map((_, j) => (
                      <span key={j} className="text-yellow-400 text-sm">★</span>
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                  )}
                  {review.images.length > 0 && (
                    <div className="flex gap-2">
                      {review.images.map((img, j) => (
                        <img
                          key={j}
                          src={img.src}
                          alt={img.alt}
                          className="w-20 h-20 object-cover rounded border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description/Introduction Section */}
          <div id="section-description" className="mt-8 border-t border-gray-200 pt-6 scroll-mt-20">
            <h2 className="text-xl font-bold mb-4">Giới thiệu về sản phẩm này</h2>
            <div className="text-sm text-gray-700 space-y-4">
              {/* Short Description */}
              {product.shortDescription && (
                <div>
                  <p className="font-bold mb-2">Mô tả ngắn</p>
                  <p className="whitespace-pre-wrap">{product.shortDescription}</p>
                </div>
              )}

              {/* Long Description */}
              {product.longDescription && (
                <div>
                  <p className="font-bold mb-2">Mô tả chi tiết</p>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.longDescription }}
                  />
                </div>
              )}

              {/* Fallback if no descriptions */}
              {!product.shortDescription && !product.longDescription && (
                <p className="text-gray-500 italic">Chưa có thông tin mô tả cho sản phẩm này.</p>
              )}

              {/* Product Images */}
              {galleryImages.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleryImages.slice(0, 4).map((image, index) => (
                    <img 
                      key={index} 
                      src={image.src} 
                      alt={image.alt} 
                      className="w-full rounded-lg border border-gray-200 hover:shadow-lg transition-shadow" 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Section */}
          <div id="section-recommendations" className="mt-8 border-t border-gray-200 pt-6 scroll-mt-20">
            <h2 className="text-xl font-bold mb-4">Sản phẩm đề xuất</h2>
            <p className="text-sm text-gray-600 mb-6">
              Các sản phẩm tương tự mà bạn có thể quan tâm
            </p>
            {/* Add recommendations content here if needed */}
          </div>

          {/* Order Form Section */}
          <div id="order-section" className="mt-8 border-t border-gray-200 pt-6 scroll-mt-20 mb-20 sm:mb-0">
            <div className="lg:max-w-md mx-auto">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-4">1. Combo gồm</h3>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>3 cuốn tập đọc, tập viết, tập tính toán</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>1 cuốn tô màu tặng kèm</span>
                  </div>
                </div>

                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="font-bold mb-2 text-sm sm:text-base">{product.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm text-gray-500">Giá gốc:</span>
                    <span className="text-xs sm:text-sm line-through text-gray-400">{formatCurrency(pricing?.basePrice ?? 0)}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(pricing?.finalPrice ?? 0)}</span>
                    {pricing && pricing.discountAmount > 0 && (
                      <span className="bg-red-600 text-white text-xs sm:text-sm px-2 py-1 rounded font-bold">
                        {Math.round((pricing.discountAmount / pricing.basePrice) * 100)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Countdown */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 text-center border border-gray-200">
                  <p className="text-xs sm:text-sm font-medium mb-3">Siêu sale chỉ diễn ra trong:</p>
                  <div className="flex justify-center gap-2">
                    {[
                      { label: 'Ngày', value: '00' },
                      { label: 'Giờ', value: String(timeLeft.hours).padStart(2, '0') },
                      { label: 'Phút', value: String(timeLeft.minutes).padStart(2, '0') },
                      { label: 'Giây', value: String(timeLeft.seconds).padStart(2, '0') },
                    ].map((time, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="bg-gray-800 text-white text-lg sm:text-xl font-bold w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded">
                          {time.value}
                        </div>
                        <span className="text-xs mt-1 text-gray-600">{time.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    placeholder="Họ và Tên"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:border-[#9F86D9] focus:ring-1 focus:ring-[#9F86D9]"
                  />
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:border-[#9F86D9] focus:ring-1 focus:ring-[#9F86D9]"
                  />
                  <input
                    type="text"
                    placeholder="Địa chỉ chi tiết (Số nhà, tên đường)"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:border-[#9F86D9] focus:ring-1 focus:ring-[#9F86D9]"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select 
                      value={selectedProvince || ''}
                      onChange={handleProvinceChange}
                      className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-[#9F86D9] focus:ring-1 focus:ring-[#9F86D9] bg-white"
                    >
                      <option value="">Tỉnh/thành</option>
                      {provinces.map((province) => (
                        <option key={province.ProvinceID} value={province.ProvinceID}>
                          {province.ProvinceName}
                        </option>
                      ))}
                    </select>
                    <select 
                      value={selectedDistrict || ''}
                      onChange={handleDistrictChange}
                      disabled={!selectedProvince}
                      className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-[#9F86D9] focus:ring-1 focus:ring-[#9F86D9] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Quận/huyện</option>
                      {districts.map((district) => (
                        <option key={district.DistrictID} value={district.DistrictID}>
                          {district.DistrictName}
                        </option>
                      ))}
                    </select>
                    <select 
                      value={selectedWard}
                      onChange={handleWardChange}
                      disabled={!selectedDistrict}
                      className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-[#9F86D9] focus:ring-1 focus:ring-[#9F86D9] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Phường/xã</option>
                      {wards.map((ward) => (
                        <option key={ward.WardCode} value={ward.WardCode}>
                          {ward.WardName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={currentStock === 0 || addingToCart}
                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                      currentStock === 0 || addingToCart
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-white border-2 border-[#9F86D9] text-[#9F86D9] hover:bg-purple-50'
                    }`}
                  >
                    {addingToCart ? 'Đang thêm...' : currentStock === 0 ? 'Hết hàng' : 'Thêm vào Giỏ hàng'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                      disabled={currentStock === 0 || addingToCart}
                      className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                        currentStock === 0 || addingToCart
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#9F86D9] text-white hover:bg-[#8a75c4] shadow-md'
                      }`}
                    >
                      {addingToCart ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span>Đang xử lý...</span>
                        </span>
                      ) : currentStock === 0 ? (
                        'Hết hàng'
                      ) : (
                        'Mua Ngay'
                      )}
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hide unnecessary sections for cleaner mobile-first design */}
      <section className="hidden py-8 sm:py-12 lg:py-20 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-6 sm:mb-10 lg:mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-5xl font-bold text-[#1C1D1D] mb-3 sm:mb-4 lg:mb-6">
              Bạn Đang Gặp Những Vấn Đề Này?
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-[#646667] max-w-3xl mx-auto px-2 sm:px-4">
              Nhiều ba mẹ đang lo lắng về sự phát triển sáng tạo và kỹ năng của con...
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-8">
            {[
              {
                icon: '😟',
                title: 'Con hay chơi điện thoại, iPad?',
                description: 'Thiếu hoạt động thủ công, ảnh hưởng đến sự phát triển não bộ và thị lực của bé'
              },
              {
                icon: '😔',
                title: 'Con chưa khéo léo với bút?',
                description: 'Chưa biết cách cầm bút đúng cách, chưa phối hợp tay - mắt tốt'
              },
              {
                icon: '😕',
                title: 'Con ít sáng tạo, tưởng tượng?',
                description: 'Thiếu cơ hội để phát triển khả năng nghệ thuật và tư duy sáng tạo'
              },
            ].map((problem, i) => (
              <div key={i} className="bg-[#EFF2F3] rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 text-center hover:bg-[#F5F2FF] transition-all">
                <div className="text-3xl sm:text-4xl lg:text-6xl mb-2 sm:mb-3 lg:mb-4">{problem.icon}</div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#1C1D1D] mb-2 sm:mb-3">{problem.title}</h3>
                <p className="text-sm sm:text-base text-[#646667]">{problem.description}</p>
              </div>
            ))}
          </div>

          {/* Arrow pointing down */}
          <div className="text-center mt-6 sm:mt-8 lg:mt-12">
            <div className="inline-block bg-gradient-to-r from-[#9F86D9] to-[#B79FE8] text-white px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-full font-bold text-sm sm:text-base lg:text-xl animate-bounce">
              ↓ Giải pháp hoàn hảo cho bé ↓
            </div>
          </div>
        </div>
      </section>

      {/* Solution/Benefits Section */}
      <section className="hidden py-8 sm:py-12 lg:py-20 bg-gradient-to-br from-[#F5F2FF] to-[#FFF9E5]">
        <div className="max-w-[1434px] mx-auto px-4">
          <div className="text-center mb-6 sm:mb-10 lg:mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-5xl font-bold text-[#1C1D1D] mb-3 sm:mb-4 lg:mb-6 px-2 sm:px-4">
              {product.name} -
              <span className="text-[#9F86D9] block">Giải Pháp Hoàn Hảo!</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-[#646667] max-w-3xl mx-auto px-2 sm:px-4">
              Sản phẩm được thiết kế đặc biệt giúp phát triển toàn diện kỹ năng cho bé
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12">
            {[
              {
                icon: '🎨',
                title: 'Phát Triển Sáng Tạo',
                description: 'Khuyến khích bé tự do sáng tạo với màu sắc, phát triển trí tưởng tượng phong phú',
                benefit: 'Bé sẽ tự tin sáng tạo, không ngại thể hiện bản thân'
              },
              {
                icon: '✏️',
                title: 'Rèn Luyện Kỹ Năng Vận Động',
                description: 'Giúp bé học cách cầm bút đúng, phối hợp tay - mắt, chuẩn bị tốt cho việc viết chữ',
                benefit: 'Bé sẽ cầm bút khéo léo, viết chữ đẹp sau này'
              },
              {
                icon: '🧠',
                title: 'Tăng Cường Tập Trung',
                description: 'Hoạt động tô màu giúp bé học cách tập trung, kiên nhẫn hoàn thành công việc',
                benefit: 'Bé sẽ chăm chỉ học tập, không bị phân tâm dễ dàng'
              },
              {
                icon: '💝',
                title: 'An Toàn Tuyệt Đối',
                description: 'Giấy dày, chất lượng cao, không chứa chất độc hại, an toàn cho sức khỏe của bé',
                benefit: 'Ba mẹ hoàn toàn yên tâm cho bé sử dụng'
              },
            ].map((solution, i) => (
              <div key={i} className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                <div className="flex items-start gap-3 sm:gap-4 lg:gap-6">
                  <div className="text-3xl sm:text-4xl lg:text-6xl flex-shrink-0">{solution.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-[#1C1D1D] mb-2 sm:mb-3">{solution.title}</h3>
                    <p className="text-sm sm:text-base text-[#646667] mb-3 sm:mb-4 leading-relaxed">{solution.description}</p>
                    <div className="bg-[#F5F2FF] rounded-lg p-3 sm:p-4 border-l-4 border-[#9F86D9]">
                      <p className="text-[#9F86D9] font-bold text-xs sm:text-sm lg:text-base">✨ {solution.benefit}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Transformation Section */}
      <section className="hidden py-8 sm:py-12 lg:py-20 bg-white">
        <div className="max-w-[1434px] mx-auto px-4">
          <div className="text-center mb-6 sm:mb-10 lg:mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-5xl font-bold text-[#1C1D1D] mb-3 sm:mb-4 lg:mb-6">
              Sự Thay Đổi Kỳ Diệu Của Bé
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-[#646667]">
              Chỉ sau 2-3 tuần sử dụng đều đặn
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Before */}
            <div className="bg-[#EFF2F3] rounded-lg sm:rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 relative">
              <div className="absolute -top-3 sm:-top-4 lg:-top-6 left-1/2 -translate-x-1/2 bg-[#646667] text-white px-3 py-1 sm:px-6 sm:py-2 lg:px-8 lg:py-3 rounded-full font-bold text-xs sm:text-sm lg:text-xl">
                TRƯỚC KHI DÙNG
              </div>
              <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 lg:space-y-6">
                {[
                  '❌ Hay chơi điện thoại, ít hoạt động sáng tạo',
                  '❌ Cầm bút chưa vững, viết chữ còn vụng về',
                  '❌ Dễ bị phân tâm, khó tập trung lâu',
                  '❌ Ít tự tin khi thể hiện sáng tạo',
                ].map((item, i) => (
                  <p key={i} className="text-sm sm:text-base lg:text-lg text-[#646667] font-medium">{item}</p>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="bg-gradient-to-br from-[#F5F2FF] to-[#E5F9FF] rounded-lg sm:rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 relative border-2 sm:border-4 border-[#9F86D9]">
              <div className="absolute -top-3 sm:-top-4 lg:-top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#9F86D9] to-[#B79FE8] text-white px-3 py-1 sm:px-6 sm:py-2 lg:px-8 lg:py-3 rounded-full font-bold text-xs sm:text-sm lg:text-xl shadow-xl">
                SAU KHI DÙNG ✨
              </div>
              <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 lg:space-y-6">
                {[
                  '✅ Thích hoạt động sáng tạo, giảm thời gian màn hình',
                  '✅ Cầm bút vững vàng, kỹ năng vận động cải thiện',
                  '✅ Tập trung cao độ, kiên nhẫn hoàn thành tác phẩm',
                  '✅ Tự tin sáng tạo, nhiều ý tưởng nghệ thuật',
                ].map((item, i) => (
                  <p key={i} className="text-sm sm:text-base lg:text-lg text-[#1C1D1D] font-bold">{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Customer Photos & Reviews */}
      <section className="hidden py-8 sm:py-12 lg:py-20 bg-gradient-to-br from-[#FFF9E5] to-[#F5F2FF]">
        <div className="max-w-[1434px] mx-auto px-4">
          <div className="text-center mb-6 sm:mb-10 lg:mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-5xl font-bold text-[#1C1D1D] mb-3 sm:mb-4 lg:mb-6">
              342+ Gia Đình Đã Tin Tưởng
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-[#646667]">
              Nghe chia sẻ từ các ba mẹ đã mua sản phẩm cho bé
            </p>
          </div>

          {/* Featured Review */}
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-12 shadow-2xl mb-6 sm:mb-8 lg:mb-12 border-2 sm:border-4 border-[#FCC605]">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 lg:gap-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-[#9F86D9] to-[#B79FE8] rounded-full flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl flex-shrink-0 shadow-lg">
                👩
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1C1D1D]">Chị Nguyễn Thị Mai</h3>
                  <span className="bg-[#39F5C4] text-white px-3 py-1 sm:px-4 rounded-full text-xs sm:text-sm font-bold w-fit">MUA 5 LẦN</span>
                </div>
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#FCC605] text-base sm:text-xl lg:text-2xl">★</span>
                  ))}
                </div>
                <p className="text-sm sm:text-base lg:text-xl text-[#646667] leading-relaxed mb-4 sm:mb-6">
                  "Con gái mình 4 tuổi rất thích! Lúc đầu tô còn vụng, bây giờ tô rất đẹp và chăm chỉ. 
                  Mỗi ngày đều đòi tô màu, không còn nghịch điện thoại nhiều nữa. Giấy dày, in đẹp, 
                  tô màu nước không bị lem. <strong className="text-[#E35946]">Mình đã giới thiệu cho 
                  nhiều mẹ bạn rồi!</strong> Cảm ơn shop sản phẩm tuyệt vời! 💕"
                </p>
                <div className="flex gap-2 sm:gap-3 overflow-x-auto">
                  {galleryImages.slice(0, 3).map((img) => (
                    <img
                      key={img.src}
                      src={img.src}
                      alt={img.alt}
                      className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-lg object-cover border-2 border-[#9F86D9] flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* More Reviews Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                name: 'Anh Trần Văn An',
                role: 'Bố của bé Minh An',
                rating: 5,
                comment: 'Con tôi rất thích! Sản phẩm chất lượng, giá hợp lý. Tô mỗi ngày không chán.',
                avatar: '👨'
              },
              {
                name: 'Chị Lê Thị Hương',
                role: 'Mẹ của bé Hà My',
                rating: 5,
                comment: 'Đóng gói cẩn thận, ship nhanh. Bé nhà mình tô rất đẹp, chuẩn bị mua thêm!',
                avatar: '👩'
              },
              {
                name: 'Chị Phạm Thu Hà',
                role: 'Mẹ của 2 bé',
                rating: 5,
                comment: 'Mua cho 2 con, cả 2 đều thích. Giấy dày, màu sắc đẹp, an toàn cho bé.',
                avatar: '👩'
              },
            ].map((review, i) => (
              <div key={i} className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#9F86D9] to-[#B79FE8] rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                    {review.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#1C1D1D] text-sm sm:text-base truncate">{review.name}</h4>
                    <p className="text-xs text-[#646667] truncate">{review.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-2 sm:mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <span key={j} className="text-[#FCC605] text-sm sm:text-base">★</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#646667] leading-relaxed">"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Section - Hidden, using inline form instead */}
      <section className="hidden py-8 sm:py-12 lg:py-20 bg-gradient-to-br from-[#9F86D9] to-[#B79FE8]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left - Product Image */}
              <div className="relative bg-[#F5F2FF] p-6 sm:p-8 lg:p-12">
                <div className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-[#E35946] text-white px-3 py-1 sm:px-6 sm:py-3 rounded-full font-bold text-xs sm:text-sm lg:text-lg shadow-xl rotate-12">
                  -21% OFF
                </div>
                <img
                  src={heroImage}
                  alt={heroImageAlt}
                  className="w-full h-full object-contain rounded-lg sm:rounded-xl lg:rounded-2xl shadow-xl"
                />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg">
                  <p className="text-center font-bold text-[#1C1D1D] text-xs sm:text-sm lg:text-base">
                    🎁 Tặng kèm: Sticker + Bút chì màu
                  </p>
                </div>
              </div>

              {/* Right - Order Form */}
              <div className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1D1D] mb-4 sm:mb-6">
                  Đặt Hàng Ngay Hôm Nay!
                </h2>
                <p className="text-[#646667] text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">
                  {availableStock > 0 ? (
                    <>
                      Chỉ còn <strong className="text-[#E35946]">{availableStock} suất</strong> với giá ưu đãi đặc biệt
                    </>
                  ) : (
                    'Hiện sản phẩm tạm hết hàng, vui lòng quay lại sau.'
                  )}
                </p>

                {/* Variant Selection */}
                {variantOptions.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-[#1C1D1D] font-bold mb-2 sm:mb-3 text-sm sm:text-base">Chọn gói sản phẩm:</label>
                    <div className="space-y-2 sm:space-y-3">
                      {variantOptions.map((variant) => {
                        const variantPricing = resolveProductPricing(product, variant);
                        const selected = isVariantSelected(variant);

                        return (
                          <button
                            key={variant.id ?? variant.name}
                            onClick={() => setSelectedVariant(variant)}
                            className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all ${
                              selected
                                ? 'border-[#9F86D9] bg-[#F5F2FF] shadow-lg scale-105'
                                : 'border-[#DBE2E5] bg-white hover:border-[#9F86D9]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className={`font-bold text-sm sm:text-base lg:text-lg ${
                                  selected ? 'text-[#9F86D9]' : 'text-[#1C1D1D]'
                                }`}>
                                  {variant.name}
                                </p>
                                <p className="text-xs sm:text-sm text-[#646667]">
                                  {variantPricing.discountAmount > 0
                                    ? `Tiết kiệm: ${formatCurrency(variantPricing.discountAmount)}`
                                    : 'Giá tốt nhất cho ba mẹ'}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-base sm:text-lg lg:text-2xl font-bold text-[#9F86D9]">
                                  {formatCurrency(variantPricing.finalPrice)}
                                </p>
                                {variantPricing.discountAmount > 0 && (
                                  <p className="text-xs sm:text-sm text-[#646667] line-through">
                                    {formatCurrency(variantPricing.basePrice)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6 sm:mb-8">
                  <label className="block text-[#1C1D1D] font-bold mb-2 sm:mb-3 text-sm sm:text-base">Số lượng:</label>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center border-2 border-[#DBE2E5] rounded-lg">
                      <button
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        disabled={!canDecreaseQuantity || addingToCart || currentStock === 0}
                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-colors font-bold text-lg sm:text-xl ${
                          canDecreaseQuantity && !addingToCart && currentStock > 0 ? 'hover:bg-[#EFF2F3]' : 'cursor-not-allowed text-gray-400'
                        }`}
                      >
                        −
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
                        className="w-12 sm:w-16 text-center text-base sm:text-xl font-bold text-[#1C1D1D] border-x-2 border-[#DBE2E5] outline-none disabled:text-gray-400 disabled:bg-gray-50"
                      />
                      <button
                        onClick={() =>
                          setQuantity((prev) => {
                            if (availableStock > 0) {
                              return Math.min(availableStock, prev + 1);
                            }
                            return prev + 1;
                          })
                        }
                        disabled={!canIncreaseQuantity || addingToCart || currentStock === 0}
                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-colors font-bold text-lg sm:text-xl ${
                          canIncreaseQuantity && !addingToCart && currentStock > 0 ? 'hover:bg-[#EFF2F3]' : 'cursor-not-allowed text-gray-400'
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      {currentStock > 0 ? (
                        <p className="text-[#646667] text-xs sm:text-sm lg:text-base">
                          Còn <strong className="text-[#9F86D9]">{currentStock}</strong> sản phẩm
                        </p>
                      ) : (
                        <p className="text-red-500 font-bold text-xs sm:text-sm">Hết hàng</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-[#FFF9E5] rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-[#FCC605]">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-[#646667] text-sm sm:text-base lg:text-lg">Tạm tính:</span>
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1C1D1D]">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-[#646667] text-sm sm:text-base lg:text-lg">Tiết kiệm:</span>
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-[#E35946]">
                        -{formatCurrency(totalSavings)}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-[#FCC605] pt-2 sm:pt-3 flex items-center justify-between">
                    <span className="text-[#1C1D1D] text-base sm:text-lg lg:text-xl font-bold">Tổng cộng:</span>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#9F86D9]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {/* Add to Cart Button */}
                  <button 
                    onClick={handleAddToCart}
                    disabled={currentStock === 0 || addingToCart}
                    className={`w-full py-3 sm:py-4 lg:py-5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg lg:text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all ${
                      currentStock === 0 || addingToCart
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-white border-2 border-[#9F86D9] text-[#9F86D9] hover:bg-[#9F86D9] hover:text-white'
                    }`}
                  >
                    {addingToCart ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-current"></div>
                        <span className="text-sm sm:text-base lg:text-xl">Đang thêm...</span>
                      </span>
                    ) : currentStock === 0 ? (
                      '❌ HẾT HÀNG'
                    ) : (
                      '🛒 THÊM VÀO GIỎ HÀNG'
                    )}
                  </button>

                  {/* Buy Now Button */}
                  <button 
                    onClick={handleBuyNow}
                    disabled={currentStock === 0 || addingToCart}
                    className={`w-full py-3 sm:py-4 lg:py-5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg lg:text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all ${
                      currentStock === 0 || addingToCart
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#E35946] to-[#F25E17] text-white'
                    }`}
                  >
                    {currentStock === 0 ? '❌ HẾT HÀNG' : '⚡ MUA NGAY - MIỄN PHÍ SHIP'}
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { icon: '✅', text: 'Miễn phí ship' },
                    { icon: '🎁', text: 'Quà tặng kèm' },
                    { icon: '🔄', text: 'Đổi trả 7 ngày' },
                  ].map((badge, i) => (
                    <div key={i} className="text-center py-2 bg-[#F5F2FF] rounded-lg">
                      <div className="text-lg sm:text-xl lg:text-2xl mb-1">{badge.icon}</div>
                      <p className="text-xs text-[#646667] font-medium">{badge.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="hidden py-8 sm:py-12 lg:py-20 bg-white">
        <div className="max-w-[1000px] mx-auto px-4">
          <div className="text-center mb-6 sm:mb-10 lg:mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-5xl font-bold text-[#1C1D1D] mb-3 sm:mb-4 lg:mb-6">
              Câu Hỏi Thường Gặp
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[
              {
                q: 'Sản phẩm có phù hợp với bé 3 tuổi không?',
                a: 'Hoàn toàn phù hợp! Sản phẩm được thiết kế đặc biệt cho bé từ 3 tuổi trở lên. Hình vẽ đơn giản, đường nét rõ ràng giúp bé dễ dàng tô màu và sáng tạo.'
              },
              {
                q: 'Giấy có dày không? Tô màu nước có bị lem không?',
                a: 'Giấy rất dày và chất lượng cao (120gsm), có thể tô bằng sáp, màu nước, hoặc acrylic đều không bị thấm hay lem. Ba mẹ hoàn toàn yên tâm!'
              },
              {
                q: 'Mất bao lâu để nhận được hàng?',
                a: 'Đơn hàng sẽ được xử lý trong 24h và giao trong 2-3 ngày (nội thành) hoặc 3-5 ngày (ngoại thành). Miễn phí vận chuyển toàn quốc!'
              },
              {
                q: 'Có chính sách đổi trả không?',
                a: 'Có! Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm bị lỗi do nhà sản xuất. Vui lòng giữ nguyên bao bì và tem mác.'
              },
              {
                q: 'Có được xem hàng trước khi thanh toán không?',
                a: 'Có! Bạn được quyền kiểm tra hàng trước khi thanh toán. Nếu không hài lòng, hoàn toàn có thể từ chối nhận hàng.'
              },
            ].map((faq, i) => (
              <div key={i} className="bg-[#F5F2FF] rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 hover:shadow-lg transition-all">
                <h3 className="text-sm sm:text-base lg:text-xl font-bold text-[#1C1D1D] mb-2 sm:mb-3 flex items-start gap-2 sm:gap-3">
                  <span className="text-[#9F86D9] flex-shrink-0">Q:</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-[#646667] ml-6 sm:ml-8 leading-relaxed text-xs sm:text-sm lg:text-base">
                  <strong className="text-[#9F86D9]">A:</strong> {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="hidden py-8 sm:py-12 lg:py-20 bg-gradient-to-br from-[#E35946] via-[#F25E17] to-[#EDA62A] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-20 h-20 sm:w-40 sm:h-40 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 sm:bottom-20 sm:right-20 w-32 h-32 sm:w-60 sm:h-60 bg-white rounded-full animate-bounce"></div>
        </div>
        <div className="max-w-[1000px] mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6">
            Đừng Bỏ Lỡ Cơ Hội Này!
          </h2>
          <p className="text-base sm:text-xl lg:text-2xl mb-2 sm:mb-3 lg:mb-4 opacity-90">
            Chỉ còn <strong className="text-[#FCC605]">15 suất</strong> với giá ưu đãi đặc biệt
          </p>
          <p className="text-sm sm:text-base lg:text-xl mb-6 sm:mb-8 opacity-90">
            Sau hôm nay, giá sẽ tăng lên{' '}
            <span className="line-through">{formatCurrency(product.regularPrice)}</span>
          </p>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 inline-block">
            <p className="text-base sm:text-xl lg:text-3xl font-bold mb-2 sm:mb-3">⏰ Ưu đãi kết thúc sau:</p>
            <div className="flex gap-2 sm:gap-3 lg:gap-4 justify-center">
              {[
                { label: 'Giờ', value: timeLeft.hours },
                { label: 'Phút', value: timeLeft.minutes },
                { label: 'Giây', value: timeLeft.seconds },
              ].map((time, i) => (
                <div key={i} className="text-center">
                  <div className="bg-white text-[#E35946] text-2xl sm:text-3xl lg:text-5xl font-bold w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl">
                    {String(time.value).padStart(2, '0')}
                  </div>
                  <p className="text-xs sm:text-sm lg:text-lg font-bold mt-1 sm:mt-2">{time.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-stretch sm:items-center mb-8 sm:mb-0">
            <button
              onClick={scrollToOrder}
              className="px-6 py-3 sm:px-8 sm:py-4 lg:px-12 lg:py-6 bg-white text-[#E35946] rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-base sm:text-lg lg:text-2xl shadow-2xl hover:scale-110 transition-all"
            >
              🛒 ĐẶT HÀNG NGAY
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 sm:px-8 sm:py-4 lg:px-12 lg:py-6 border-2 sm:border-4 border-white text-white rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-base sm:text-lg lg:text-2xl hover:bg-white hover:text-[#E35946] transition-all"
            >
              Xem thêm sản phẩm
            </button>
          </div>

          <div className="mt-8 sm:mt-10 lg:mt-12 grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8 max-w-3xl mx-auto">
            {[
              { icon: '✅', text: 'Miễn phí vận chuyển' },
              { icon: '🎁', text: 'Tặng quà kèm giá trị' },
              { icon: '🔄', text: 'Đổi trả miễn phí 7 ngày' },
            ].map((badge, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-5xl mb-2 sm:mb-3">{badge.icon}</div>
                <p className="font-bold text-xs sm:text-sm lg:text-lg">{badge.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <section className="hidden py-12 bg-[#1C1D1D] text-white">
        <div className="max-w-[1434px] mx-auto px-4">
          <div className="grid grid-cols-4 gap-8 text-center">
            {[
              { number: '342+', label: 'Khách hàng hài lòng' },
              { number: '4.9/5', label: 'Đánh giá trung bình' },
              { number: '99%', label: 'Tỷ lệ mua lại' },
              { number: '24/7', label: 'Hỗ trợ khách hàng' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-5xl font-bold text-[#9F86D9] mb-2">{stat.number}</p>
                <p className="text-[#DBE2E5]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default ProductLanding;
