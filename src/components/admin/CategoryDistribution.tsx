import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryData {
  categoryName: string;
  totalRevenue: number;
  productCount: number;
  percentage: number;
}

interface CategoryDistributionProps {
  data: CategoryData[];
  isLoading?: boolean;
}

const COLORS = ['#9F86D9', '#EDA62A', '#E35946', '#6FCF97', '#56CCF2', '#BB6BD9'];

const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useTranslation();
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-3">{data.categoryName}</p>
        <div className="space-y-2">
          <div className="flex justify-between gap-4">
            <span className="text-sm text-gray-600">{t('admin.products')}:</span>
            <span className="text-sm font-bold text-gray-900">{data.productCount}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm text-gray-600">{t('admin.percentage')}:</span>
            <span className="text-sm font-bold text-purple-600">{data.percentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CategoryDistribution = ({ data, isLoading = false }: CategoryDistributionProps) => {
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('admin.categoryDistribution')}</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          {t('admin.noDataAvailable')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">{t('admin.categoryDistribution')}</h3>
        <p className="text-sm text-gray-500 mt-1">{t('admin.categoryDescription')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }: any) => `${percentage.toFixed(0)}%`}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="percentage"
                animationBegin={0}
                animationDuration={1000}
              >
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Details */}
        <div className="flex flex-col justify-center space-y-3">
          {data.map((category, index) => (
            <div
              key={category.categoryName}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              style={{
                animation: `fadeInRight 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div>
                  <p className="font-medium text-gray-900">{category.categoryName}</p>
                  <p className="text-xs text-gray-500">
                    {category.productCount} {t('admin.products')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg" style={{ color: COLORS[index % COLORS.length] }}>
                  {category.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">{t('admin.totalCategories')}</p>
            <p className="text-2xl font-bold text-purple-600">{data.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">{t('admin.totalProducts')}</p>
            <p className="text-2xl font-bold text-orange-600">
              {data.reduce((sum, cat) => sum + cat.productCount, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">{t('admin.topCategory')}</p>
            <p className="text-lg font-bold text-blue-600">
              {data[0]?.categoryName || '—'}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
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

export default CategoryDistribution;
