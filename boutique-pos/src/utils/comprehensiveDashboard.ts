import type { Order, Item } from '../types';
import type { StitchingOrder, StitchingOrderItem } from '../types/stitching';

export interface ComprehensiveDashboardMetrics {
  // Combined Totals
  totalRevenue: number;
  totalProfit: number;
  totalDues: number;
  totalOrders: number;
  totalCustomers: number;
  totalPotentialRevenue: number;

  // Retail Metrics
  retail: {
    revenue: number;
    profit: number;
    dues: number;
    orders: number;
    completedOrders: number;
    pendingOrders: number;
    averageOrderValue: number;
    cashTotal: number;
    upiTotal: number;
    itemsSold: number;
    inventoryValue: number;
  };

  // Stitching Metrics
  stitching: {
    revenue: number;
    profit: number;
    dues: number;
    orders: number;
    deliveredOrders: number;
    pendingOrders: number;
    inProgressOrders: number;
    readyOrders: number;
    averageOrderValue: number;
    cashTotal: number;
    upiTotal: number;
    fabricProfit: number; // Profit from shop fabrics
    asterProfit: number; // Profit from aster fabrics
    accessoryRevenue: number;
    totalStitchingCharge: number;
    fabricInventoryValue: number;
    accessoryInventoryValue: number;
    totalInventoryValue: number;
  };

  // Top performers
  highestValueOrder: { type: 'retail' | 'stitching'; id: string; amount: number } | null;
  mostProfitableOrder: { type: 'retail' | 'stitching'; id: string; profit: number } | null;
}

