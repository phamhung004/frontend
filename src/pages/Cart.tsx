import { useState, useEffect, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { formatCurrency } from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import InstagramFeed from '../components/InstagramFeed';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/ui/ToastContainer';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cart, loading, updateQuantity: updateCartQuantity, removeItem: removeCartItem } = useCart();
  const toast = useToast();

  const [discountCode, setDiscountCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    itemId: number | null;
    itemName: string;
  }>({
    isOpen: false,
    itemId: null,
    itemName: '',
  });
  const [quantityInputs, setQuantityInputs] = useState<Record<number, string>>({});

  const cartItems = cart?.items || [];

  useEffect(() => {
    const initialInputs: Record<number, string> = {};
    cartItems.forEach((item) => {
      initialInputs[item.id] = item.quantity.toString();
    });
    setQuantityInputs(initialInputs);
  }, [cartItems]);

  const updateQuantity = async (cartItemId: number, newQuantity: number, itemName: string, stockQuantity: number) => {
    if (newQuantity < 1) {
      toast.warning('Số lượng không hợp lệ', 'Số lượng phải lớn hơn 0');
      return false;
    }
    
    if (newQuantity > stockQuantity) {
      toast.warning('Không đủ hàng', `Chỉ còn ${stockQuantity} sản phẩm trong kho`);
      return false;
    }
    
    try {
      setUpdatingItemId(cartItemId);
      await updateCartQuantity(cartItemId, newQuantity);
      toast.success('Đã cập nhật', `Số lượng "${itemName}" đã được cập nhật`);
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Không thể cập nhật', 'Vui lòng thử lại sau');
      return false;
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (cartItemId: number, itemName: string) => {
    setConfirmDialog({
      isOpen: true,
      itemId: cartItemId,
      itemName: itemName,
    });
  };

  const handleConfirmRemove = async () => {
    if (!confirmDialog.itemId) return;
    
    try {
      setRemovingItemId(confirmDialog.itemId);
      await removeCartItem(confirmDialog.itemId);
      toast.success('Đã xóa', `"${confirmDialog.itemName}" đã được xóa khỏi giỏ hàng`);
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Không thể xóa', 'Vui lòng thử lại sau');
    } finally {
      setRemovingItemId(null);
      setConfirmDialog({ isOpen: false, itemId: null, itemName: '' });
    }
  };

  const handleQuantityInputChange = (itemId: number, value: string) => {
    if (/^\d*$/.test(value)) {
      setQuantityInputs((prev) => ({ ...prev, [itemId]: value }));
    }
  };

  const handleQuantityInputBlur = async (item: (typeof cartItems)[number]) => {
    const rawValue = (quantityInputs[item.id] ?? '').trim();

    if (rawValue === '') {
      toast.warning('Số lượng không hợp lệ', 'Số lượng phải lớn hơn 0');
      const fallbackQuantity = item.stockQuantity > 0 ? 1 : item.quantity;
      setQuantityInputs((prev) => ({ ...prev, [item.id]: fallbackQuantity.toString() }));
      if (fallbackQuantity !== item.quantity) {
        const succeeded = await updateQuantity(item.id, fallbackQuantity, item.productName, item.stockQuantity);
        if (!succeeded) {
          setQuantityInputs((prev) => ({ ...prev, [item.id]: item.quantity.toString() }));
        }
      }
      return;
    }

    const parsedQuantity = parseInt(rawValue, 10);

    if (!parsedQuantity || parsedQuantity < 1) {
      toast.warning('Số lượng không hợp lệ', 'Số lượng phải lớn hơn 0');
      const fallbackQuantity = item.stockQuantity > 0 ? 1 : item.quantity;
      setQuantityInputs((prev) => ({ ...prev, [item.id]: fallbackQuantity.toString() }));
      if (fallbackQuantity !== item.quantity) {
        const succeeded = await updateQuantity(item.id, fallbackQuantity, item.productName, item.stockQuantity);
        if (!succeeded) {
          setQuantityInputs((prev) => ({ ...prev, [item.id]: item.quantity.toString() }));
        }
      }
      return;
    }

    if (item.stockQuantity > 0 && parsedQuantity > item.stockQuantity) {
      toast.warning('Không đủ hàng', `Chỉ còn ${item.stockQuantity} sản phẩm trong kho`);
    }

    const finalQuantity = item.stockQuantity > 0
      ? Math.min(parsedQuantity, item.stockQuantity)
      : item.quantity;

    if (finalQuantity === item.quantity) {
      setQuantityInputs((prev) => ({ ...prev, [item.id]: finalQuantity.toString() }));
      return;
    }

    setQuantityInputs((prev) => ({ ...prev, [item.id]: finalQuantity.toString() }));

    const succeeded = await updateQuantity(item.id, finalQuantity, item.productName, item.stockQuantity);

    if (!succeeded) {
      setQuantityInputs((prev) => ({ ...prev, [item.id]: item.quantity.toString() }));
    }
  };

  const handleQuantityInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      (event.target as HTMLInputElement).blur();
    }
  };

  const subtotal = Number(cart?.subtotal ?? 0);
  const originalSubtotal = Number(cart?.originalSubtotal ?? subtotal);
  const discountTotal = Number(
    cart?.discountTotal ?? Math.max(originalSubtotal - subtotal, 0)
  );
  const hasCartDiscount = discountTotal > 0.009;
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  // Show loading state
  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#9F86D9] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Title & Breadcrumb */}
      <div className="max-w-[1434px] mx-auto px-4 py-8 sm:py-12 lg:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-[64px] font-bold text-[#1C1D1D] mb-4 sm:mb-6" style={{ fontFamily: 'Lobster Two' }}>{t('cart.title')}</h1>
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base flex-wrap">
          <a href="/" className="text-[#9F86D9] hover:underline">{t('cart.home')}</a>
          <span className="text-[#646667]">›</span>
          <a href="/shop" className="text-[#9F86D9] hover:underline">{t('cart.shop')}</a>
          <span className="text-[#646667]">›</span>
          <span className="text-[#646667]">{t('cart.cart')}</span>
        </div>
      </div>

      {/* Cart Table */}
      <div className="max-w-[1434px] mx-auto px-4 mb-8">
        {/* Table Header - Desktop Only */}
        <div className="hidden lg:flex bg-[#9F86D9] rounded h-[67px] items-center px-5 mb-4">
          <div className="flex items-center w-full">
            <div className="flex items-center gap-5 flex-[2]">
              <input
                type="checkbox"
                className="w-5 h-5 border border-white rounded"
              />
              <span className="text-white font-bold text-base">{t('cart.product')}</span>
            </div>
            <div className="flex-[0.8] text-center text-white font-bold text-base">Tồn kho</div>
            <div className="flex-[0.8] text-center text-white font-bold text-base">{t('cart.unitPrice')}</div>
            <div className="flex-[1] text-center text-white font-bold text-base">{t('cart.quantity')}</div>
            <div className="flex-[0.8] text-center text-white font-bold text-base">{t('cart.subtotal')}</div>
            <div className="flex-[0.5] text-center text-white font-bold text-base">{t('cart.remove')}</div>
          </div>
        </div>

        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-[#9F86D9] text-white px-6 py-2 rounded hover:bg-[#8a75c4]"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item, index) => {
              const unitPrice = Number(item.unitPrice ?? 0);
              const basePrice = Number(item.basePrice ?? unitPrice);
              const rawPerUnitDiscount = item.discountAmount !== undefined && item.discountAmount !== null
                ? Number(item.discountAmount)
                : Math.max(basePrice - unitPrice, 0);
              const perUnitDiscount = rawPerUnitDiscount > 0 ? rawPerUnitDiscount : 0;
              const hasItemDiscount = basePrice - unitPrice > 0.005 || perUnitDiscount > 0.005;
              const originalLineTotal = basePrice * item.quantity;
              const lineDiscount = hasItemDiscount ? perUnitDiscount * item.quantity : 0;

              return (
                <div
                  key={item.id}
                  className={`rounded p-4 sm:p-5 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FFF5F2]'
                  }`}
                >
                  {/* Mobile Card Layout */}
                  <div className="lg:hidden space-y-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 border border-[#DBE2E5] rounded flex-shrink-0">
                        <img
                          src={item.variantImage || item.productImage || '/images/placeholder.webp'}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#1C1D1D] font-bold text-sm sm:text-base line-clamp-2 mb-1">
                          {item.productName}
                        </h3>
                        {item.variantName && (
                          <p className="text-[#646667] text-xs mb-1">{item.variantName}</p>
                        )}
                        {item.activeDiscount?.campaignName && (
                          <p className="text-xs text-[#E35946]">{item.activeDiscount.campaignName}</p>
                        )}
                        <p className="text-xs text-[#646667] mt-2">
                          {item.stockQuantity > 0 ? `Còn ${item.stockQuantity}` : 'Hết hàng'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.productName)}
                        disabled={updatingItemId === item.id || removingItemId === item.id}
                        className="w-8 h-8 flex items-center justify-center text-[#646667] hover:text-[#E35946] disabled:opacity-50 transition-colors flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-[#646667] mb-1">Đơn giá</span>
                        <div className="flex flex-col">
                          <span className="text-[#9F86D9] text-base font-semibold">
                            {formatCurrency(unitPrice)}
                          </span>
                          {hasItemDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatCurrency(basePrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-xs text-[#646667] mb-1">Số lượng</span>
                        <div className="flex items-center border border-[#DBE2E5] rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.productName, item.stockQuantity)}
                            disabled={updatingItemId === item.id || removingItemId === item.id}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={quantityInputs[item.id] ?? item.quantity}
                            onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                            onBlur={() => handleQuantityInputBlur(item)}
                            onKeyDown={handleQuantityInputKeyDown}
                            disabled={updatingItemId === item.id || removingItemId === item.id}
                            className="w-12 text-center font-bold text-sm text-[#1C1D1D] bg-transparent border-0 focus:outline-none disabled:opacity-50"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.productName, item.stockQuantity)}
                            disabled={updatingItemId === item.id || removingItemId === item.id || item.quantity >= item.stockQuantity}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-xs text-[#646667] mb-1">Tổng</span>
                        <div className="flex flex-col items-end">
                          <span className="text-[#9F86D9] text-base font-bold">
                            {formatCurrency(unitPrice * item.quantity)}
                          </span>
                          {hasItemDiscount && lineDiscount > 0.005 && (
                            <span className="text-xs text-[#E35946]">
                              -{formatCurrency(lineDiscount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden lg:flex items-center w-full">
                    {/* Checkbox & Product Info */}
                    <div className="flex items-center gap-5 flex-[2]">
                    <input
                      type="checkbox"
                      className="w-5 h-5 border border-[#646667] rounded"
                    />
                      <div className="flex items-center gap-5">
                        <div className="w-[89px] h-[89px] border border-[#DBE2E5] rounded">
                          <img
                            src={item.variantImage || item.productImage || '/images/placeholder.webp'}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[#1C1D1D] font-bold text-[15.57px]">
                            {item.productName}
                          </span>
                          {item.variantName && (
                            <span className="text-[#646667] text-xs mt-1">
                              {item.variantName}
                            </span>
                          )}
                          {item.activeDiscount?.campaignName && (
                            <span className="text-xs text-[#E35946] mt-1">
                              {item.activeDiscount.campaignName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  {/* Stock */}
                  <div className="flex-[0.8] text-center">
                    <span className="text-[#1C1D1D] text-sm">
                      {item.stockQuantity > 0 ? `Còn ${item.stockQuantity}` : 'Hết hàng'}
                    </span>
                  </div>

                  {/* Unit Price */}
                  <div className="flex-[0.8] text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[#9F86D9] text-lg font-semibold">
                        {formatCurrency(unitPrice)}
                      </span>
                      {hasItemDiscount && (
                        <span className="text-xs text-[#646667] line-through">
                          {formatCurrency(basePrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex-[1] flex justify-center">
                    <div className="flex items-center border border-[#DBE2E5] rounded w-[136px] h-12">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.productName, item.stockQuantity)}
                        disabled={updatingItemId === item.id || removingItemId === item.id}
                        className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14" stroke="#1C1D1D" strokeWidth="2" />
                        </svg>
                      </button>
                      <div className="flex-1 text-center font-bold text-lg text-[#1C1D1D]">
                        {updatingItemId === item.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#9F86D9] mx-auto"></div>
                        ) : (
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={quantityInputs[item.id] ?? item.quantity.toString()}
                            onChange={(event) => handleQuantityInputChange(item.id, event.target.value)}
                            onBlur={() => handleQuantityInputBlur(item)}
                            onKeyDown={handleQuantityInputKeyDown}
                            disabled={removingItemId === item.id}
                            className="w-full bg-transparent text-center font-bold text-lg text-[#1C1D1D] outline-none"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.productName, item.stockQuantity)}
                        disabled={updatingItemId === item.id || removingItemId === item.id || item.quantity >= item.stockQuantity}
                        className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5v14M5 12h14" stroke="#1C1D1D" strokeWidth="2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex-[0.8] text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[#9F86D9] text-lg">
                        {formatCurrency(item.subtotal)}
                      </span>
                      {hasItemDiscount && (
                        <>
                          <span className="text-xs text-[#646667] line-through">
                            {formatCurrency(originalLineTotal)}
                          </span>
                          {lineDiscount > 0 && (
                            <span className="text-xs text-[#E35946]">
                              -{formatCurrency(lineDiscount)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Remove */}
                  <div className="flex-[0.5] flex justify-center">
                    <button
                      onClick={() => removeItem(item.id, item.productName)}
                      disabled={updatingItemId === item.id || removingItemId === item.id}
                      className="w-6 h-6 flex items-center justify-center text-[#646667] hover:text-[#E35946] disabled:opacity-50 transition-colors"
                    >
                      {removingItemId === item.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E35946]"></div>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="max-w-[1434px] mx-auto px-4 mb-8 sm:mb-12 lg:mb-16 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <a
          href="/shop"
          className="flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-4 border border-[#9F86D9] text-[#9F86D9] rounded font-bold text-xs hover:bg-[#9F86D9] hover:text-white transition-colors"
        >
          <span>{t('cart.continueShopping')}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.33 8h9.34M8 3.33l4.67 4.67L8 12.67" />
          </svg>
        </a>
        <button className="flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-4 bg-[#9F86D9] text-white rounded font-bold text-xs hover:bg-[#8a75c4] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 2l2.67 6m0 0L8 14l3.33-6M4.67 8h10.66M10.33 2l2.67 2.67-2.67 2.66M3 11.33l2.67 2.67L3 16.67" />
          </svg>
          <span>{t('cart.updateCart')}</span>
        </button>
      </div>

      {/* Discount & Checkout Section */}
      <div className="max-w-[1434px] mx-auto px-4 mb-8 sm:mb-12 lg:mb-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Side - Discount & Shipping */}
          <div className="flex-1 space-y-8">
            {/* Discount Code */}
            <div className="flex h-12">
              <input
                type="text"
                placeholder={t('cart.discountCode')}
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 px-4 sm:px-5 border border-[#DBE2E5] rounded-l text-sm sm:text-base text-[#646667] focus:outline-none focus:border-[#9F86D9]"
              />
              <button className="w-20 sm:w-[115px] bg-[#DBE2E5] text-[#1C1D1D] font-bold text-xs sm:text-sm rounded-r hover:bg-[#9F86D9] hover:text-white transition-colors">
                {t('cart.apply')}
              </button>
            </div>

            {/* Shipping Calculation */}
            
          </div>

          {/* Right Side - Checkout Summary */}
          <div className="w-full lg:w-[430px]">
            <div className="border border-[#DBE2E5] rounded p-4 sm:p-5 space-y-2">
              {/* Subtotal */}
              {hasCartDiscount && (
                <div className="flex items-center justify-between py-2 text-sm text-[#646667]">
                  <span>{t('checkout.summary.originalSubtotal')}</span>
                  <span className="line-through">{formatCurrency(originalSubtotal)}</span>
                </div>
              )}
              {hasCartDiscount && (
                <div className="flex items-center justify-between py-2 text-sm text-[#E35946]">
                  <span>{t('checkout.summary.productDiscount')}</span>
                  <span className="font-semibold">-{formatCurrency(discountTotal)}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#1C1D1D]">{t('cart.subtotal')}</span>
                <span className="text-base font-bold text-[#1C1D1D]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="border-t border-[#DBE2E5]" />

              {/* Shipping */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#1C1D1D]">{t('cart.shipping')}</span>
                <span className="text-base font-bold text-[#1C1D1D]">{t('cart.free')}</span>
              </div>
              <div className="border-t border-[#DBE2E5]" />

              {/* Estimate */}
              {/* <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#1C1D1D]">{t('cart.estimateFor')}</span>
                <span className="text-base font-bold text-[#1C1D1D]">United Kingdom</span>
              </div> */}
              <div className="border-t border-[#DBE2E5]" />

              {/* Total */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#1C1D1D]">{t('cart.total')}</span>
                <span className="text-xl font-bold text-[#1C1D1D]">{formatCurrency(total)}</span>
              </div>

              {/* Checkout Button */}
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full h-12 bg-[#9F86D9] text-white font-bold text-sm rounded mt-4 hover:bg-[#8a75c4] transition-colors"
              >
                {t('cart.proceedToCheckout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa "${confirmDialog.itemName}" khỏi giỏ hàng?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmDialog({ isOpen: false, itemId: null, itemName: '' })}
        type="danger"
      />
    </div>
  );
};

export default Cart;
