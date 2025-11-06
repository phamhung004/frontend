import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../utils/currency';

interface TopProduct {
  productName: string;
  totalRevenue: number;
  totalQuantity: number;
  averagePrice: number;
}

interface TopProductsChartProps {
  data: TopProduct[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useTranslation();
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
        <p className="font-semibold text-gray-900 mb-3">{data.productName}</p>
        <div className="space-y-2">
          <div className="flex justify-between gap-4">
            <span className="text-sm text-gray-600">{t('admin.revenue')}:</span>
            <span className="text-sm font-bold text-purple-600">{formatCurrency(data.totalRevenue)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm text-gray-600">{t('admin.quantity')}:</span>
            <span className="text-sm font-bold text-orange-600">{data.totalQuantity}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm text-gray-600">{t('admin.avgPrice')}:</span>
            <span className="text-sm font-bold text-blue-600">{formatCurrency(data.averagePrice)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const TopProductsChart = ({ data, isLoading = false }: TopProductsChartProps) => {
  const { t } = useTranslation();

  const colors = ['#9F86D9', '#EDA62A', '#E35946', '#6FCF97', '#56CCF2'];

  const chartData = data.map((product) => ({
    ...product,
    shortName: product.productName.length > 20 
      ? product.productName.substring(0, 20) + '...' 
      : product.productName,
  }));

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-96 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('admin.topSellingProducts')}</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          {t('admin.noDataAvailable')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">{t('admin.topSellingProducts')}</h3>
        <p className="text-sm text-gray-500 mt-1">{t('admin.topProductsDescription')}</p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            stroke="#9ca3af"
            style={{ fontSize: '11px' }}
            width={150}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Bar
            dataKey="totalRevenue"
            name={t('admin.revenue')}
            radius={[0, 8, 8, 0]}
            animationDuration={1200}
            animationBegin={0}
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Product Details Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('admin.product')}</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">{t('admin.sold')}</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">{t('admin.revenue')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((product, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                style={{
                  animation: `slideInLeft 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <td className="px-4 py-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  >
                    {index + 1}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{product.productName}</td>
                <td className="px-4 py-3 text-right text-gray-600">{product.totalQuantity}</td>
                <td className="px-4 py-3 text-right font-semibold text-purple-600">
                  {formatCurrency(product.totalRevenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TopProductsChart;