export const calculateComprehensiveDashboardMetrics = (
  retailOrders: Order[],
  stitchingOrders: StitchingOrder[],
  items: Item[],
  fabrics?: any[],
  accessories?: any[]
): ComprehensiveDashboardMetrics => {
  // Calculate Retail Metrics
  const retailRevenue = retailOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const retailProfit = retailOrders.reduce((sum, order) => sum + order.totalProfit, 0);
  const retailDues = retailOrders.reduce(
    (sum, order) => sum + (order.totalAmount - order.amountPaid),
    0
  );
  const retailCompleted = retailOrders.filter((o) => o.status === 'completed').length;
  const retailPending = retailOrders.filter((o) => o.status === 'pending').length;
  const retailAvgOrderValue = retailOrders.length > 0 ? retailRevenue / retailOrders.length : 0;

  // Calculate retail cash/UPI
  let retailCash = 0;
  let retailUPI = 0;
  retailOrders.forEach((order) => {
    try {
      const history = JSON.parse(order.paymentHistory);
      history.forEach((payment: any) => {
        if (payment.method === 'cash') retailCash += payment.amount;
        else if (payment.method === 'upi') retailUPI += payment.amount;
      });
    } catch (e) {
      // Skip if parsing fails
    }
  });

  // Calculate inventory metrics
  const itemsSold = retailOrders.reduce((sum, order) => {
    try {
      const orderItems = JSON.parse(order.items);
      if (Array.isArray(orderItems)) {
        return (
          sum + orderItems.reduce((itemSum: number, item: any) => itemSum + (item.quantity || 1), 0)
        );
      }
      return sum;
    } catch (e) {
      return sum;
    }
  }, 0);

  // Inventory value for items - calculate based on cost price of unsold items
  const inventoryValue = items
    .filter((item) => item.sold === false || item.sold === undefined || item.sold === null)
    .reduce((sum, item) => sum + (item.costPrice || 0), 0);

  // Potential revenue from unsold items - based on marked price or default selling price
  const retailPotentialRevenue = items
    .filter((item) => item.sold === false || item.sold === undefined || item.sold === null)
    .reduce((sum, item) => {
      const potentialPrice = item.markedPrice || item.defaultSellingPrice || item.costPrice || 0;
      return sum + potentialPrice;
    }, 0);

  // Calculate Stitching Metrics
  const stitchingRevenue = stitchingOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const stitchingDues = stitchingOrders.reduce(
    (sum, order) => sum + (order.totalAmount - order.amountPaid),
    0
  );
  const stitchingDelivered = stitchingOrders.filter((o) => o.status === 'delivered').length;
  const stitchingPending = stitchingOrders.filter((o) => o.status === 'pending').length;
  const stitchingInProgress = stitchingOrders.filter((o) => o.status === 'in-progress').length;
  const stitchingReady = stitchingOrders.filter((o) => o.status === 'ready').length;
  const stitchingAvgOrderValue =
    stitchingOrders.length > 0 ? stitchingRevenue / stitchingOrders.length : 0;

  // Calculate stitching profit breakdown
  let fabricProfit = 0;
  let asterProfit = 0;
  let accessoryRevenue = 0;
  let totalStitchingCharge = 0;
  let stitchingCash = 0;
  let stitchingUPI = 0;

  stitchingOrders.forEach((order) => {
    try {
      const orderItems: StitchingOrderItem[] = JSON.parse(order.items);

      orderItems.forEach((item) => {
        // Stitching charge
        totalStitchingCharge += item.stitchingPrice * item.quantity;

        // Fabric profit (shop fabric sold at MRP, profit = cost)
        if (item.fabric.source === 'shop' && item.fabric.fabricCost > 0) {
          fabricProfit += item.fabric.fabricCost;
        }

        // Aster profit (internal tracking, not charged to customer)
        if (item.aster && item.aster.fabricCost > 0) {
          asterProfit += item.aster.fabricCost;
        }

        // Accessory revenue (billed to customer)
        item.accessories.forEach((acc) => {
          if (acc.billedToCustomer) {
            accessoryRevenue += acc.totalCost;
          }
        });

        // Additional charges
        item.additionalCharges.forEach((charge) => {
          totalStitchingCharge += charge.amount;
        });
      });

      // Calculate payment methods
      const paymentHistory = JSON.parse(order.paymentHistory || '[]');
      paymentHistory.forEach((payment: any) => {
        if (payment.method === 'cash') stitchingCash += payment.amount;
        else if (payment.method === 'upi') stitchingUPI += payment.amount;
      });
    } catch (e) {
      console.error('Error parsing stitching order:', e);
    }
  });

  // Total stitching profit = fabric profit + stitching charge + accessory revenue
  const stitchingProfit = fabricProfit + totalStitchingCharge + accessoryRevenue;

  // Find highest value order
  let highestValueOrder: { type: 'retail' | 'stitching'; id: string; amount: number } | null = null;
  retailOrders.forEach((order) => {
    if (!highestValueOrder || order.totalAmount > highestValueOrder.amount) {
      highestValueOrder = {
        type: 'retail',
        id: order.billNo.toString(),
        amount: order.totalAmount,
      };
    }
  });
  stitchingOrders.forEach((order) => {
    if (!highestValueOrder || order.totalAmount > highestValueOrder.amount) {
      highestValueOrder = { type: 'stitching', id: order.orderNo, amount: order.totalAmount };
    }
  });

  // Find most profitable order
  let mostProfitableOrder: { type: 'retail' | 'stitching'; id: string; profit: number } | null =
    null;
  retailOrders.forEach((order) => {
    if (!mostProfitableOrder || order.totalProfit > mostProfitableOrder.profit) {
      mostProfitableOrder = {
        type: 'retail',
        id: order.billNo.toString(),
        profit: order.totalProfit,
      };
    }
  });
  // For stitching, calculate profit per order
  stitchingOrders.forEach((order) => {
    try {
      const orderItems: StitchingOrderItem[] = JSON.parse(order.items);
      let orderProfit = 0;

      orderItems.forEach((item) => {
        orderProfit += item.stitchingPrice * item.quantity;
        if (item.fabric.source === 'shop') orderProfit += item.fabric.fabricCost;
        item.additionalCharges.forEach((charge) => (orderProfit += charge.amount));
        item.accessories.forEach((acc) => {
          if (acc.billedToCustomer) orderProfit += acc.totalCost;
        });
      });

      if (!mostProfitableOrder || orderProfit > mostProfitableOrder.profit) {
        mostProfitableOrder = { type: 'stitching', id: order.orderNo, profit: orderProfit };
      }
    } catch (e) {
      // Skip on error
    }
  });

  // Count unique customers
  const retailCustomers = new Set(retailOrders.map((o) => o.customerPhone));
  const stitchingCustomers = new Set(stitchingOrders.map((o) => o.customerPhone));
  const allCustomers = new Set([...retailCustomers, ...stitchingCustomers]);

  // Calculate fabric and accessory inventory values (cost)
  const fabricInventoryValue = fabrics
    ? fabrics.reduce((sum, fabric) => {
        const availableMeters = (fabric.totalMeters || 0) - (fabric.usedMeters || 0);
        return sum + availableMeters * (fabric.purchaseRate || 0);
      }, 0)
    : 0;

  const accessoryInventoryValue = accessories
    ? accessories.reduce((sum, acc) => {
        const availableQuantity = (acc.quantityInStock || 0) - (acc.quantityUsed || 0);
        return sum + availableQuantity * (acc.purchaseRate || 0);
      }, 0)
    : 0;

  // Calculate fabric and accessory potential revenue (selling rate)
  const fabricPotentialRevenue = fabrics
    ? fabrics.reduce((sum, fabric) => {
        const availableMeters = (fabric.totalMeters || 0) - (fabric.usedMeters || 0);
        return sum + availableMeters * (fabric.sellingRate || 0);
      }, 0)
    : 0;

  const accessoryPotentialRevenue = accessories
    ? accessories.reduce((sum, acc) => {
        const availableQuantity = (acc.quantityInStock || 0) - (acc.quantityUsed || 0);
        return sum + availableQuantity * (acc.sellingRate || 0);
      }, 0)
    : 0;

  const totalStitchingInventoryValue = fabricInventoryValue + accessoryInventoryValue;
  const totalStitchingPotentialRevenue = fabricPotentialRevenue + accessoryPotentialRevenue;

  return {
    totalRevenue: retailRevenue + stitchingRevenue,
    totalProfit: retailProfit + stitchingProfit,
    totalDues: retailDues + stitchingDues,
    totalOrders: retailOrders.length + stitchingOrders.length,
    totalCustomers: allCustomers.size,
    totalPotentialRevenue: retailPotentialRevenue + totalStitchingPotentialRevenue,

    retail: {
      revenue: retailRevenue,
      profit: retailProfit,
      dues: retailDues,
      orders: retailOrders.length,
      completedOrders: retailCompleted,
      pendingOrders: retailPending,
      averageOrderValue: retailAvgOrderValue,
      cashTotal: retailCash,
      upiTotal: retailUPI,
      itemsSold,
      inventoryValue,
    },

    stitching: {
      revenue: stitchingRevenue,
      profit: stitchingProfit,
      dues: stitchingDues,
      orders: stitchingOrders.length,
      deliveredOrders: stitchingDelivered,
      pendingOrders: stitchingPending,
      inProgressOrders: stitchingInProgress,
      readyOrders: stitchingReady,
      averageOrderValue: stitchingAvgOrderValue,
      cashTotal: stitchingCash,
      upiTotal: stitchingUPI,
      fabricProfit,
      asterProfit,
      accessoryRevenue,
      totalStitchingCharge,
      fabricInventoryValue,
      accessoryInventoryValue,
      totalInventoryValue: totalStitchingInventoryValue,
    },

    highestValueOrder,
    mostProfitableOrder,
  };
};

