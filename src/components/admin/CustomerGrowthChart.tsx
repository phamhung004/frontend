import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CustomerGrowthData {
  month: string;
  newCustomers: number;
  activeCustomers: number;
  totalCustomers: number;
}

interface CustomerGrowthChartProps {
  data: CustomerGrowthData[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation();
  
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm text-blue-600">
            {t('admin.newCustomers')}: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-sm text-green-600">
            {t('admin.activeCustomers')}: <span className="font-bold">{payload[1].value}</span>
          </p>
          <p className="text-sm text-purple-600">
            {t('admin.totalCustomers')}: <span className="font-bold">{payload[2].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomerGrowthChart = ({ data, isLoading = false }: CustomerGrowthChartProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-80 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('admin.customerGrowth')}</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          {t('admin.noDataAvailable')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">{t('admin.customerGrowth')}</h3>
        <p className="text-sm text-gray-500 mt-1">{t('admin.customerGrowthDescription')}</p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          
          <Line
            type="monotone"
            dataKey="newCustomers"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', r: 5 }}
            activeDot={{ r: 7 }}
            name={t('admin.newCustomers')}
            animationDuration={1500}
            animationBegin={0}
          />
          <Line
            type="monotone"
            dataKey="activeCustomers"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', r: 5 }}
            activeDot={{ r: 7 }}
            name={t('admin.activeCustomers')}
            animationDuration={1500}
            animationBegin={300}
          />
          <Line
            type="monotone"
            dataKey="totalCustomers"
            stroke="#9F86D9"
            strokeWidth={3}
            dot={{ fill: '#9F86D9', r: 5 }}
            activeDot={{ r: 7 }}
            name={t('admin.totalCustomers')}
            animationDuration={1500}
            animationBegin={600}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <p className="text-sm text-gray-600">{t('admin.newThisMonth')}</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {data[data.length - 1]?.newCustomers || 0}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <p className="text-sm text-gray-600">{t('admin.activeNow')}</p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {data[data.length - 1]?.activeCustomers || 0}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <p className="text-sm text-gray-600">{t('admin.totalNow')}</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {data[data.length - 1]?.totalCustomers || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerGrowthChart;
