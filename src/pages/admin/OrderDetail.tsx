import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import orderService, { type CheckoutResponsePayload } from '../../services/orderService';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../components/ui/ToastContainer';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../constants/order';

const OrderDetail = () => {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState<CheckoutResponsePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const response = await orderService.getOrderDetail(Number(orderId));
      setOrder(response);
    } catch (error) {
      console.error('Failed to load order detail', error);
      toast.error(t('admin.orderDetail.fetchFailure'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (updates: { status?: string; paymentStatus?: string }) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updated = await orderService.updateOrderStatus(order.orderId, updates);
      setOrder(updated);
      toast.success(t('admin.orderDetail.updateSuccess'));
    } catch (error) {
      console.error('Failed to update order', error);
      toast.error(t('admin.orderDetail.updateFailure'));
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatStatusLabel = (value: string) => t(`admin.ordersPage.statusLabels.${value}`, value);
  const formatPaymentStatusLabel = (value: string) => t(`admin.ordersPage.paymentStatusLabels.${value}`, value);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('admin.orderDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">{t('admin.orderDetail.notFound')}</p>
          <button
            onClick={() => navigate('/admin?tab=orders')}
            className="mt-4 px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-purple-600"
          >
            {t('admin.orderDetail.backToOrders')}
          </button>
        </div>
      </div>
    );
  }

  const placedAtLabel = order.placedAt
    ? new Date(order.placedAt).toLocaleString()
    : t('admin.orderDetail.notAvailable');

  return (
    <div className="p-7 space-y-6 print:p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin?tab=orders')}
            className="p-2 text-gray-600 hover:text-brand-purple"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-brand-purple">
              {t('admin.orderDetail.title')} #{order.orderNumber}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('admin.orderDetail.placedAt')}: {placedAtLabel}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {t('admin.orderDetail.print')}
          </button>
          <button
            onClick={fetchOrderDetail}
            className="px-4 py-2 text-sm font-medium text-brand-purple border border-brand-purple rounded-lg hover:bg-purple-50"
          >
            {t('admin.orderDetail.refresh')}
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">{t('admin.orderDetail.orderStatus')}</p>
          <select
            value={order.status}
            disabled={updating}
            onChange={(e) => {
              const value = e.target.value;
              if (value !== order.status) {
                handleStatusUpdate({ status: value });
              }
            }}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium focus:border-brand-purple focus:outline-none"
          >
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {formatStatusLabel(value)}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">{t('admin.orderDetail.paymentStatus')}</p>
          <select
            value={order.paymentStatus}
            disabled={updating}
            onChange={(e) => {
              const value = e.target.value;
              if (value !== order.paymentStatus) {
                handleStatusUpdate({ paymentStatus: value });
              }
            }}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium focus:border-brand-purple focus:outline-none"
          >
            {PAYMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {formatPaymentStatusLabel(value)}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-500">{t('admin.orderDetail.paymentMethod')}</p>
          <p className="mt-2 text-xl font-semibold text-gray-900">{order.paymentMethod || 'COD'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.orderDetail.orderItems')}</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
                    {item.variantName && (
                      <p className="text-sm text-gray-500">{item.variantName}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-gray-600">
                        {t('admin.orderDetail.quantity')}: <span className="font-medium">{item.quantity}</span>
                      </span>
                      <span className="text-gray-600">
                        {t('admin.orderDetail.unitPrice')}: <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('admin.orderDetail.subtotal')}</span>
                  <span className="font-medium">{formatCurrency(order.subtotalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('admin.orderDetail.shippingFee')}</span>
                  <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
                </div>
                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('admin.orderDetail.tax')}</span>
                    <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t('admin.orderDetail.discount')}</span>
                    <span className="font-medium">-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                {order.couponCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('admin.orderDetail.couponApplied')}</span>
                    <span className="font-medium text-brand-purple">{order.couponCode}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">{t('admin.orderDetail.total')}</span>
                  <span className="text-brand-purple">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.orderDetail.customerInfo')}</h3>
            <div className="space-y-3">
              {order.customerName && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t('admin.orderDetail.name')}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{order.customerName}</p>
                </div>
              )}
              {order.customerEmail && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t('admin.orderDetail.email')}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{order.customerEmail}</p>
                </div>
              )}
              {order.customerPhone && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t('admin.orderDetail.phone')}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{order.customerPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Billing Address */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.orderDetail.billingAddress')}</h3>
            <div className="text-sm text-gray-700 space-y-1">
              {order.billing.firstName || order.billing.lastName ? (
                <p className="font-medium">{[order.billing.firstName, order.billing.lastName].filter(Boolean).join(' ')}</p>
              ) : null}
              {order.billing.address1 && <p>{order.billing.address1}</p>}
              {order.billing.address2 && <p>{order.billing.address2}</p>}
              {order.billing.postcode && order.billing.country && (
                <p>{order.billing.postcode}, {order.billing.country}</p>
              )}
              {order.billing.email && <p className="text-gray-600">{order.billing.email}</p>}
              {order.billing.phone && <p className="text-gray-600">{order.billing.phone}</p>}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipToDifferentAddress && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.orderDetail.shippingAddress')}</h3>
              <div className="text-sm text-gray-700 space-y-1">
                {order.shipping.firstName || order.shipping.lastName ? (
                  <p className="font-medium">{[order.shipping.firstName, order.shipping.lastName].filter(Boolean).join(' ')}</p>
                ) : null}
                {order.shipping.address1 && <p>{order.shipping.address1}</p>}
                {order.shipping.address2 && <p>{order.shipping.address2}</p>}
                {order.shipping.postcode && order.shipping.country && (
                  <p>{order.shipping.postcode}, {order.shipping.country}</p>
                )}
                {order.shipping.email && <p className="text-gray-600">{order.shipping.email}</p>}
                {order.shipping.phone && <p className="text-gray-600">{order.shipping.phone}</p>}
              </div>
            </div>
          )}

          {/* Order Info */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.orderDetail.orderInfo')}</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('admin.orderDetail.orderNumber')}</p>
                <p className="font-mono font-medium text-gray-900 mt-1">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('admin.orderDetail.orderId')}</p>
                <p className="font-mono font-medium text-gray-900 mt-1">#{order.orderId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('admin.orderDetail.itemsCount')}</p>
                <p className="font-medium text-gray-900 mt-1">{order.items.length} {t('admin.orderDetail.items')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:p-4, .print\\:p-4 * {
            visibility: visible;
          }
          .print\\:p-4 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetail;
