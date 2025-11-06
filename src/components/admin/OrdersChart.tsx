import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

interface OrderStatusData {
  status: string;
  count: number;
  color: string;
}

interface OrdersChartProps {
  data: OrderStatusData[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useTranslation();
  
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.status}</p>
        <p className="text-sm text-gray-600">
          {t('admin.orders')}: <span className="font-bold text-gray-900">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const OrdersChart = ({ data, isLoading = false }: OrdersChartProps) => {
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">{t('admin.ordersByStatus')}</h3>
        <p className="text-sm text-gray-500 mt-1">{t('admin.ordersStatusDescription')}</p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="status"
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
          
          <Bar
            dataKey="count"
            name={t('admin.orderCount')}
            radius={[8, 8, 0, 0]}
            animationDuration={1200}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {data.map((item, index) => (
          <div
            key={item.status}
            className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            style={{
              animation: `fadeInScale 0.5s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs font-medium text-gray-600">{item.status}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: item.color }}>
              {item.count}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default OrdersChart;
