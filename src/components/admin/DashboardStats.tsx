import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChartPieIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/currency';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  isLoading?: boolean;
}

const StatCard = ({ title, value, change, icon: Icon, colorClass, bgClass, isLoading }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState('0');
  const isPositive = change !== undefined && change >= 0;
  const TrendIcon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

  useEffect(() => {
    if (isLoading) return;

    // Animation cho số
    const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1000;
    const increment = numericValue / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start).toLocaleString());
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, isLoading]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgClass}`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            <TrendIcon className="w-4 h-4" />
            <span className="text-xs font-semibold">{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-3xl font-bold ${colorClass} ${isLoading ? 'animate-pulse' : ''}`}>
          {isLoading ? '—' : displayValue}
        </p>
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  totalRevenue: number;
  revenueChange?: number;
  totalOrders: number;
  ordersChange?: number;
  totalCustomers: number;
  customersChange?: number;
  averageOrderValue: number;
  avgOrderChange?: number;
  pendingOrders: number;
  completedOrders: number;
  isLoading?: boolean;
}

const DashboardStats = ({
  totalRevenue,
  revenueChange,
  totalOrders,
  ordersChange,
  totalCustomers,
  customersChange,
  averageOrderValue,
  avgOrderChange,
  pendingOrders,
  completedOrders,
  isLoading = false,
}: DashboardStatsProps) => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('admin.totalRevenue'),
      value: formatCurrency(totalRevenue),
      change: revenueChange,
      icon: ChartPieIcon,
      colorClass: 'text-purple-600',
      bgClass: 'bg-purple-50',
    },
    {
      title: t('admin.totalOrders'),
      value: totalOrders.toLocaleString(),
      change: ordersChange,
      icon: ShoppingBagIcon,
      colorClass: 'text-orange-600',
      bgClass: 'bg-orange-50',
    },
    {
      title: t('admin.totalCustomers'),
      value: totalCustomers.toLocaleString(),
      change: customersChange,
      icon: UserGroupIcon,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
    },
    {
      title: t('admin.averageOrderValue'),
      value: formatCurrency(averageOrderValue),
      change: avgOrderChange,
      icon: CurrencyDollarIcon,
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50',
    },
  ];

  const quickStats = [
    {
      title: t('admin.pendingOrders'),
      value: pendingOrders.toLocaleString(),
      icon: ClockIcon,
      colorClass: 'text-yellow-600',
      bgClass: 'bg-yellow-50',
    },
    {
      title: t('admin.completedOrders'),
      value: completedOrders.toLocaleString(),
      icon: ShoppingCartIcon,
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            style={{
              animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`,
            }}
          >
            <StatCard {...stat} isLoading={isLoading} />
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickStats.map((stat, index) => (
          <div
            key={stat.title}
            style={{
              animation: `slideInUp 0.5s ease-out ${(stats.length + index) * 0.1}s both`,
            }}
          >
            <StatCard {...stat} isLoading={isLoading} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardStats;
