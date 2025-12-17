import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import type { Order } from '../types';
import { formatCurrency } from '../utils/currency';
import {
  calculateDashboardMetrics,
  calculateDailyMetrics,
  calculateMonthlyMetrics,
  getMonthlyData,
  getDailyData,
  getTopCustomers,
  type DashboardMetrics,
} from '../utils/dashboardCalculations';

type DashboardMode = 'all-time' | 'daily' | 'monthly';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [mode, setMode] = useState<DashboardMode>('all-time');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Recalculate metrics when mode or date changes
    if (orders.length > 0) {
      recalculateMetrics();
    }
  }, [mode, selectedDate, selectedMonth]);

  const recalculateMetrics = async () => {
    try {
      const itemsData = await service.getItems();

      if (mode === 'all-time') {
        const uniqueCustomers = new Set(orders.map((o) => o.customerPhone)).size;
        const calculatedMetrics = calculateDashboardMetrics(orders, itemsData, uniqueCustomers);
        setMetrics(calculatedMetrics);
      } else if (mode === 'daily') {
        const calculatedMetrics = calculateDailyMetrics(orders, itemsData, selectedDate);
        setMetrics(calculatedMetrics);
      } else {
        // monthly mode
        const [year, month] = selectedMonth.split('-').map(Number);
        const calculatedMetrics = calculateMonthlyMetrics(orders, itemsData, year, month - 1);
        setMetrics(calculatedMetrics);
      }
    } catch (error) {
      console.error('Error recalculating metrics:', error);
      toast.error('Failed to recalculate metrics');
    }
  };
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersData, itemsData] = await Promise.all([
        service.getAllOrders(1000),
        service.getItems(),
      ]);

      setOrders(ordersData);

      if (mode === 'all-time') {
        // Count unique customers from orders
        const uniqueCustomers = new Set(ordersData.map((o) => o.customerPhone)).size;
        const calculatedMetrics = calculateDashboardMetrics(ordersData, itemsData, uniqueCustomers);
        setMetrics(calculatedMetrics);
      } else if (mode === 'daily') {
        const calculatedMetrics = calculateDailyMetrics(ordersData, itemsData, selectedDate);
        setMetrics(calculatedMetrics);
      } else {
        // monthly mode
        const [year, month] = selectedMonth.split('-').map(Number);
        const calculatedMetrics = calculateMonthlyMetrics(ordersData, itemsData, year, month - 1);
        setMetrics(calculatedMetrics);
      }

      toast.success('Dashboard loaded successfully!');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-boutique-primary"></span>
          <p className="mt-4 text-boutique-primary font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const monthlyData = getMonthlyData(orders, 6);
  const dailyData = getDailyData(orders, 30);
  const topCustomers = getTopCustomers(orders, 5);

  // Format date for display and input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(e.target.value as DashboardMode);
  };

  const paymentMethodData = [
    { name: 'Cash', value: metrics.cashTotal, color: '#10b981' },
    { name: 'UPI', value: metrics.upiTotal, color: '#3b82f6' },
  ];

  const orderStatusData = [
    { name: 'Completed', value: metrics.completedOrders, color: '#10b981' },
    { name: 'Pending', value: metrics.pendingOrders, color: '#f59e0b' },
  ];

  return (
    <div className={mode === 'all-time' ? 'space-y-6' : 'space-y-4'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 p-6 rounded-3xl border-2 border-boutique-secondary shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-boutique-secondary to-amber-300 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-boutique-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Super Dashboard</h1>
              <p className="text-amber-100 text-sm">Complete business analytics at a glance</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Selector Dropdown */}
            <select
              value={mode}
              onChange={handleModeChange}
              className="select select-sm bg-boutique-secondary text-boutique-dark border-none font-semibold w-32"
            >
              <option value="all-time">All Time</option>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>

            {/* Date Picker (shown only in daily mode) */}
            {mode === 'daily' && (
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleDateChange}
                max={formatDateForInput(new Date())}
                className="input input-sm bg-white text-boutique-dark border-none w-40"
              />
            )}

            {/* Month Picker (shown only in monthly mode) */}
            {mode === 'monthly' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                className="input input-sm bg-white text-boutique-dark border-none w-40"
              />
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchDashboardData}
              className="btn btn-sm bg-boutique-secondary hover:bg-amber-400 text-boutique-dark border-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Financial Metrics Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={
            mode === 'daily'
              ? 'Daily Revenue'
              : mode === 'monthly'
                ? 'Monthly Revenue'
                : 'Lifetime Revenue'
          }
          value={formatCurrency(metrics.lifetimeRevenue)}
          icon="💰"
          gradient="from-green-50 to-green-100"
          border="border-green-200"
          textColor="text-green-900"
        />
        <StatCard
          title={
            mode === 'daily'
              ? 'Daily Profit'
              : mode === 'monthly'
                ? 'Monthly Profit'
                : 'Lifetime Profit'
          }
          value={formatCurrency(metrics.lifetimeProfit)}
          icon="📈"
          gradient="from-blue-50 to-blue-100"
          border="border-blue-200"
          textColor="text-blue-900"
        />
        <StatCard
          title="Total Dues"
          value={formatCurrency(metrics.totalDues)}
          icon="💳"
          gradient="from-orange-50 to-orange-100"
          border="border-orange-200"
          textColor="text-orange-900"
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(metrics.averageOrderValue)}
          icon="📊"
          gradient="from-purple-50 to-purple-100"
          border="border-purple-200"
          textColor="text-purple-900"
        />
      </div>

      {/* Key Highlights Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={
            mode === 'daily'
              ? 'Orders Today'
              : mode === 'monthly'
                ? 'Orders This Month'
                : 'Total Orders'
          }
          value={metrics.totalOrders.toString()}
          icon="🛒"
          gradient="from-indigo-50 to-indigo-100"
          border="border-indigo-200"
          textColor="text-indigo-900"
        />
        <StatCard
          title={
            mode === 'daily'
              ? 'Customers Today'
              : mode === 'monthly'
                ? 'Customers This Month'
                : 'Total Customers'
          }
          value={metrics.totalCustomers.toString()}
          icon="👥"
          gradient="from-pink-50 to-pink-100"
          border="border-pink-200"
          textColor="text-pink-900"
        />
        {mode === 'all-time' && (
          <StatCard
            title="Items in Stock"
            value={metrics.itemsInStock.toString()}
            icon="📦"
            gradient="from-teal-50 to-teal-100"
            border="border-teal-200"
            textColor="text-teal-900"
          />
        )}
        <StatCard
          title={
            mode === 'daily'
              ? 'Items Sold Today'
              : mode === 'monthly'
                ? 'Items Sold This Month'
                : 'Items Sold'
          }
          value={metrics.itemsSold.toString()}
          icon="✅"
          gradient="from-emerald-50 to-emerald-100"
          border="border-emerald-200"
          textColor="text-emerald-900"
        />
      </div>

      {/* Special Metrics Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200 shadow-md">
          <div className="text-sm font-semibold text-yellow-700 mb-2">🏆 Highest Value Order</div>
          {metrics.highestValueOrder ? (
            <>
              <div className="text-2xl font-bold text-yellow-900">
                {formatCurrency(metrics.highestValueOrder.amount)}
              </div>
              <div className="text-xs text-yellow-700 mt-1">
                Bill #{metrics.highestValueOrder.billNo}
              </div>
            </>
          ) : (
            <div className="text-yellow-700">No orders yet</div>
          )}
        </div>

        <div className="p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-200 shadow-md">
          <div className="text-sm font-semibold text-cyan-700 mb-2">💎 Most Profitable Order</div>
          {metrics.mostProfitableOrder ? (
            <>
              <div className="text-2xl font-bold text-cyan-900">
                {formatCurrency(metrics.mostProfitableOrder.profit)}
              </div>
              <div className="text-xs text-cyan-700 mt-1">
                Bill #{metrics.mostProfitableOrder.billNo}
              </div>
            </>
          ) : (
            <div className="text-cyan-700">No orders yet</div>
          )}
        </div>

        <div className="p-5 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl border-2 border-rose-200 shadow-md">
          <div className="text-sm font-semibold text-rose-700 mb-2">⭐ Order Completion Rate</div>
          <div className="text-2xl font-bold text-rose-900">
            {metrics.orderCompletionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-rose-700 mt-1">
            {metrics.completedOrders} / {metrics.totalOrders} orders completed
          </div>
        </div>
      </div>

      {/* Revenue & Profit Trend Chart - Only in All Time mode */}
      {mode === 'all-time' && (
        <div className="bg-white p-6 rounded-2xl border-2 border-boutique-accent/30 shadow-lg">
          <h3 className="text-lg font-serif font-semibold mb-4 text-boutique-primary flex items-center gap-2">
            <span>📈</span>
            Revenue & Profit Trend (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #D4AF37',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => formatCurrency(value || 0)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorProfit)"
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly Sales & Payment Methods Row - Only in All Time mode */}
      {mode === 'all-time' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Sales Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border-2 border-boutique-accent/30 shadow-lg">
            <h3 className="text-lg font-serif font-semibold mb-4 text-boutique-primary flex items-center gap-2">
              <span>📊</span>
              Sales by Month (Last 6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #D4AF37',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any, name?: string) =>
                    name === 'orders' ? value : formatCurrency(value || 0)
                  }
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[8, 8, 0, 0]} />
                <Bar dataKey="profit" fill="#3b82f6" name="Profit" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Pie Chart */}
          <div className="bg-white p-6 rounded-2xl border-2 border-boutique-accent/30 shadow-lg">
            <h3 className="text-lg font-serif font-semibold mb-4 text-boutique-primary flex items-center gap-2">
              <span>💳</span>
              Payment Methods Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value || 0)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-around mt-4">
              <div className="text-center">
                <div className="text-xs text-gray-600">Cash</div>
                <div className="text-lg font-bold text-green-700">
                  {formatCurrency(metrics.cashTotal)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600">UPI</div>
                <div className="text-lg font-bold text-blue-700">
                  {formatCurrency(metrics.upiTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Customers & Order Status Row - Only in All Time mode */}
      {mode === 'all-time' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Customers */}
          <div className="bg-white p-6 rounded-2xl border-2 border-boutique-accent/30 shadow-lg">
            <h3 className="text-lg font-serif font-semibold mb-4 text-boutique-primary flex items-center gap-2">
              <span>👑</span>
              Top 5 Customers by Revenue
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#666" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#666" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #D4AF37',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => formatCurrency(value || 0)}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Pie Chart */}
          <div className="bg-white p-6 rounded-2xl border-2 border-boutique-accent/30 shadow-lg">
            <h3 className="text-lg font-serif font-semibold mb-4 text-boutique-primary flex items-center gap-2">
              <span>📋</span>
              Order Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-around mt-4">
              <div className="text-center">
                <div className="badge badge-success badge-sm mb-1">Completed</div>
                <div className="text-xl font-bold text-green-700">{metrics.completedOrders}</div>
              </div>
              <div className="text-center">
                <div className="badge badge-warning badge-sm mb-1">Pending</div>
                <div className="text-xl font-bold text-orange-700">{metrics.pendingOrders}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {mode === 'all-time' && (
          <>
            <StatCard
              title="Inventory Value"
              value={formatCurrency(metrics.inventoryValue)}
              icon="📦"
              gradient="from-violet-50 to-violet-100"
              border="border-violet-200"
              textColor="text-violet-900"
              subtitle="Cost of unsold items"
            />
            <StatCard
              title="Potential Revenue"
              value={formatCurrency(metrics.potentialRevenue)}
              icon="💵"
              gradient="from-lime-50 to-lime-100"
              border="border-lime-200"
              textColor="text-lime-900"
              subtitle="Marked price of stock"
            />
          </>
        )}
        <StatCard
          title={
            mode === 'daily'
              ? 'Discounts Today'
              : mode === 'monthly'
                ? 'Discounts This Month'
                : 'Total Discounts'
          }
          value={formatCurrency(metrics.totalDiscounts)}
          icon="🎁"
          gradient="from-amber-50 to-amber-100"
          border="border-amber-200"
          textColor="text-amber-900"
          subtitle="Given on sold items"
        />
        <StatCard
          title="Avg Items/Order"
          value={metrics.averageItemsPerOrder.toFixed(1)}
          icon="🔢"
          gradient="from-sky-50 to-sky-100"
          border="border-sky-200"
          textColor="text-sky-900"
          subtitle="Items per transaction"
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  gradient: string;
  border: string;
  textColor: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, gradient, border, textColor, subtitle }: StatCardProps) => {
  return (
    <div className={`p-5 bg-gradient-to-br ${gradient} rounded-xl border-2 ${border} shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-gray-700">{title}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
      {subtitle && <div className="text-xs text-gray-600 mt-1">{subtitle}</div>}
    </div>
  );
};

export default Dashboard;
