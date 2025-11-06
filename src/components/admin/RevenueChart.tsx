import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/currency';

interface RevenueDataPoint {
  month: string;
  revenue: number;
  orders: number;
  year?: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation();
  
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm text-purple-600">
            {t('admin.revenue')}: <span className="font-bold">{formatCurrency(payload[0].value)}</span>
          </p>
          <p className="text-sm text-orange-600">
            {t('admin.orders')}: <span className="font-bold">{payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ data, isLoading = false }: RevenueChartProps) => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const filterDataByRange = (range: 'week' | 'month' | 'year') => {
    if (range === 'week') {
      return data.slice(-7);
    } else if (range === 'month') {
      return data.slice(-30);
    }
    return data;
  };

  const filteredData = filterDataByRange(timeRange);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{t('admin.revenueOverview')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('admin.revenueDescription')}</p>
        </div>
        
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                timeRange === range
                  ? 'bg-white text-brand-purple shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t(`admin.${range}`)}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={filteredData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9F86D9" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#9F86D9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EDA62A" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#EDA62A" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#9F86D9"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name={t('admin.revenue')}
            animationDuration={1500}
            animationBegin={0}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#EDA62A"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorOrders)"
            name={t('admin.orders')}
            animationDuration={1500}
            animationBegin={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
