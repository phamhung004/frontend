import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import orderService, { type CheckoutResponsePayload } from '../../services/orderService';
import { useToast } from '../../components/ui/ToastContainer';
import { formatCurrency } from '../../utils/currency';
import { type OrderStatus } from '../../constants/order';

const OrderDetail = () => {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [order, setOrder] = useState<CheckoutResponsePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId || !user?.backendUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await orderService.getOrderSummary(orderId);
        setOrder(response);
      } catch (err) {
        console.error('Failed to load order details', err);
        setError(t('orderDetail.fetchError'));
        toast.error(t('orderDetail.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      void fetchOrderDetail();
    }
  }, [orderId, user?.backendUserId, authLoading, t, toast]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SHIPPED':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'RETURNED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: OrderStatus | string) =>
    t(`orders.statusLabels.${status}`, { defaultValue: status });

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPaymentStatusText = (status: string) => {
    const key = status?.toUpperCase();
    return t(`orderDetail.paymentStatus.${key}`, { defaultValue: status });
  };

  const getStatusTimeline = (status: string) => {
    const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = allStatuses.indexOf(status);
    
    if (status === 'CANCELLED' || status === 'RETURNED') {
      return [{ status, active: true, completed: false }];
    }

    return allStatuses.map((s, index) => ({
      status: s,
      active: index === currentIndex,
      completed: index < currentIndex,
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-[#9F86D9] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500" style={{ fontFamily: 'DM Sans' }}>
              {t('orderDetail.loading')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.backendUserId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500" style={{ fontFamily: 'DM Sans' }}>
              {t('orders.signInPrompt')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => navigate('/account/orders')}
              className="flex items-center text-[#9F86D9] hover:text-[#8B74C5] transition-colors"
              style={{ fontFamily: 'DM Sans' }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('orderDetail.backToOrders')}
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'DM Sans' }}>
              {t('orderDetail.notFound')}
            </h3>
            <p className="text-gray-500" style={{ fontFamily: 'DM Sans' }}>
              {error || t('orderDetail.notFoundMessage')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const status = order.status as OrderStatus;
  const timeline = getStatusTimeline(order.status);
  const placeholderImage = '/images/placeholder.webp';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/account/orders')}
            className="flex items-center text-[#9F86D9] hover:text-[#8B74C5] transition-colors"
            style={{ fontFamily: 'DM Sans' }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('orderDetail.backToOrders')}
          </button>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'DM Sans' }}>
                {t('orderDetail.title')} #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                {t('orders.orderDate')}: {order.placedAt ? new Date(order.placedAt).toLocaleString() : t('orders.notAvailable')}
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(status)}`}
                style={{ fontFamily: 'DM Sans' }}
              >
                {getStatusText(status)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                  {t('orderDetail.paymentStatus.label')}:
                </span>
                <span className={`text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`} style={{ fontFamily: 'DM Sans' }}>
                  {getPaymentStatusText(order.paymentStatus)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Timeline */}
        {status !== 'CANCELLED' && status !== 'RETURNED' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6" style={{ fontFamily: 'DM Sans' }}>
              {t('orderDetail.orderTracking')}
            </h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200" style={{ left: '2%', right: '2%' }}>
                <div
                  className="h-full bg-[#9F86D9] transition-all duration-500"
                  style={{ 
                    width: `${(timeline.findIndex(t => t.active) / (timeline.length - 1)) * 100}%` 
                  }}
                />
              </div>
              
              {/* Timeline Steps */}
              <div className="relative flex justify-between">
                {timeline.map((step) => (
                  <div key={step.status} className="flex flex-col items-center" style={{ width: `${100 / timeline.length}%` }}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        step.completed || step.active
                          ? 'bg-[#9F86D9] border-[#9F86D9]'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {step.completed ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className={`w-3 h-3 rounded-full ${step.active ? 'bg-white' : 'bg-gray-300'}`} />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs text-center ${
                        step.completed || step.active ? 'text-[#9F86D9] font-medium' : 'text-gray-500'
                      }`}
                      style={{ fontFamily: 'DM Sans' }}
                    >
                      {getStatusText(step.status as OrderStatus)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DM Sans' }}>
                  {t('orderDetail.orderItems')}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {(order.items ?? []).map((item, index) => {
                  const itemName = item.variantName
                    ? `${item.productName} • ${item.variantName}`
                    : item.productName;
                  const unitPrice = formatCurrency(Number(item.unitPrice ?? 0));
                  const subtotal = formatCurrency(Number(item.subtotal ?? 0));
                  const imageUrl = item.thumbnailUrl || placeholderImage;

                  return (
                    <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <Link
                        to={`/product/${item.productId}`}
                        className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={imageUrl}
                          alt={itemName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = placeholderImage;
                          }}
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          className="block"
                        >
                          <h3 className="text-base font-medium text-gray-900 mb-1 hover:text-[#9F86D9] transition-colors" style={{ fontFamily: 'DM Sans' }}>
                            {itemName}
                          </h3>
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                              {t('orders.unitPrice')}: {unitPrice}
                            </p>
                            <p className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                              {t('orders.quantity')}: {item.quantity}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-[#9F86D9]" style={{ fontFamily: 'DM Sans' }}>
                            {subtotal}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DM Sans' }}>
                  {t('orderDetail.shippingAddress')}
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium" style={{ fontFamily: 'DM Sans' }}>
                    {order.shipping.firstName} {order.shipping.lastName}
                  </p>
                  <p className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                    {order.shipping.address1}
                  </p>
                  {order.shipping.address2 && (
                    <p className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                      {order.shipping.address2}
                    </p>
                  )}
                  <p className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                    {order.shipping.country} {order.shipping.postcode}
                  </p>
                  <p className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                    {t('orderDetail.phone')}: {order.shipping.phone}
                  </p>
                  <p className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                    {t('orderDetail.email')}: {order.shipping.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Billing Address (if different) */}
            {order.shipToDifferentAddress && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DM Sans' }}>
                    {t('orderDetail.billingAddress')}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    <p className="text-gray-900 font-medium" style={{ fontFamily: 'DM Sans' }}>
                      {order.billing.firstName} {order.billing.lastName}
                    </p>
                    <p className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                      {order.billing.address1}
                    </p>
                    {order.billing.address2 && (
                      <p className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                        {order.billing.address2}
                      </p>
                    )}
                    <p className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                      {order.billing.country} {order.billing.postcode}
                    </p>
                    <p className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                      {t('orderDetail.phone')}: {order.billing.phone}
                    </p>
                    <p className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                      {t('orderDetail.email')}: {order.billing.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#9F86D9] to-[#B69EE6]">
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'DM Sans' }}>
                  {t('orderDetail.orderSummary')}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                    {t('orderDetail.subtotal')}
                  </span>
                  <span className="text-gray-900 font-medium" style={{ fontFamily: 'DM Sans' }}>
                    {formatCurrency(order.subtotalAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                    {t('orderDetail.shipping')}
                  </span>
                  <span className="text-gray-900 font-medium" style={{ fontFamily: 'DM Sans' }}>
                    {formatCurrency(order.shippingFee)}
                  </span>
                </div>

                {order.taxAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                      {t('orderDetail.tax')}
                    </span>
                    <span className="text-gray-900 font-medium" style={{ fontFamily: 'DM Sans' }}>
                      {formatCurrency(order.taxAmount)}
                    </span>
                  </div>
                )}

                {order.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span style={{ fontFamily: 'DM Sans' }}>
                      {order.couponCode 
                        ? t('orderDetail.discountWithCode', { code: order.couponCode })
                        : t('orderDetail.discount')}
                    </span>
                    <span className="font-medium" style={{ fontFamily: 'DM Sans' }}>
                      -{formatCurrency(order.discountAmount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'DM Sans' }}>
                      {t('orderDetail.total')}
                    </span>
                    <span className="text-xl font-bold text-[#9F86D9]" style={{ fontFamily: 'DM Sans' }}>
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {order.paymentMethod && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                        {t('orderDetail.paymentMethod')}
                      </span>
                      <span className="text-gray-900 font-medium" style={{ fontFamily: 'DM Sans' }}>
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  {status === 'DELIVERED' && (
                    <button
                      className="w-full px-4 py-3 border-2 border-[#9F86D9] text-[#9F86D9] rounded-lg hover:bg-purple-50 transition-colors font-medium"
                      style={{ fontFamily: 'DM Sans' }}
                    >
                      {t('orderDetail.buyAgain')}
                    </button>
                  )}
                  {(status === 'PENDING' || status === 'CONFIRMED') && (
                    <button
                      className="w-full px-4 py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium"
                      style={{ fontFamily: 'DM Sans' }}
                    >
                      {t('orderDetail.cancelOrder')}
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/account/orders')}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    style={{ fontFamily: 'DM Sans' }}
                  >
                    {t('orderDetail.backToOrders')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
