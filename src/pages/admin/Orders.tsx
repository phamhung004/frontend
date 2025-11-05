import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import orderService, { type AdminOrderSummary } from '../../services/orderService';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../components/ui/ToastContainer';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../constants/order';

const Orders = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders({
        search: search || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        page,
        size,
      });
      setOrders(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to load orders', error);
  toast.error(t('admin.ordersPage.fetchFailure'));
    } finally {
      setLoading(false);
    }
  }, [page, paymentStatus, search, size, status, t, toast]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setPaymentStatus('');
    setPage(0);
  };

  const handleStatusUpdate = async (orderId: number, updates: { status?: string; paymentStatus?: string }) => {
    setUpdatingOrderId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, updates);
  toast.success(t('admin.ordersPage.updateSuccess'));
      await fetchOrders();
    } catch (error) {
      console.error('Failed to update order', error);
  toast.error(t('admin.ordersPage.updateFailure'));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const summaries = useMemo(() => {
    const totalOrderCount = totalElements;
    const pendingCount = orders.filter((order) => order.status === 'PENDING').length;
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount ?? 0), 0);
    return {
      totalOrderCount,
      pendingCount,
      totalRevenue,
    };
  }, [orders, totalElements]);

  const formatStatusLabel = (value: string) => t(`admin.ordersPage.statusLabels.${value}`, value);
  const formatPaymentStatusLabel = (value: string) => t(`admin.ordersPage.paymentStatusLabels.${value}`, value);

  const canGoPrev = page > 0;
  const canGoNext = page + 1 < totalPages;

  return (
    <div className="p-7 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <h2 className="text-xl font-semibold text-brand-purple">{t('admin.ordersPage.title')}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setPage(0);
              void fetchOrders();
            }}
            className="px-4 py-2 text-sm font-medium text-brand-purple border border-brand-purple rounded-lg hover:bg-purple-50"
          >
            {t('admin.ordersPage.refresh')}
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            {t('admin.ordersPage.clearFilters')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">{t('admin.ordersPage.totalOrders')}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{summaries.totalOrderCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">{t('admin.ordersPage.pendingOrders')}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{summaries.pendingCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">{t('admin.ordersPage.revenue')}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{formatCurrency(summaries.totalRevenue)}</p>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div className="flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t('admin.ordersPage.searchPlaceholder')}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-brand-purple focus:outline-none"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-purple focus:outline-none"
          >
            <option value="">{t('admin.ordersPage.allStatuses')}</option>
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {formatStatusLabel(value)}
              </option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={(event) => {
              setPaymentStatus(event.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-purple focus:outline-none"
          >
            <option value="">{t('admin.ordersPage.allPaymentStatuses')}</option>
            {PAYMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {formatPaymentStatusLabel(value)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-brand-purple px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600"
          >
            {t('admin.ordersPage.searchButton')}
          </button>
        </div>
      </form>

      <div className="rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.ordersPage.table.orderNumber')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.ordersPage.table.customer')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.ordersPage.table.placedAt')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.ordersPage.table.items')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.ordersPage.table.total')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.ordersPage.table.status')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('admin.ordersPage.table.paymentStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    {t('admin.ordersPage.loading')}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    {t('admin.ordersPage.empty')}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const customerDisplay = order.customerName || order.customerEmail || t('admin.ordersPage.guestCustomer');
                  const placedAtLabel = order.placedAt
                    ? new Date(order.placedAt).toLocaleString()
                    : t('admin.ordersPage.notAvailable');

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                      <td className="px-4 py-3 font-semibold text-brand-purple">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{customerDisplay}</div>
                        {order.customerEmail && (
                          <div className="text-xs text-gray-500">{order.customerEmail}</div>
                        )}
                        {order.customerPhone && (
                          <div className="text-xs text-gray-500">{order.customerPhone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{placedAtLabel}</td>
                      <td className="px-4 py-3 text-gray-700">{order.itemsCount}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order.id}
                          onChange={(event) => {
                            const value = event.target.value;
                            if (value !== order.status) {
                              void handleStatusUpdate(order.id, { status: value });
                            }
                          }}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs uppercase tracking-wide text-gray-700 focus:border-brand-purple focus:outline-none"
                        >
                          {ORDER_STATUSES.map((value) => (
                            <option key={value} value={value}>
                              {formatStatusLabel(value)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.paymentStatus}
                          disabled={updatingOrderId === order.id}
                          onChange={(event) => {
                            const value = event.target.value;
                            if (value !== order.paymentStatus) {
                              void handleStatusUpdate(order.id, { paymentStatus: value });
                            }
                          }}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs uppercase tracking-wide text-gray-700 focus:border-brand-purple focus:outline-none"
                        >
                          {PAYMENT_STATUSES.map((value) => (
                            <option key={value} value={value}>
                              {formatPaymentStatusLabel(value)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 text-xs text-gray-500">
          <span>
            {t('admin.ordersPage.paginationSummary', {
              from: orders.length === 0 ? 0 : page * size + 1,
              to: page * size + orders.length,
              total: totalElements,
            })}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => canGoPrev && setPage((prev) => Math.max(prev - 1, 0))}
              className={`rounded-lg border border-gray-200 px-3 py-1 font-medium ${
                canGoPrev ? 'text-gray-700 hover:bg-gray-100' : 'cursor-not-allowed text-gray-400'
              }`}
            >
              {t('admin.ordersPage.prev')}
            </button>
            <span className="font-semibold text-gray-700">
              {page + 1} / {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => canGoNext && setPage((prev) => prev + 1)}
              className={`rounded-lg border border-gray-200 px-3 py-1 font-medium ${
                canGoNext ? 'text-gray-700 hover:bg-gray-100' : 'cursor-not-allowed text-gray-400'
              }`}
            >
              {t('admin.ordersPage.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
