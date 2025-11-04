import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/currency';
import InstagramFeed from '../components/InstagramFeed';
import orderService, { type CheckoutResponsePayload } from '../services/orderService';
import { useToast } from '../components/ui/ToastContainer';

const formatAddress = (address?: CheckoutResponsePayload['billing']) => {
  if (!address) return '';
  const parts = [address.address1, address.address2, address.country, address.postcode]
    .filter((part) => part && part.trim() !== '');
  return parts.join(', ');
};

const OrderSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const initialState = location.state as { order?: CheckoutResponsePayload } | undefined;
  const queryOrderNumber = searchParams.get('orderNumber');

  const [order, setOrder] = useState<CheckoutResponsePayload | null>(initialState?.order ?? null);
  const [loading, setLoading] = useState<boolean>(false);

  const orderNumber = useMemo(() => {
    if (order?.orderNumber) return order.orderNumber;
    if (queryOrderNumber) return queryOrderNumber;
    return initialState?.order?.orderNumber ?? null;
  }, [order, initialState, queryOrderNumber]);

  useEffect(() => {
    if (!orderNumber) {
      navigate('/shop', { replace: true });
      return;
    }

    if (order && order.orderNumber === orderNumber) {
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrderSummary(orderNumber);
        setOrder(response);
      } catch {
        toast.error(t('orderSuccess.errors.notFound'));
        navigate('/shop', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    void fetchOrder();
  }, [orderNumber, order, navigate, t, toast]);

  if (loading || !orderNumber) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#9F86D9] mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-[#1C1D1D]">{t('orderSuccess.errors.notFound')}</h1>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#9F86D9] text-white rounded font-semibold hover:bg-[#8a75c4] transition-colors"
          >
            {t('orderSuccess.backToShop')}
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = Number(order.subtotalAmount ?? 0);
  const shippingFee = Number(order.shippingFee ?? 0);
  const taxAmount = Number(order.taxAmount ?? 0);
  const discountAmount = Number(order.discountAmount ?? 0);
  const total = Number(order.totalAmount ?? 0);
  const discountLabel = order.couponCode
    ? t('orderSuccess.totals.discountWithCode', { code: order.couponCode })
    : t('orderSuccess.totals.discount');

  const placedAt = order.placedAt ? new Date(order.placedAt).toLocaleString() : '';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1100px] mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-[48px] font-bold text-[#1C1D1D] mb-4" style={{ fontFamily: 'Lobster Two' }}>
            {t('orderSuccess.title')}
          </h1>
          <p className="text-[#646667] text-lg">{t('orderSuccess.subtitle')}</p>
        </div>

        <div className="bg-[#F9F7FF] border border-[#DBE2E5] rounded-2xl p-10 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-[#9F86D9] mb-2">{t('orderSuccess.orderNumber')}</p>
              <p className="text-2xl font-semibold text-[#1C1D1D]">{order.orderNumber}</p>
              {placedAt && (
                <p className="text-sm text-[#646667] mt-2">{placedAt}</p>
              )}
              {order.couponCode && (
                <p className="text-sm text-[#646667] mt-1">
                  {t('orderSuccess.appliedCoupon', { code: order.couponCode })}
                </p>
              )}
            </div>
            <div className="text-sm text-[#646667]">
              {order.customerEmail && (
                <p>{t('orderSuccess.contactMessage', { email: order.customerEmail })}</p>
              )}
              {order.customerPhone && (
                <p>{t('orderSuccess.phoneMessage', { phone: order.customerPhone })}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <section className="border border-[#DBE2E5] rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#1C1D1D] mb-4">{t('orderSuccess.items')}</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={`${item.productId}-${item.variantId ?? 'default'}`} className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-semibold text-[#1C1D1D]">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-sm text-[#646667] mt-1">{item.variantName}</p>
                      )}
                      <p className="text-sm text-[#646667] mt-1">
                        {t('cart.quantity')}: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-[#1C1D1D]">{formatCurrency(Number(item.subtotal ?? 0))}</p>
                      <p className="text-xs text-[#646667] mt-1">
                        {formatCurrency(Number(item.unitPrice ?? 0))} / {t('cart.quantity')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-[#DBE2E5] rounded-xl p-6">
              <h2 className="text-xl font-bold text-[#1C1D1D] mb-4">{t('orderSuccess.totals.title')}</h2>
              <div className="space-y-3 text-sm text-[#1C1D1D]">
                <div className="flex justify-between">
                  <span>{t('orderSuccess.totals.subtotal')}</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('orderSuccess.totals.shipping')}</span>
                  <span className="font-semibold">{formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('orderSuccess.totals.tax')}</span>
                  <span className="font-semibold">{formatCurrency(taxAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#E35946]">
                    <span>{discountLabel}</span>
                    <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-[#DBE2E5] pt-3 flex justify-between text-base font-bold text-[#1C1D1D]">
                  <span>{t('orderSuccess.totals.total')}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="border border-[#DBE2E5] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#1C1D1D] mb-3">{t('orderSuccess.billingAddress')}</h3>
              <p className="text-sm text-[#1C1D1D] font-medium">
                {order.billing.firstName} {order.billing.lastName}
              </p>
              <p className="text-sm text-[#646667]">{order.billing.phone}</p>
              <p className="text-sm text-[#646667]">{order.billing.email}</p>
              <p className="text-sm text-[#646667] mt-2">{formatAddress(order.billing)}</p>
            </section>

            <section className="border border-[#DBE2E5] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#1C1D1D] mb-3">{t('orderSuccess.shippingAddress')}</h3>
              <p className="text-sm text-[#1C1D1D] font-medium">
                {order.shipping.firstName} {order.shipping.lastName}
              </p>
              <p className="text-sm text-[#646667]">{order.shipping.phone}</p>
              <p className="text-sm text-[#646667]">{order.shipping.email}</p>
              <p className="text-sm text-[#646667] mt-2">{formatAddress(order.shipping)}</p>
            </section>

            <section className="border border-[#DBE2E5] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#1C1D1D] mb-3">{t('orderSuccess.paymentMethod')}</h3>
              <p className="text-sm text-[#646667]">{order.paymentMethod ?? 'COD'}</p>
            </section>

            <div className="flex flex-col gap-3">
              <Link
                to="/shop"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#9F86D9] text-white rounded font-semibold hover:bg-[#8a75c4] transition-colors"
              >
                {t('orderSuccess.backToShop')}
              </Link>
              <Link
                to="/account/orders"
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-[#9F86D9] text-[#9F86D9] rounded font-semibold hover:bg-[#9F86D9] hover:text-white transition-colors"
              >
                {t('orderSuccess.viewOrders')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <InstagramFeed />
    </div>
  );
};

export default OrderSuccess;
