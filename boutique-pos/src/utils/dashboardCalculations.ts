import type { Order, Item, PaymentRecord } from '../types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
  isSameDay,
  isWithinInterval,
} from 'date-fns';

export interface DashboardMetrics {
  // Financial
  lifetimeRevenue: number;
  lifetimeProfit: number;
  totalDues: number;
  averageOrderValue: number;
  highestValueOrder: { billNo: number; amount: number } | null;
  mostProfitableOrder: { billNo: number; profit: number } | null;
  cashTotal: number;
  upiTotal: number;
  totalDiscounts: number;

  // Inventory
  itemsInStock: number;
  itemsSold: number;
  inventoryValue: number;
  potentialRevenue: number;

  // Customers
  totalCustomers: number;
  topCustomerByRevenue: { name: string; phone: string; revenue: number } | null;
  topCustomerByOrders: { name: string; phone: string; orders: number } | null;
  repeatCustomerRate: number;

  // Orders
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  averageItemsPerOrder: number;
  orderCompletionRate: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  profit: number;
  orders: number;
}

export interface DailyData {
  date: string;
  revenue: number;
  profit: number;
}

export interface CustomerData {
  name: string;
  revenue: number;
}

export const calculateDashboardMetrics = (
  orders: Order[],
  items: Item[],
  customerCount: number
): DashboardMetrics => {
  // Financial Metrics
  const lifetimeRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const lifetimeProfit = orders.reduce((sum, order) => sum + order.totalProfit, 0);
  const totalDues = orders.reduce((sum, order) => sum + (order.totalAmount - order.amountPaid), 0);
  const averageOrderValue = orders.length > 0 ? lifetimeRevenue / orders.length : 0;

  // Highest value order
  const highestValueOrder = orders.reduce(
    (max, order) => {
      if (order.totalAmount > (max?.amount || 0)) {
        return { billNo: order.billNo, amount: order.totalAmount };
      }
      return max;
    },
    null as { billNo: number; amount: number } | null
  );

  // Most profitable order
  const mostProfitableOrder = orders.reduce(
    (max, order) => {
      if (order.totalProfit > (max?.profit || 0)) {
        return { billNo: order.billNo, profit: order.totalProfit };
      }
      return max;
    },
    null as { billNo: number; profit: number } | null
  );

  // Cash vs UPI
  let cashTotal = 0;
  let upiTotal = 0;
  orders.forEach((order) => {
    try {
      const history: PaymentRecord[] = JSON.parse(order.paymentHistory);
      history.forEach((payment) => {
        if (payment.method === 'cash') {
          cashTotal += payment.amount;
        } else {
          upiTotal += payment.amount;
        }
      });
    } catch (error) {
      // Skip invalid payment history
    }
  });

  // Total discounts from sold items (markedPrice - defaultSellingPrice)
  const totalDiscounts = items
    .filter((item) => item.sold && item.defaultSellingPrice)
    .reduce((sum, item) => sum + (item.markedPrice - (item.defaultSellingPrice || 0)), 0);

  // Inventory Metrics
  const itemsInStock = items.filter((item) => !item.sold).length;
  const itemsSold = items.filter((item) => item.sold).length;
  const inventoryValue = items
    .filter((item) => !item.sold)
    .reduce((sum, item) => sum + item.costPrice, 0);
  const potentialRevenue = items
    .filter((item) => !item.sold)
    .reduce((sum, item) => sum + item.markedPrice, 0);

  // Customer Metrics
  const customerOrderMap = new Map<string, { name: string; revenue: number; orders: number }>();
  orders.forEach((order) => {
    const existing = customerOrderMap.get(order.customerPhone) || {
      name: order.customerName || 'Unknown',
      revenue: 0,
      orders: 0,
    };
    existing.revenue += order.totalAmount;
    existing.orders += 1;
    customerOrderMap.set(order.customerPhone, existing);
  });

  const customerData = Array.from(customerOrderMap.values());
  const topCustomerByRevenue =
    customerData.length > 0
      ? customerData.reduce((max, customer) => (customer.revenue > max.revenue ? customer : max))
      : null;

  const topCustomerByOrders =
    customerData.length > 0
      ? customerData.reduce((max, customer) => (customer.orders > max.orders ? customer : max))
      : null;

  const repeatCustomers = customerData.filter((c) => c.orders >= 2).length;
  const repeatCustomerRate = customerCount > 0 ? (repeatCustomers / customerCount) * 100 : 0;

  // Order Metrics
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const totalItems = orders.reduce((sum, order) => {
    try {
      const items = JSON.parse(order.items);
      return sum + items.length;
    } catch {
      return sum;
    }
  }, 0);
  const averageItemsPerOrder = totalOrders > 0 ? totalItems / totalOrders : 0;
  const orderCompletionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  return {
    lifetimeRevenue,
    lifetimeProfit,
    totalDues,
    averageOrderValue,
    highestValueOrder,
    mostProfitableOrder,
    cashTotal,
    upiTotal,
    totalDiscounts,
    itemsInStock,
    itemsSold,
    inventoryValue,
    potentialRevenue,
    totalCustomers: customerCount,
    topCustomerByRevenue: topCustomerByRevenue
      ? {
          name: topCustomerByRevenue.name,
          phone: '',
          revenue: topCustomerByRevenue.revenue,
        }
      : null,
    topCustomerByOrders: topCustomerByOrders
      ? {
          name: topCustomerByOrders.name,
          phone: '',
          orders: topCustomerByOrders.orders,
        }
      : null,
    repeatCustomerRate,
    totalOrders,
    completedOrders,
    pendingOrders,
    averageItemsPerOrder,
    orderCompletionRate,
  };
};

