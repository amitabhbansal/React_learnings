import React from 'react';
import type { StitchingOrder } from '../../../types/stitching';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';

interface StitchingOrdersTableProps {
  orders: StitchingOrder[];
  onViewOrder: (order: StitchingOrder) => void;
  privacyMode?: boolean;
}

const StitchingOrdersTable: React.FC<StitchingOrdersTableProps> = ({
  orders,
  onViewOrder,
  privacyMode = false,
}) => {
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'badge bg-amber-100 text-amber-700 border-amber-300',
      'in-progress': 'badge bg-blue-100 text-blue-700 border-blue-300',
      ready: 'badge bg-green-100 text-green-700 border-green-300',
      delivered: 'badge bg-purple-100 text-purple-700 border-purple-300',
      stuck: 'badge bg-red-100 text-red-700 border-red-300',
    };
    return (
      badges[status as keyof typeof badges] || 'badge bg-gray-100 text-gray-700 border-gray-300'
    );
  };

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-br from-purple-50 via-white to-amber-50 rounded-2xl shadow-xl border-2 border-boutique-secondary/30 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-bold text-boutique-primary flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-boutique-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Stitching Orders ({orders.length})
        </h2>
      </div>

      <div className="overflow-x-auto rounded-xl border-2 border-boutique-accent/30">
        <table className="table table-sm">
          <thead>
            <tr className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 text-white border-b-2 border-boutique-secondary">
              <th className="text-white">#</th>
              <th className="text-white">Order No.</th>
              <th className="text-white">Customer</th>
              <th className="text-white">Order Date</th>
              <th className="text-white">Promise Date</th>
              <th className="text-white">Status</th>
              <th className="text-right text-white">Total Amount</th>
              <th className="text-right text-white">Amount Due</th>
              <th className="text-white">Payment</th>
              <th className="text-white">Items</th>
              <th className="text-white">Remarks</th>
              <th className="text-center text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {orders.map((order, index) => {
              const amountDue = order.totalAmount - order.amountPaid;
              let orderItems = [];
              try {
                orderItems = JSON.parse(order.items);
              } catch (e) {
                orderItems = [];
              }

              return (
                <tr
                  key={order.$id}
                  className="text-boutique-dark border-b border-boutique-accent/20 hover:bg-purple-50/50 transition-colors"
                >
                  <td className="font-medium">{index + 1}</td>
                  <td>
                    <button
                      onClick={() => onViewOrder(order)}
                      className="font-mono text-sm font-bold text-boutique-secondary hover:text-boutique-primary cursor-pointer hover:underline transition-colors"
                    >
                      {order.orderNo}
                    </button>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-semibold text-boutique-primary">
                        {privacyMode ? '***' : order.customerName}
                      </span>
                      {!privacyMode && (
                        <span className="text-xs text-boutique-dark/60">{order.customerPhone}</span>
                      )}
                    </div>
                  </td>
                  <td className="text-sm">{formatDate(order.orderDate)}</td>
                  <td className="text-sm">{formatDate(order.promiseDate)}</td>
                  <td>
                    <span
                      className={`${getStatusBadge(order.status)} badge-sm font-semibold uppercase`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="text-right font-bold text-boutique-primary">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="text-right">
                    <span
                      className={`font-semibold ${amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {formatCurrency(amountDue)}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-boutique-dark/80">
                      {formatCurrency(order.amountPaid)}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-sm bg-purple-100 text-purple-700 border-purple-300">
                      {orderItems.length} items
                    </span>
                  </td>
                  <td className="text-xs text-boutique-dark/60 max-w-[150px] truncate">
                    {order.tailorRemarks || '-'}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => onViewOrder(order)}
                      className="btn btn-xs bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none"
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
  );
};

export default StitchingOrdersTable;
