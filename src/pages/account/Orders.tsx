import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import orderService, { type CheckoutResponsePayload } from '../../services/orderService';
import { useToast } from '../../components/ui/ToastContainer';
import { formatCurrency } from '../../utils/currency';
import { ORDER_STATUSES, type OrderStatus } from '../../constants/order';

const ORDER_TABS = ['ALL', ...ORDER_STATUSES] as const;

type OrderTab = (typeof ORDER_TABS)[number];

const Orders = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<OrderTab>('ALL');
  const [orders, setOrders] = useState<CheckoutResponsePayload[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user?.backendUserId) {
      setOrders([]);
      return;
    }

    setLoadingOrders(true);
    try {
      const response = await orderService.getUserOrders(user.backendUserId);
      setOrders(response);
    } catch (error) {
      console.error('Failed to load user orders', error);
      toast.error(t('orders.fetchFailure'));
    } finally {
      setLoadingOrders(false);
    }
  }, [t, toast, user?.backendUserId]);

  useEffect(() => {
    if (!authLoading) {
      void fetchOrders();
    }
  }, [authLoading, fetchOrders]);

  const tabs = useMemo(
    () =>
      ORDER_TABS.map((tab) => ({
        id: tab,
        label: t(`orders.tabs.${tab}`, { defaultValue: tab === 'ALL' ? t('orders.all') : tab }),
      })),
    [t]
  );

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') {
      return orders;
    }
    return orders.filter((order) => order.status === activeTab);
  }, [activeTab, orders]);

  const isLoading = authLoading || loadingOrders;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-indigo-100 text-indigo-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-sky-100 text-sky-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'RETURNED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OrderStatus | string) =>
    t(`orders.statusLabels.${status}`, { defaultValue: status });

  if (!authLoading && !user?.backendUserId) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#9F86D9] to-[#B69EE6]">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'DM Sans' }}>
            {t('orders.title')}
          </h2>
        </div>
        <div className="p-6">
          <p className="text-center text-gray-500" style={{ fontFamily: 'DM Sans' }}>
            {t('orders.signInPrompt')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#9F86D9] to-[#B69EE6]">
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'DM Sans' }}>
          {t('orders.title')}
        </h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-[#9F86D9] border-b-2 border-[#9F86D9]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'DM Sans' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-[#9F86D9] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500" style={{ fontFamily: 'DM Sans' }}>
              {t('orders.loading')}
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-32 h-32 mb-4 flex items-center justify-center">
              <svg className="w-full h-full text-gray-300" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-500 text-center" style={{ fontFamily: 'DM Sans' }}>
              {t('orders.empty')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = order.status as OrderStatus;
              const orderKey = order.orderNumber ?? `order-${order.orderId ?? 'unknown'}`;
              const orderDate = order.placedAt
                ? new Date(order.placedAt).toLocaleString()
                : t('orders.notAvailable');
              const totalDisplay = formatCurrency(Number(order.totalAmount ?? 0));

              return (
                <div key={orderKey} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                          {t('orders.orderId')}:
                        </span>
                        <span className="ml-2 text-sm font-medium text-gray-900" style={{ fontFamily: 'DM Sans' }}>
                          {order.orderNumber ?? order.orderId}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                          {t('orders.orderDate')}:
                        </span>
                        <span className="ml-2 text-sm text-gray-900" style={{ fontFamily: 'DM Sans' }}>
                          {orderDate}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                    style={{ fontFamily: 'DM Sans' }}
                  >
                      {getStatusText(status)}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="p-6 space-y-4">
                    {(order.items ?? []).map((item, index) => {
                      const itemName = item.variantName
                        ? `${item.productName} • ${item.variantName}`
                        : item.productName;
                      const unitPrice = formatCurrency(Number(item.unitPrice ?? 0));
                      const subtotal = formatCurrency(Number(item.subtotal ?? 0));
                      const placeholderImage = '/images/placeholder.webp';
                      const imageUrl = item.thumbnailUrl || placeholderImage;

                      return (
                        <div key={`${orderKey}-item-${index}`} className="flex gap-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img 
                              src={imageUrl} 
                              alt={itemName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = placeholderImage;
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-gray-900 mb-1" style={{ fontFamily: 'DM Sans' }}>
                              {itemName}
                            </h3>
                            <p className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                              {t('orders.quantity')}: {item.quantity}
                            </p>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'DM Sans' }}>
                              {t('orders.unitPrice')}: {unitPrice}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-medium text-[#9F86D9]" style={{ fontFamily: 'DM Sans' }}>
                              {subtotal}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-600" style={{ fontFamily: 'DM Sans' }}>
                        {t('orders.total')}:
                      </span>
                      <span className="ml-2 text-lg font-bold text-[#9F86D9]" style={{ fontFamily: 'DM Sans' }}>
                        {totalDisplay}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      {status === 'DELIVERED' && (
                        <button
                          className="px-4 py-2 border border-[#9F86D9] text-[#9F86D9] rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                          style={{ fontFamily: 'DM Sans' }}
                        >
                          {t('orders.buyAgain')}
                        </button>
                      )}
                      <button
                        className="px-4 py-2 bg-[#9F86D9] text-white rounded-lg hover:bg-[#8B74C5] transition-colors text-sm font-medium"
                        style={{ fontFamily: 'DM Sans' }}
                      >
                        {t('orders.viewDetail')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