// Helper functions for combined chart data
export const getCombinedMonthlyData = (
  retailOrders: Order[],
  stitchingOrders: StitchingOrder[],
  months: number
) => {
  const now = new Date();
  const data: { month: string; revenue: number; profit: number; orders: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Filter retail orders
    const retailMonthOrders = retailOrders.filter((order) => {
      const orderDate = new Date(order.$createdAt || '');
      return (
        orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
      );
    });

    // Filter stitching orders
    const stitchingMonthOrders = stitchingOrders.filter((order) => {
      const orderDate = new Date(order.$createdAt || '');
      return (
        orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
      );
    });

    const retailRevenue = retailMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const retailProfit = retailMonthOrders.reduce((sum, order) => sum + order.totalProfit, 0);

    const stitchingRevenue = stitchingMonthOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Calculate stitching profit
    let stitchingProfit = 0;
    stitchingMonthOrders.forEach((order) => {
      try {
        const items: StitchingOrderItem[] = JSON.parse(order.items);
        items.forEach((item) => {
          stitchingProfit += item.stitchingPrice * item.quantity;
          if (item.fabric.source === 'shop') stitchingProfit += item.fabric.fabricCost;
          item.additionalCharges.forEach((charge) => (stitchingProfit += charge.amount));
          item.accessories.forEach((acc) => {
            if (acc.billedToCustomer) stitchingProfit += acc.totalCost;
          });
        });
      } catch (e) {
        // Skip on error
      }
    });

    data.push({
      month: monthStr,
      revenue: retailRevenue + stitchingRevenue,
      profit: retailProfit + stitchingProfit,
      orders: retailMonthOrders.length + stitchingMonthOrders.length,
    });
  }

  return data;
};

