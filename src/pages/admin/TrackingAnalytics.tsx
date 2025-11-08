import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import productTrackingService from '../../services/productTrackingService';
import { productService } from '../../services/productService';
import type { ProductTrackingStats, TopProduct } from '../../types/tracking';
import type { Product } from '../../types/product';
import { 
  ChartBarIcon, 
  EyeIcon, 
  CursorArrowRaysIcon,
  ShoppingCartIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const TrackingAnalytics = () => {
  const { t } = useTranslation();
  
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductTrackingStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('30days');

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productService.getFilteredProducts({
          page: 1,
          pageSize: 100,
          published: true,
          sortBy: 'latest',
        });
        setProducts(response.products);
        
        // Select first product by default
        if (response.products.length > 0 && !selectedProductId) {
          setSelectedProductId(response.products[0].id);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };

    loadProducts();
  }, [selectedProductId]);

  // Load tracking stats for selected product
  useEffect(() => {
    if (!selectedProductId) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Calculate date range
        const endDate = new Date().toISOString();
        let startDate: string | undefined;
        
        if (dateRange === '7days') {
          const date = new Date();
          date.setDate(date.getDate() - 7);
          startDate = date.toISOString();
        } else if (dateRange === '30days') {
          const date = new Date();
          date.setDate(date.getDate() - 30);
          startDate = date.toISOString();
        }

        const data = await productTrackingService.getProductStats(
          selectedProductId,
          startDate,
          endDate
        );
        setStats(data);
      } catch (error) {
        console.error('Failed to load tracking stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedProductId, dateRange]);

  // Load top products
  useEffect(() => {
    const loadTopProducts = async () => {
      try {
        const data = await productTrackingService.getTopProducts('VIEW', 10);
        setTopProducts(data);
      } catch (error) {
        console.error('Failed to load top products:', error);
      }
    };

    loadTopProducts();
  }, []);

  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-purple mb-2">
          {t('admin.trackingAnalytics') || 'Tracking Analytics'}
        </h1>
        <p className="text-gray-600">
          Phân tích hành vi người dùng trên trang sản phẩm
        </p>
      </div>

      {/* Product Selector and Date Range */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn sản phẩm
            </label>
            <select
              value={selectedProductId || ''}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng thời gian
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as '7days' | '30days' | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && stats && (
        <>
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Total Views */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng lượt xem</p>
                  <p className="text-2xl font-bold text-brand-purple">
                    {stats.totalViews.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.uniqueViewers.toLocaleString()} người xem duy nhất
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <EyeIcon className="w-6 h-6 text-brand-purple" />
                </div>
              </div>
            </div>

            {/* Total Clicks */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng lượt click</p>
                  <p className="text-2xl font-bold text-brand-orange">
                    {stats.totalClicks.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    CTR: {formatPercentage(stats.clickThroughRate)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <CursorArrowRaysIcon className="w-6 h-6 text-brand-orange" />
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Thêm vào giỏ</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalAddToCarts.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tỷ lệ: {formatPercentage(stats.addToCartRate)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ShoppingCartIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Purchases */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lượt mua</p>
                  <p className="text-2xl font-bold text-brand-purple">
                    {stats.totalPurchases.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Conversion: {formatPercentage(stats.conversionRate)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-brand-purple" />
                </div>
              </div>
            </div>

            {/* Average Time Spent */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Thời gian TB</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatTimeSpent(stats.averageTimeSpent)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tổng: {formatTimeSpent(stats.totalTimeSpent)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Event Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng sự kiện</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {Object.values(stats.eventBreakdown || {}).reduce((a, b) => a + b, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Các loại sự kiện
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Views Chart */}
            {stats.dailyData && stats.dailyData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Lượt xem theo ngày
                </h3>
                <div className="space-y-2">
                  {stats.dailyData.slice(0, 10).map((item) => (
                    <div key={item.timestamp} className="flex items-center">
                      <div className="w-24 text-sm text-gray-600">
                        {new Date(item.timestamp).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="bg-brand-purple rounded-full h-6 flex items-center justify-end pr-2"
                            style={{
                              width: `${Math.min((item.count / Math.max(...stats.dailyData!.map(d => d.count))) * 100, 100)}%`
                            }}
                          >
                            <span className="text-xs font-medium text-white">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Breakdown */}
            {stats.eventBreakdown && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Phân bố sự kiện
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.eventBreakdown).map(([type, count]) => (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{type}</span>
                        <span className="font-medium text-gray-800">
                          {count.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-brand-orange rounded-full h-2"
                          style={{
                            width: `${(count / Math.max(...Object.values(stats.eventBreakdown!))) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Thông tin sản phẩm
            </h3>
            <p className="text-gray-600 font-medium">{stats.productName}</p>
            <p className="text-sm text-gray-500 mt-1">
              ID: {stats.productId}
            </p>
          </div>
        </>
      )}

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Top 10 sản phẩm được xem nhiều nhất
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">STT</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Sản phẩm</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Lượt xem</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">#{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {product.thumbnailUrl && (
                        <img
                          src={product.thumbnailUrl}
                          alt={product.productName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {product.productName}
                        </p>
                        <p className="text-xs text-gray-500">ID: {product.productId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-medium text-brand-purple">
                      {product.eventCount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrackingAnalytics;
