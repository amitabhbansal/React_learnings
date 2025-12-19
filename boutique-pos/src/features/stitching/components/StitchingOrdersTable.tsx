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
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'in-progress': return 'badge-info';
      case 'ready': return 'badge-success';
      case 'delivered': return 'badge-primary';
      case 'stuck': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-boutique-accent/30 shadow-md p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-boutique-primary/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-boutique-dark/60 text-lg">No orders found</p>
        <p className="text-boutique-dark/40 text-sm">Click "Fetch Orders" or create a new order</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-boutique-accent/30 shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead className="bg-gradient-to-r from-boutique-primary to-purple-950 text-white">
            <tr>
              <th className="font-bold text-white">Order No</th>
              <th className="font-bold text-white">Customer</th>
              {!privacyMode && <th className="font-bold text-white">Phone</th>}
              <th className="font-bold text-white">Order Date</th>
              <th className="font-bold text-white">Promise Date</th>
              <th className="font-bold text-white">Total</th>
              <th className="font-bold text-white">Paid</th>
              <th className="font-bold text-white">Balance</th>
              <th className="font-bold text-white">Status</th>
              <th className="font-bold text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.$id} className="hover:bg-purple-50 transition-colors">
                <td className="font-semibold text-boutique-primary">{order.orderNo}</td>
                <td className="font-medium">{privacyMode ? '***' : order.customerName}</td>
                {!privacyMode && <td className="text-sm">{order.customerPhone}</td>}
                <td className="text-sm">{formatDate(order.orderDate)}</td>
                <td className="text-sm">{formatDate(order.promiseDate)}</td>
                <td className="font-semibold">{formatCurrency(order.totalAmount)}</td>
                <td>{formatCurrency(order.amountPaid)}</td>
                <td className={`font-semibold ${order.totalAmount - order.amountPaid > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(order.totalAmount - order.amountPaid)}
                </td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(order.status)} font-medium`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => onViewOrder(order)}
                    className="btn btn-xs btn-primary gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StitchingOrdersTable;