export const getCombinedDailyData = (
  retailOrders: Order[],
  stitchingOrders: StitchingOrder[],
  days: number
) => {
  const now = new Date();
  const data: { date: string; revenue: number; profit: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Filter retail orders
    const retailDayOrders = retailOrders.filter((order) => {
      const orderDate = new Date(order.$createdAt || '');
      return (
        orderDate.getDate() === date.getDate() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear()
      );
    });

    // Filter stitching orders
    const stitchingDayOrders = stitchingOrders.filter((order) => {
      const orderDate = new Date(order.$createdAt || '');
      return (
        orderDate.getDate() === date.getDate() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear()
      );
    });

    const retailRevenue = retailDayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const retailProfit = retailDayOrders.reduce((sum, order) => sum + order.totalProfit, 0);

    const stitchingRevenue = stitchingDayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate stitching profit
    let stitchingProfit = 0;
    stitchingDayOrders.forEach((order) => {
      try {
        const items: StitchingOrderItem[] = JSON.parse(order.items);
        items.forEach((item) => {
          stitchingProfit += item.stitchingPrice * item.quantity;
          if (item.fabric.source === 'shop') stitchingProfit += item.fabric.fabricCost;
          item.additionalCharges.forEach((charge) => (stitchingProfit += charge.amount));
          item.accessories.forEach((acc) => {
            if (acc.billedToCustomer) stitchingProfit += acc.totalCost;
          });
        });
      } catch (e) {
        // Skip on error
      }
    });

    data.push({
      date: dateStr,
      revenue: retailRevenue + stitchingRevenue,
      profit: retailProfit + stitchingProfit,
    });
  }

  return data;
};

export const getCombinedTopCustomers = (
  retailOrders: Order[],
  stitchingOrders: StitchingOrder[],
  limit: number
) => {
  const customerMap = new Map<string, { name: string; revenue: number }>();

  // Add retail revenue
  retailOrders.forEach((order) => {
    const existing = customerMap.get(order.customerPhone) || {
      name: order.customerName || order.customerPhone,
      revenue: 0,
    };
    existing.revenue += order.totalAmount;
    customerMap.set(order.customerPhone, existing);
  });

  // Add stitching revenue
  stitchingOrders.forEach((order) => {
    const existing = customerMap.get(order.customerPhone) || {
      name: order.customerName || order.customerPhone,
      revenue: 0,
    };
    existing.revenue += order.totalAmount;
    customerMap.set(order.customerPhone, existing);
  });

  // Sort by revenue and return top customers
  return Array.from(customerMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};