export const getMonthlyData = (orders: Order[], monthsBack: number = 6): MonthlyData[] => {
  const now = new Date();
  const startDate = subMonths(now, monthsBack - 1);
  const months = eachMonthOfInterval({ start: startOfMonth(startDate), end: endOfMonth(now) });

  return months.map((monthDate) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthOrders = orders.filter((order) => {
      const orderDate = new Date(order.saleDate);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });

    return {
      month: format(monthDate, 'MMM yy'),
      revenue: monthOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      profit: monthOrders.reduce((sum, order) => sum + order.totalProfit, 0),
      orders: monthOrders.length,
    };
  });
};

export const getDailyData = (orders: Order[], daysBack: number = 30): DailyData[] => {
  const now = new Date();
  const dailyMap = new Map<string, { revenue: number; profit: number }>();

  // Initialize all days
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'MMM dd');
    dailyMap.set(dateStr, { revenue: 0, profit: 0 });
  }

  // Fill in order data
  orders.forEach((order) => {
    const orderDate = new Date(order.saleDate);
    const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff >= 0 && daysDiff < daysBack) {
      const dateStr = format(orderDate, 'MMM dd');
      const existing = dailyMap.get(dateStr) || { revenue: 0, profit: 0 };
      existing.revenue += order.totalAmount;
      existing.profit += order.totalProfit;
      dailyMap.set(dateStr, existing);
    }
  });

  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    profit: data.profit,
  }));
};

export const getTopCustomers = (orders: Order[], topN: number = 5): CustomerData[] => {
  const customerMap = new Map<string, { name: string; revenue: number }>();

  orders.forEach((order) => {
    const existing = customerMap.get(order.customerPhone) || {
      name: order.customerName || 'Unknown',
      revenue: 0,
    };
    existing.revenue += order.totalAmount;
    customerMap.set(order.customerPhone, existing);
  });

  return Array.from(customerMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, topN);
};

// Calculate metrics for a specific day
export const calculateDailyMetrics = (
  orders: Order[],
  items: Item[],
  selectedDate: Date
): DashboardMetrics => {
  // Filter orders for the selected day
  const dayOrders = orders.filter((order) => {
    try {
      if (!order.$createdAt) return false;
      const orderDate = new Date(order.$createdAt);
      return isSameDay(orderDate, selectedDate);
    } catch {
      return false;
    }
  });

  // Count unique customers for that day
  const uniqueCustomers = new Set(dayOrders.map((o) => o.customerPhone)).size;

  // Get item IDs from day's orders to filter relevant items
  const dayItemIds = new Set<string>();
  dayOrders.forEach((order) => {
    try {
      const orderItems = JSON.parse(order.items);
      orderItems.forEach((item: any) => dayItemIds.add(item.itemId));
    } catch {
      // Skip invalid items
    }
  });

  // Filter items that were sold on this day
  const dayItems = items.filter((item) => dayItemIds.has(item.itemId));

  // Use the main calculation function with filtered data
  return calculateDashboardMetrics(dayOrders, dayItems, uniqueCustomers);
};

// Calculate metrics for a specific month
export const calculateMonthlyMetrics = (
  orders: Order[],
  items: Item[],
  year: number,
  month: number // 0-indexed (0 = January, 11 = December)
): DashboardMetrics => {
  // Get start and end of the month
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  // Filter orders for the selected month
  const monthOrders = orders.filter((order) => {
    try {
      if (!order.$createdAt) return false;
      const orderDate = new Date(order.$createdAt);
      return isWithinInterval(orderDate, { start: monthStart, end: monthEnd });
    } catch {
      return false;
    }
  });

  // Count unique customers for that month
  const uniqueCustomers = new Set(monthOrders.map((o) => o.customerPhone)).size;

  // Get item IDs from month's orders to filter relevant items
  const monthItemIds = new Set<string>();
  monthOrders.forEach((order) => {
    try {
      const orderItems = JSON.parse(order.items);
      orderItems.forEach((item: any) => monthItemIds.add(item.itemId));
    } catch {
      // Skip invalid items
    }
  });

  // Filter items that were sold in this month
  const monthItems = items.filter((item) => monthItemIds.has(item.itemId));

  // Use the main calculation function with filtered data
  return calculateDashboardMetrics(monthOrders, monthItems, uniqueCustomers);
};
