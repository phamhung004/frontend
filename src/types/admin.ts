export interface MonthlySalesData {
  year: number;
  month: number;
  revenue: number;
  orderCount: number;
}

export interface RevenueByLocation {
  country: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface TopProduct {
  productId: number | null;
  slug: string | null;
  productName: string;
  totalRevenue: number;
  totalQuantity: number;
  averagePrice: number;
  thumbnailUrl: string | null;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface CategoryDistribution {
  categoryName: string;
  totalRevenue: number;
  productCount: number;
  percentage: number;
}

export interface AdminStatsOverview {
  totalCustomers: number;
  customersGrowthPercentage: number;
  totalOrders: number;
  ordersGrowthPercentage: number;
  totalRevenue: number;
  revenueGrowthPercentage: number;
  monthlyRevenueGrowthPercentage: number;
  monthlyRevenueGrowthDelta: number;
  averageOrderValue: number;
  monthlySales: MonthlySalesData[];
  revenueByLocation: RevenueByLocation[];
  topProducts: TopProduct[];
  orderStatusCounts?: OrderStatusCount[];
  categoryDistribution?: CategoryDistribution[];
}
