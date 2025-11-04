import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/currency';

const CartDropdown = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cart, removeItem } = useCart();

  const handleRemoveItem = async (cartItemId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeItem(cartItemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-50">
        <p className="text-center text-gray-500">{t('cart.empty')}</p>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('cart.title')} ({cart.totalItems})
        </h3>
      </div>

      {/* Cart Items */}
      <div className="max-h-96 overflow-y-auto">
        {cart.items.map((item) => {
          const unitPrice = Number(item.unitPrice ?? 0);
          const basePrice = Number(item.basePrice ?? unitPrice);
          const discountPerUnit = item.discountAmount !== undefined && item.discountAmount !== null
            ? Number(item.discountAmount)
            : Math.max(basePrice - unitPrice, 0);
          const hasDiscount = discountPerUnit > 0.005 || basePrice - unitPrice > 0.005;
          const lineDiscount = hasDiscount ? discountPerUnit * item.quantity : 0;

          return (
            <div 
              key={item.id} 
              className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={item.variantImage || item.productImage || '/images/placeholder.webp'}
                    alt={item.productName}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {item.productName}
                  </h4>
                  {item.variantName && (
                    <p className="text-xs text-gray-500 mt-1">
                      {item.variantName}
                    </p>
                  )}
                  {item.activeDiscount?.campaignName && (
                    <p className="text-xs text-[#E35946] mt-1 truncate">
                      {item.activeDiscount.campaignName}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col text-sm text-gray-600">
                      <span>
                        {item.quantity} × {formatCurrency(unitPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatCurrency(basePrice)}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-[#9F86D9]">
                        {formatCurrency(item.subtotal)}
                      </span>
                      {hasDiscount && lineDiscount > 0 && (
                        <span className="block text-xs text-[#E35946]">
                          -{formatCurrency(lineDiscount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => handleRemoveItem(item.id, e)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        {/* Subtotal */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-medium text-gray-900">
            {t('cart.subtotal')}:
          </span>
          <span className="text-lg font-bold text-[#9F86D9]">
            {formatCurrency(cart.subtotal)}
          </span>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleViewCart}
            className="w-full py-2.5 px-4 bg-white border-2 border-[#9F86D9] text-[#9F86D9] rounded-lg font-medium hover:bg-[#9F86D9] hover:text-white transition-colors"
          >
            {t('cart.viewCart')}
          </button>
          <button
            onClick={handleCheckout}
            className="w-full py-2.5 px-4 bg-[#9F86D9] text-white rounded-lg font-medium hover:bg-[#8a75c4] transition-colors"
          >
            {t('cart.checkout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDropdown;
