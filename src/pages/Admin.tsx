import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/currency';
import {
  ChartPieIcon,
  ShoppingBagIcon,
  CubeIcon,
  TagIcon,
  UserGroupIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  SunIcon,
  ClockIcon,
  ChevronDownIcon,
  SparklesIcon,
  GiftIcon,
  TicketIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Categories from './admin/Categories';
import Products from './admin/Products';
import OrdersPage from './admin/Orders';
import Coupons from './admin/Coupons';
import Customers from './admin/Customers';
import Reviews from './Reviews';
import TrackingAnalytics from './admin/TrackingAnalytics';
import LanguageSwitcher from '../components/LanguageSwitcher';
import DiscountCampaigns from './admin/DiscountCampaigns';
import NotificationDropdown from '../components/NotificationDropdown';
import { NotificationProvider } from '../contexts/NotificationContext';
import adminService from '../services/adminService';
import type { AdminStatsOverview } from '../types/admin';
import DashboardStats from '../components/admin/DashboardStats';
import RevenueChart from '../components/admin/RevenueChart';
import OrdersChart from '../components/admin/OrdersChart';
import TopProductsChart from '../components/admin/TopProductsChart';
import CategoryDistribution from '../components/admin/CategoryDistribution';
import CustomerGrowthChart from '../components/admin/CustomerGrowthChart';

type AdminMenuKey =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'coupons'
  | 'discounts'
  | 'categories'
  | 'customers'
  | 'shipping'
  | 'reviews'
  | 'tracking';

const Admin = () => {
  const { t, i18n } = useTranslation();
  const [selectedMenu, setSelectedMenu] = useState<AdminMenuKey>('dashboard');
  const [overview, setOverview] = useState<AdminStatsOverview | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language || undefined, { month: 'short' }),
    [i18n.language]
  );

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setIsLoadingOverview(true);
        setOverviewError(null);
        const data = await adminService.getStatsOverview();
        setOverview(data);
      } catch (error) {
        console.error('Failed to load admin overview', error);
        setOverviewError('fetch_failed');
      } finally {
        setIsLoadingOverview(false);
      }
    };

    void fetchOverview();
  }, []);

  // Unused - kept for reference
  /*const stats = useMemo<StatCardData[]>(() => {
    const numberFormatter = new Intl.NumberFormat(i18n.language || undefined, {
      maximumFractionDigits: 0,
    });

    if (!overview) {
      return [
        {
          key: 'totalCustomers',
          title: t('admin.totalCustomers'),
          displayValue: '—',
          changeLabel: null,
          isPositive: true,
          bgColor: 'bg-purple-50',
          iconColor: 'text-brand-purple',
          icon: UserGroupIcon,
        },
        {
          key: 'totalOrders',
          title: t('admin.totalOrders'),
          displayValue: '—',
          changeLabel: null,
          isPositive: true,
          bgColor: 'bg-orange-50',
          iconColor: 'text-brand-orange',
          icon: ShoppingBagIcon,
        },
        {
          key: 'totalRevenue',
          title: t('admin.revenue'),
          displayValue: formatCurrency(0),
          changeLabel: null,
          isPositive: true,
          bgColor: 'bg-purple-50',
          iconColor: 'text-brand-purple',
          icon: ChartPieIcon,
        },
        {
          key: 'monthlyRevenueGrowth',
          title: t('admin.monthlyGrowth'),
          displayValue: '0.0%',
          changeLabel: null,
          isPositive: true,
          bgColor: 'bg-orange-50',
          iconColor: 'text-brand-orange',
          icon: ArrowTrendingUpIcon,
        },
      ];
    }

    return [
      {
        key: 'totalCustomers',
        title: t('admin.totalCustomers'),
        displayValue: numberFormatter.format(overview.totalCustomers),
        changeLabel: buildChangeLabel(overview.customersGrowthPercentage),
        isPositive: (overview.customersGrowthPercentage ?? 0) >= 0,
        bgColor: 'bg-purple-50',
        iconColor: 'text-brand-purple',
        icon: UserGroupIcon,
      },
      {
        key: 'totalOrders',
        title: t('admin.totalOrders'),
        displayValue: numberFormatter.format(overview.totalOrders),
        changeLabel: buildChangeLabel(overview.ordersGrowthPercentage),
        isPositive: (overview.ordersGrowthPercentage ?? 0) >= 0,
        bgColor: 'bg-orange-50',
        iconColor: 'text-brand-orange',
        icon: ShoppingBagIcon,
      },
      {
        key: 'totalRevenue',
        title: t('admin.revenue'),
        displayValue: formatCurrency(overview.totalRevenue ?? 0),
        changeLabel: buildChangeLabel(overview.revenueGrowthPercentage),
        isPositive: (overview.revenueGrowthPercentage ?? 0) >= 0,
        bgColor: 'bg-purple-50',
        iconColor: 'text-brand-purple',
        icon: ChartPieIcon,
      },
      {
        key: 'monthlyRevenueGrowth',
        title: t('admin.monthlyGrowth'),
        displayValue: formatPercentageValue(overview.monthlyRevenueGrowthPercentage),
        changeLabel: buildChangeLabel(overview.monthlyRevenueGrowthDelta),
        isPositive: (overview.monthlyRevenueGrowthDelta ?? 0) >= 0,
        bgColor: 'bg-orange-50',
        iconColor: 'text-brand-orange',
        icon: ArrowTrendingUpIcon,
      },
    ];
  }, [overview, t, i18n.language]);*/

  const chartData = useMemo(() => {
    const fallback = [
      { month: 'Jan', value: 20 },
      { month: 'Feb', value: 50 },
      { month: 'Mar', value: 30 },
      { month: 'Apr', value: 60 },
      { month: 'May', value: 10 },
      { month: 'Jun', value: 40 },
      { month: 'Jul', value: 20 },
      { month: 'Aug', value: 50 },
      { month: 'Sep', value: 30 },
      { month: 'Oct', value: 60 },
      { month: 'Nov', value: 10 },
      { month: 'Dec', value: 40 },
    ];

    if (!overview) {
      return fallback;
    }

    if (overview.monthlySales.length === 0) {
      const baseDate = new Date();
      return Array.from({ length: 12 }, (_, index) => {
        const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - (11 - index), 1);
        return {
          month: monthFormatter.format(date),
          value: 0,
        };
      });
    }

    const revenues = overview.monthlySales.map((item) => Math.max(Number(item.revenue ?? 0), 0));
    const maxRevenue = Math.max(...revenues, 0);

    return overview.monthlySales.map((item, index) => {
      const normalized = maxRevenue > 0 ? Math.round((revenues[index] / maxRevenue) * 100) : 0;
      return {
        month: monthFormatter.format(new Date(item.year, item.month - 1, 1)),
        value: normalized,
      };
    });
  }, [overview, monthFormatter]);

  // Unused - kept for reference
  /*const locationColors = useMemo(
    () => ['#9F86D9', '#EDA62A', '#E35946', '#B8A6D9', '#6FCF97'],
    []
  );

  const revenueByLocation = useMemo(() => {
    if (!overview) {
      return [
        { country: 'Vietnam', percentage: '45.2%', color: '#9F86D9' },
        { country: 'United States', percentage: '28.5%', color: '#EDA62A' },
        { country: 'Japan', percentage: '16.8%', color: '#E35946' },
        { country: 'Other', percentage: '9.5%', color: '#B8A6D9' },
      ];
    }

    if (overview.revenueByLocation.length === 0) {
      return [];
    }

    return overview.revenueByLocation.map((item, index) => {
      const rawPercentage =
        typeof item.percentage === 'number' ? item.percentage : Number(item.percentage ?? 0);
      const safePercentage = Number.isFinite(rawPercentage) ? rawPercentage : 0;
      return {
        country: item.country,
        percentage: `${safePercentage.toFixed(1)}%`,
        color: locationColors[index % locationColors.length],
      };
    });
  }, [overview, locationColors]);*/

  const topProducts = useMemo(() => {
    if (!overview) {
      return [
        { name: 'Baby Cotton Romper Set', price: 45.99, quantity: 156, amount: 7174.44 },
        { name: 'Organic Baby Blanket', price: 32.5, quantity: 128, amount: 4160.0 },
        { name: 'Silicone Baby Teether', price: 12.99, quantity: 245, amount: 3182.55 },
        { name: 'Baby Stroller Premium', price: 299.99, quantity: 42, amount: 12599.58 },
        { name: 'Wooden Baby Toys Set', price: 38.99, quantity: 89, amount: 3470.11 },
      ];
    }

    if (overview.topProducts.length === 0) {
      return [];
    }

    return overview.topProducts.map((product) => ({
      name: product.productName,
      price: product.averagePrice ?? 0,
      quantity: product.totalQuantity ?? 0,
      amount: product.totalRevenue ?? 0,
    }));
  }, [overview]);

  const menuItems: Array<{
    key: AdminMenuKey;
    icon: typeof ChartPieIcon;
    label: string;
    section: 'Main' | 'Catalog';
  }> = [
    { key: 'dashboard', icon: ChartPieIcon, label: t('admin.dashboard'), section: 'Main' },
    { key: 'orders', icon: ShoppingBagIcon, label: t('admin.orders'), section: 'Main' },
    { key: 'products', icon: CubeIcon, label: t('admin.products'), section: 'Main' },
    { key: 'tracking', icon: ChartBarIcon, label: t('admin.tracking') || 'Tracking', section: 'Main' },
  { key: 'coupons', icon: TicketIcon, label: t('admin.coupons'), section: 'Catalog' },
  { key: 'discounts', icon: GiftIcon, label: t('admin.discountCampaigns'), section: 'Catalog' },
    { key: 'categories', icon: TagIcon, label: t('admin.categories'), section: 'Catalog' },
    { key: 'customers', icon: UserGroupIcon, label: t('admin.customers'), section: 'Catalog' },
    { key: 'shipping', icon: TruckIcon, label: t('admin.shipping'), section: 'Catalog' },
    { key: 'reviews', icon: ChatBubbleLeftRightIcon, label: t('admin.reviews'), section: 'Catalog' },
  ];

  const activeMenuLabel = menuItems.find((item) => item.key === selectedMenu)?.label ?? t('admin.dashboard');

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[212px] border-r border-gray-200 flex flex-col">
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center gap-2 p-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-orange rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base text-brand-purple">Bigkid</span>
          </div>

          {/* Favorites / Recently */}
          <div className="flex gap-2 mb-4">
            <button className="text-xs px-3 py-1 text-gray-600 font-medium">{t('admin.quickAccess')}</button>
          </div>

          {/* Main Section */}
          <div className="mb-6">
            <div className="text-[10px] text-gray-400 uppercase px-3 py-1 mb-1">{t('admin.main')}</div>
            {menuItems.slice(0, 4).map((item) => (
              <button
                key={item.key}
                onClick={() => setSelectedMenu(item.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedMenu === item.key
                    ? 'bg-purple-50 text-brand-purple font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Catalog Section */}
          <div>
            <div className="text-[10px] text-gray-400 uppercase px-3 py-1 mb-1">{t('admin.catalog')}</div>
            {menuItems.slice(4).map((item) => (
              <button
                key={item.key}
                onClick={() => setSelectedMenu(item.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedMenu === item.key
                    ? 'bg-purple-50 text-brand-purple font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-7">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-brand-purple">{activeMenuLabel}</h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg w-40">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.search')}
                className="bg-transparent text-sm outline-none flex-1"
              />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-5">
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              <button className="p-1">
                <SunIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-1">
                <ClockIcon className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Admin Notifications */}
              <NotificationProvider isAdmin pollingInterval={30000}>
                <NotificationDropdown isAdmin />
              </NotificationProvider>
              
              <div className="w-px h-5 bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-orange rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {selectedMenu === 'categories' ? (
            <Categories />
          ) : selectedMenu === 'products' ? (
            <Products />
          ) : selectedMenu === 'orders' ? (
            <OrdersPage />
          ) : selectedMenu === 'coupons' ? (
            <Coupons />
          ) : selectedMenu === 'discounts' ? (
            <DiscountCampaigns />
          ) : selectedMenu === 'customers' ? (
            <Customers />
          ) : selectedMenu === 'reviews' ? (
            <Reviews />
          ) : selectedMenu === 'tracking' ? (
            <TrackingAnalytics />
          ) : (
            <div className="p-7 space-y-8">
              {/* Date Filter */}
              <div className="flex justify-end">
                <button className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {t('admin.today')}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
              </div>

              {overviewError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {t('admin.statsLoadFailed')}
                </div>
              ) : null}

              {/* Dashboard Stats Cards */}
              <DashboardStats
                totalRevenue={overview?.totalRevenue ?? 0}
                revenueChange={overview?.revenueGrowthPercentage}
                totalOrders={overview?.totalOrders ?? 0}
                ordersChange={overview?.ordersGrowthPercentage}
                totalCustomers={overview?.totalCustomers ?? 0}
                customersChange={overview?.customersGrowthPercentage}
                averageOrderValue={
                  overview && overview.totalOrders > 0
                    ? overview.totalRevenue / overview.totalOrders
                    : 0
                }
                avgOrderChange={overview?.monthlyRevenueGrowthPercentage}
                pendingOrders={overview?.orderStatusCounts?.find(s => s.status === 'PENDING')?.count ?? 0}
                completedOrders={overview?.orderStatusCounts?.find(s => s.status === 'DELIVERED')?.count ?? 0}
                isLoading={isLoadingOverview}
              />

              {/* Revenue Chart */}
              <RevenueChart
                data={chartData.map((item, index) => ({
                  month: item.month,
                  revenue: overview?.monthlySales[index]?.revenue ?? 0,
                  orders: overview?.monthlySales[index]?.orderCount ?? 0,
                  year: overview?.monthlySales[index]?.year,
                }))}
                isLoading={isLoadingOverview}
              />

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Orders by Status Chart */}
                <OrdersChart
                  data={
                    overview?.orderStatusCounts?.map((status) => ({
                      status: status.status,
                      count: status.count,
                      color:
                        status.status === 'PENDING'
                          ? '#EDA62A'
                          : status.status === 'CONFIRMED'
                          ? '#56CCF2'
                          : status.status === 'PROCESSING'
                          ? '#9F86D9'
                          : status.status === 'SHIPPED'
                          ? '#6FCF97'
                          : status.status === 'DELIVERED'
                          ? '#10B981'
                          : status.status === 'CANCELLED'
                          ? '#E35946'
                          : '#9CA3AF',
                    })) ?? []
                  }
                  isLoading={isLoadingOverview}
                />

                {/* Category Distribution Chart */}
                <CategoryDistribution
                  data={
                    overview?.categoryDistribution?.map((cat) => ({
                      categoryName: cat.categoryName,
                      totalRevenue: cat.totalRevenue ?? 0,
                      productCount: cat.productCount ?? 0,
                      percentage: cat.percentage ?? 0,
                    })) ?? []
                  }
                  isLoading={isLoadingOverview}
                />
              </div>

              {/* Top Products Chart */}
              <TopProductsChart
                data={topProducts.slice(0, 5).map(p => ({
                  productName: p.name,
                  totalRevenue: p.amount,
                  totalQuantity: p.quantity,
                  averagePrice: p.price,
                }))}
                isLoading={isLoadingOverview}
              />

              {/* Customer Growth Chart */}
              <CustomerGrowthChart
                data={chartData.map((_item, index) => {
                  const monthData = overview?.monthlySales[index];
                  return {
                    month: _item.month,
                    newCustomers: Math.floor(Math.random() * 50) + 10, // Mock data
                    activeCustomers: Math.floor((monthData?.orderCount ?? 0) * 0.7),
                    totalCustomers: overview?.totalCustomers ?? 0,
                  };
                })}
                isLoading={isLoadingOverview}
              />
            </div>
          )}
        </main>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[280px] border-l border-gray-200 bg-white p-4 overflow-y-auto">
        {/* Notifications */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">{t('admin.recentNotifications')}</h3>
          <div className="space-y-2">
            {[
              { text: t('admin.newOrderReceived', { orderId: '1856' }), time: '2 min ago' },
              { text: t('admin.lowStockAlert', { productName: 'Baby Romper' }), time: '15 min ago' },
              { text: t('admin.reviewPendingApproval'), time: '1 hour ago' },
            ].map((notification, i) => (
              <div key={i} className="flex items-start gap-2 p-2 hover:bg-purple-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-orange rounded-full flex-shrink-0 flex items-center justify-center">
                  <GiftIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {notification.text}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">{t('admin.recentActivities')}</h3>
          <div className="space-y-3">
            {[
              { action: t('admin.orderShipped'), time: '5 min ago' },
              { action: t('admin.productAddedToCart'), time: '12 min ago' },
              { action: t('admin.paymentConfirmed'), time: '30 min ago' },
              { action: t('admin.newCustomerRegistered'), time: '1 hour ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-brand-orange to-brand-red rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 font-medium">{activity.action}</p>
                  <p className="text-[10px] text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">{t('admin.quickActions')}</h3>
          <div className="space-y-2">
            {[t('admin.addNewProduct'), t('admin.createPromotion'), t('admin.viewReports')].map(
              (action) => (
                <button key={action} className="w-full flex items-center gap-2 p-2 hover:bg-purple-50 rounded-lg text-left transition-colors">
                  <SparklesIcon className="w-5 h-5 text-brand-purple" />
                  <span className="text-xs text-gray-900 font-medium">{action}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3">{t('admin.topSellingProducts')}</h3>
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">{t('admin.name')}</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500">{t('admin.price')}</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500">{t('admin.quantity')}</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.slice(0, 5).map((product, index) => (
                  <tr key={index} className="border-t border-gray-100">
                    <td className="px-2 py-2 text-gray-900">{product.name}</td>
                    <td className="px-2 py-2 text-right text-gray-600">{formatCurrency(product.price)}</td>
                    <td className="px-2 py-2 text-right text-gray-600">{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Admin;
