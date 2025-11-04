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
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  SunIcon,
  ClockIcon,
  BellIcon,
  ChevronDownIcon,
  SparklesIcon,
  GiftIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import Categories from './admin/Categories';
import Products from './admin/Products';
import OrdersPage from './admin/Orders';
import Coupons from './admin/Coupons';
import Customers from './admin/Customers';
import Reviews from './Reviews';
import LanguageSwitcher from '../components/LanguageSwitcher';
import DiscountCampaigns from './admin/DiscountCampaigns';
import adminService from '../services/adminService';
import type { AdminStatsOverview } from '../types/admin';

type AdminMenuKey =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'coupons'
  | 'discounts'
  | 'categories'
  | 'customers'
  | 'shipping'
  | 'reviews';

const Admin = () => {
  const { t, i18n } = useTranslation();
  const [selectedMenu, setSelectedMenu] = useState<AdminMenuKey>('dashboard');
  const [overview, setOverview] = useState<AdminStatsOverview | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  type StatCardKey = 'totalCustomers' | 'totalOrders' | 'totalRevenue' | 'monthlyRevenueGrowth';

  interface StatCardData {
    key: StatCardKey;
    title: string;
    displayValue: string;
    changeLabel: string | null;
    isPositive: boolean;
    bgColor: string;
    iconColor: string;
    icon: typeof ChartPieIcon;
  }

  const buildChangeLabel = (value?: number | null) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return null;
    }
    if (!Number.isFinite(value)) {
      return null;
    }
    const absValue = Math.abs(value);
    const formatted = absValue.toFixed(1);
    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${sign}${formatted}%`;
  };

  const formatPercentageValue = (value?: number | null) => {
    if (value === undefined || value === null || Number.isNaN(value) || !Number.isFinite(value)) {
      return '0.0%';
    }
    return `${Math.abs(value).toFixed(1)}%`;
  };

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

  const stats = useMemo<StatCardData[]>(() => {
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
  }, [overview, t, i18n.language]);

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

  const locationColors = useMemo(
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
  }, [overview, locationColors]);

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
            {menuItems.slice(0, 3).map((item) => (
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
            {menuItems.slice(3).map((item) => (
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
              <button className="p-1 relative">
                <BellIcon className="w-5 h-5 text-gray-600" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-brand-red rounded-full"></span>
              </button>
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
          ) : (
          <div className="p-7">
            {/* Date Filter */}
            <div className="flex justify-end mb-6">
              <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600">
                {t('admin.today')}
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </div>

            {overviewError ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                {t('admin.statsLoadFailed', 'Unable to load statistics. Please try again later.')}
              </div>
            ) : null}

            {/* Stats Grid */}
            <div
              className={`grid grid-cols-4 gap-7 mb-7 ${
                isLoadingOverview && !overview ? 'opacity-60 animate-pulse' : ''
              }`}
            >
              {stats.map((stat) => {
                const Icon = stat.icon;
                const TrendIcon = stat.isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

                return (
                  <div key={stat.key} className="bg-white rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{stat.title}</div>
                      <div className="flex items-end justify-between">
                        <div className="text-2xl font-semibold">{stat.displayValue}</div>
                        {stat.changeLabel ? (
                          <div
                            className={`flex items-center gap-1 text-xs ${
                              stat.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            <TrendIcon className="w-3 h-3" />
                            {stat.changeLabel}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">—</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-7 mb-7">
              {/* Projections vs Actuals */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-4">{t('admin.monthlySalesPerformance')}</h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 gap-2">
                      <div className="flex-1 flex items-end w-full">
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            index % 4 === 0
                              ? 'bg-brand-purple'
                              : index % 4 === 1
                              ? 'bg-brand-orange'
                              : index % 4 === 2
                              ? 'bg-brand-red'
                              : 'bg-purple-300'
                          }`}
                          style={{ height: `${item.value}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-500">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by Location */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-4">{t('admin.revenueByLocation')}</h3>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 relative">
                    <svg viewBox="0 0 120 120" className="transform -rotate-90">
                      {revenueByLocation.map((item, index) => {
                        const total = 100;
                        let startAngle = 0;
                        for (let i = 0; i < index; i++) {
                          startAngle += parseFloat(revenueByLocation[i].percentage);
                        }
                        const percentage = parseFloat(item.percentage);
                        const angle = (percentage / total) * 360;
                        const radius = 50;
                        const centerX = 60;
                        const centerY = 60;
                        const innerRadius = 30;

                        const startAngleRad = (startAngle * Math.PI) / 180;
                        const endAngleRad = ((startAngle + angle) * Math.PI) / 180;

                        const x1 = centerX + radius * Math.cos(startAngleRad);
                        const y1 = centerY + radius * Math.sin(startAngleRad);
                        const x2 = centerX + radius * Math.cos(endAngleRad);
                        const y2 = centerY + radius * Math.sin(endAngleRad);
                        const x3 = centerX + innerRadius * Math.cos(endAngleRad);
                        const y3 = centerY + innerRadius * Math.sin(endAngleRad);
                        const x4 = centerX + innerRadius * Math.cos(startAngleRad);
                        const y4 = centerY + innerRadius * Math.sin(startAngleRad);

                        const largeArcFlag = angle > 180 ? 1 : 0;

                        return (
                          <path
                            key={index}
                            d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`}
                            fill={item.color}
                          />
                        );
                      })}
                    </svg>
                  </div>
                  <div className="flex-1 space-y-3">
                    {revenueByLocation.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-xs text-gray-600">{item.country}</span>
                        </div>
                        <span className="text-xs text-gray-900 font-medium">{item.percentage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Marketing & SEO Chart */}
            <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-2xl p-6">
              <h3 className="text-sm font-semibold mb-4">{t('admin.customerEngagementTraffic')}</h3>
              <div className="h-48 flex items-end justify-between gap-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 gap-2">
                    <div className="flex-1 flex items-end w-full">
                      <div
                        className="w-full bg-brand-purple rounded-t-lg transition-all"
                        style={{ height: `${item.value}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-gray-500">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
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
