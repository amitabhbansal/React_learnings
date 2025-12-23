import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import type { StitchingOrder } from '../types/stitching';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { useApp } from '../context/AppContext';
import StitchingOrderModal from '../components/StitchingOrderModal';

const StitchingOverview = () => {
  const { privacyMode } = useApp();
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<StitchingOrder | null>(null);
  const [upcomingDays, setUpcomingDays] = useState(7);

  // Calculated metrics
  const [overdueOrders, setOverdueOrders] = useState<StitchingOrder[]>([]);
  const [upcomingOrders, setUpcomingOrders] = useState<StitchingOrder[]>([]);
  const [todayOrders, setTodayOrders] = useState<StitchingOrder[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [readyCount, setReadyCount] = useState(0);
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [upcomingDays]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await service.getStitchingOrders();
      processOrders(result);
    } catch (error) {
      console.error('Error fetching stitching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const processOrders = (allOrders: StitchingOrder[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + upcomingDays);

    // Filter non-delivered orders
    const activeOrders = allOrders.filter((order) => order.status !== 'delivered');

    // Overdue orders (promise date passed and not delivered)
    const overdue = activeOrders.filter((order) => {
      const promiseDate = new Date(order.promiseDate);
      promiseDate.setHours(0, 0, 0, 0);
      return promiseDate < today;
    });

    // Today's promise dates
    const todayPromise = activeOrders.filter((order) => {
      const promiseDate = new Date(order.promiseDate);
      promiseDate.setHours(0, 0, 0, 0);
      return promiseDate.getTime() === today.getTime();
    });

    // Upcoming orders (next X days)
    const upcoming = activeOrders.filter((order) => {
      const promiseDate = new Date(order.promiseDate);
      promiseDate.setHours(0, 0, 0, 0);
      return promiseDate > today && promiseDate <= futureDate;
    });

    // Status counts
    const pending = activeOrders.filter((o) => o.status === 'pending').length;
    const inProgress = activeOrders.filter((o) => o.status === 'in-progress').length;
    const ready = activeOrders.filter((o) => o.status === 'ready').length;

    // Total pending amount
    const pendingAmount = activeOrders.reduce((sum, order) => {
      const remaining = order.totalAmount - order.amountPaid;
      return sum + remaining;
    }, 0);

    setOverdueOrders(
      overdue.sort((a, b) => new Date(a.promiseDate).getTime() - new Date(b.promiseDate).getTime())
    );
    setTodayOrders(todayPromise);
    setUpcomingOrders(
      upcoming.sort((a, b) => new Date(a.promiseDate).getTime() - new Date(b.promiseDate).getTime())
    );
    setPendingCount(pending);
    setInProgressCount(inProgress);
    setReadyCount(ready);
    setTotalPendingAmount(pendingAmount);
  };

  const getDaysUntil = (date: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const promiseDate = new Date(date);
    promiseDate.setHours(0, 0, 0, 0);
    const diffTime = promiseDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'stuck':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'in-progress':
        return '🔄';
      case 'ready':
        return '✅';
      case 'stuck':
        return '⚠️';
      default:
        return '📦';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-boutique-primary mb-2">Stitching Overview</h1>
          <p className="text-boutique-dark/70">Your daily snapshot of orders and priorities</p>
        </div>
        <Link
          to="/stitching"
          className="btn bg-gradient-to-r from-boutique-primary to-purple-700 hover:from-purple-700 hover:to-boutique-primary text-white border-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Manage Orders
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-boutique-primary"></span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Overdue Orders */}
            <div className="card bg-gradient-to-br from-red-50 to-red-100 shadow-lg border-2 border-red-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="card-title text-red-700 text-3xl">{overdueOrders.length}</h2>
                    <p className="text-red-600 font-semibold">Overdue Orders</p>
                  </div>
                  <div className="text-5xl">🚨</div>
                </div>
              </div>
            </div>

            {/* Today's Deliveries */}
            <div className="card bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg border-2 border-orange-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="card-title text-orange-700 text-3xl">{todayOrders.length}</h2>
                    <p className="text-orange-600 font-semibold">Due Today</p>
                  </div>
                  <div className="text-5xl">📅</div>
                </div>
              </div>
            </div>

            {/* Upcoming (Next X Days) */}
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg border-2 border-blue-300">
              <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="card-title text-blue-700 text-3xl">{upcomingOrders.length}</h2>
                    <p className="text-blue-600 font-semibold">Upcoming Orders</p>
                  </div>
                  <div className="text-5xl">⏰</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-blue-700">Show:</label>
                  <select
                    value={upcomingDays}
                    onChange={(e) => setUpcomingDays(Number(e.target.value))}
                    className="select select-sm bg-white text-boutique-dark border-2 border-blue-300 font-semibold hover:border-blue-500 focus:border-blue-500"
                  >
                    <option className="bg-white text-boutique-dark" value={3}>
                      Next 3 Days
                    </option>
                    <option className="bg-white text-boutique-dark" value={5}>
                      Next 5 Days
                    </option>
                    <option className="bg-white text-boutique-dark" value={7}>
                      Next 7 Days
                    </option>
                    <option className="bg-white text-boutique-dark" value={10}>
                      Next 10 Days
                    </option>
                    <option className="bg-white text-boutique-dark" value={14}>
                      Next 14 Days
                    </option>
                    <option className="bg-white text-boutique-dark" value={30}>
                      Next 30 Days
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pending Amount */}
            <div className="card bg-gradient-to-br from-green-50 to-green-100 shadow-lg border-2 border-green-300">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="card-title text-green-700 text-2xl">
                      {formatCurrency(totalPendingAmount)}
                    </h2>
                    <p className="text-green-600 font-semibold">Pending Payment</p>
                  </div>
                  <div className="text-5xl">💰</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg border-2 border-boutique-accent/30">
            <div className="card-body">
              <h2 className="card-title text-boutique-primary text-2xl mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
                Order Status Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat bg-white rounded-xl shadow border-2 border-yellow-200">
                  <div className="stat-figure text-4xl">⏳</div>
                  <div className="stat-title text-boutique-dark/70">Pending</div>
                  <div className="stat-value text-yellow-600">{pendingCount}</div>
                </div>
                <div className="stat bg-white rounded-xl shadow border-2 border-blue-200">
                  <div className="stat-figure text-4xl">🔄</div>
                  <div className="stat-title text-boutique-dark/70">In Progress</div>
                  <div className="stat-value text-blue-600">{inProgressCount}</div>
                </div>
                <div className="stat bg-white rounded-xl shadow border-2 border-green-200">
                  <div className="stat-figure text-4xl">✅</div>
                  <div className="stat-title text-boutique-dark/70">Ready</div>
                  <div className="stat-value text-green-600">{readyCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Orders */}
          <div className="card bg-white shadow-xl border-2 border-red-300">
            <div className="card-body">
              <h2 className="card-title text-2xl text-red-700 mb-4">
                🚨 Overdue Orders - Immediate Attention Required
              </h2>
              {overdueOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr className="bg-red-50">
                        <th className="text-boutique-dark">Order No</th>
                        <th className="text-boutique-dark">Customer</th>
                        <th className="text-boutique-dark">Promise Date</th>
                        <th className="text-boutique-dark">Days Overdue</th>
                        <th className="text-boutique-dark">Status</th>
                        <th className="text-boutique-dark">Amount</th>
                        <th className="text-boutique-dark">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdueOrders.map((order) => {
                        const daysOverdue = Math.abs(getDaysUntil(order.promiseDate));
                        return (
                          <tr key={order.$id} className="hover:bg-red-50/50">
                            <td>
                              <span className="badge badge-sm bg-red-200 text-red-800 border-red-400">
                                {order.orderNo}
                              </span>
                            </td>
                            <td className="font-semibold">
                              {privacyMode ? '***' : order.customerName}
                            </td>
                            <td className="text-red-600 font-semibold">
                              {formatDate(order.promiseDate)}
                            </td>
                            <td>
                              <span className="badge badge-error text-white">
                                {daysOverdue} days
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-sm ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)} {order.status}
                              </span>
                            </td>
                            <td className="font-semibold">
                              {formatCurrency(order.totalAmount - order.amountPaid)}
                            </td>
                            <td>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="btn btn-xs bg-boutique-primary hover:bg-purple-700 text-white border-none"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-green-50 rounded-lg">
                  <div className="text-5xl mb-3">✅</div>
                  <p className="text-green-700 font-semibold text-lg">No Overdue Orders</p>
                  <p className="text-green-600 text-sm">All orders are on track!</p>
                </div>
              )}
            </div>
          </div>

          {/* Today's Orders */}
          {todayOrders.length > 0 && (
            <div className="card bg-white shadow-xl border-2 border-orange-300">
              <div className="card-body">
                <h2 className="card-title text-2xl text-orange-700 mb-4">
                  📅 Due Today - Priority Deliveries
                </h2>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr className="bg-orange-50">
                        <th className="text-boutique-dark">Order No</th>
                        <th className="text-boutique-dark">Customer</th>
                        <th className="text-boutique-dark">Status</th>
                        <th className="text-boutique-dark">Amount</th>
                        <th className="text-boutique-dark">Paid</th>
                        <th className="text-boutique-dark">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayOrders.map((order) => (
                        <tr key={order.$id} className="hover:bg-orange-50/50">
                          <td>
                            <span className="badge badge-sm bg-orange-200 text-orange-800 border-orange-400">
                              {order.orderNo}
                            </span>
                          </td>
                          <td className="font-semibold">
                            {privacyMode ? '***' : order.customerName}
                          </td>
                          <td>
                            <span className={`badge badge-sm ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)} {order.status}
                            </span>
                          </td>
                          <td className="font-semibold">{formatCurrency(order.totalAmount)}</td>
                          <td className="font-semibold text-green-600">
                            {formatCurrency(order.amountPaid)}
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="btn btn-xs bg-boutique-primary hover:bg-purple-700 text-white border-none"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Orders (Next X Days) */}
          {upcomingOrders.length > 0 && (
            <div className="card bg-white shadow-xl border-2 border-blue-300">
              <div className="card-body">
                <h2 className="card-title text-2xl text-blue-700 mb-4">
                  ⏰ Upcoming Orders - Next {upcomingDays} Days
                </h2>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="text-boutique-dark">Order No</th>
                        <th className="text-boutique-dark">Customer</th>
                        <th className="text-boutique-dark">Promise Date</th>
                        <th className="text-boutique-dark">Days Until</th>
                        <th className="text-boutique-dark">Status</th>
                        <th className="text-boutique-dark">Amount</th>
                        <th className="text-boutique-dark">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingOrders.map((order) => {
                        const daysUntil = getDaysUntil(order.promiseDate);
                        return (
                          <tr key={order.$id} className="hover:bg-blue-50/50">
                            <td>
                              <span className="badge badge-sm bg-blue-200 text-blue-800 border-blue-400">
                                {order.orderNo}
                              </span>
                            </td>
                            <td className="font-semibold">
                              {privacyMode ? '***' : order.customerName}
                            </td>
                            <td>{formatDate(order.promiseDate)}</td>
                            <td>
                              <span
                                className={`badge ${daysUntil <= 2 ? 'badge-warning' : 'badge-info'}`}
                              >
                                {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-sm ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)} {order.status}
                              </span>
                            </td>
                            <td className="font-semibold">
                              {formatCurrency(order.totalAmount - order.amountPaid)}
                            </td>
                            <td>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="btn btn-xs bg-boutique-primary hover:bg-purple-700 text-white border-none"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* No urgent orders message */}
          {overdueOrders.length === 0 &&
            todayOrders.length === 0 &&
            upcomingOrders.length === 0 && (
              <div className="card bg-gradient-to-br from-green-50 to-green-100 shadow-lg border-2 border-green-300">
                <div className="card-body text-center py-12">
                  <div className="text-7xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-green-700 mb-2">All Clear!</h2>
                  <p className="text-green-600 text-lg">
                    No urgent orders at the moment. Great job staying on top of everything!
                  </p>
                </div>
              </div>
            )}
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <StitchingOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={fetchOrders}
        />
      )}
    </div>
  );
};

export default StitchingOverview;
