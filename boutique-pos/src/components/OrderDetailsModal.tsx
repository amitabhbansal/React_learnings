import { useState } from 'react';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import type { Order, PaymentRecord } from '../types';
import { useApp } from '../context/AppContext';

interface OrderItem {
  itemId: string;
  given: boolean;
}

interface OrderDetailsModalProps {
  order: Order;
  mode: 'view' | 'edit';
  onClose: () => void;
  onUpdate?: () => void;
}

const OrderDetailsModal = ({ order, mode, onClose, onUpdate }: OrderDetailsModalProps) => {
  const { privacyMode } = useApp();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editOrderItems, setEditOrderItems] = useState<OrderItem[]>(() => {
    try {
      return JSON.parse(order.items);
    } catch (error) {
      return [];
    }
  });
  const [additionalPayment, setAdditionalPayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [currentOrder, setCurrentOrder] = useState(order);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'badge bg-amber-100 text-amber-700 border-amber-300',
      completed: 'badge bg-green-100 text-green-700 border-green-300',
      stuck: 'badge bg-red-100 text-red-700 border-red-300',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const toggleItemGiven = (index: number) => {
    setEditOrderItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], given: !updated[index].given };
      return updated;
    });
  };

  const saveOrderChanges = async () => {
    setEditLoading(true);
    setEditError('');

    try {
      const updates: any = {};

      // Update items if changed
      const updatedItemsJson = JSON.stringify(editOrderItems);
      if (updatedItemsJson !== currentOrder.items) {
        updates.items = updatedItemsJson;
      }

      // Calculate new amount paid
      let newAmountPaid = currentOrder.amountPaid;

      // Add payment if provided
      if (additionalPayment > 0) {
        newAmountPaid = currentOrder.amountPaid + additionalPayment;
        updates.amountPaid = newAmountPaid;

        // Update payment history
        let paymentHistory: PaymentRecord[] = [];
        try {
          paymentHistory = JSON.parse(currentOrder.paymentHistory || '[]');
        } catch (e) {
          paymentHistory = [];
        }

        paymentHistory.push({
          amount: additionalPayment,
          date: new Date(paymentDate).toISOString(),
          method: paymentMethod,
          remarks: paymentRemarks.trim() || 'Additional payment',
        });

        updates.paymentHistory = JSON.stringify(paymentHistory);
      }

      // Auto-determine order status based on payment and items
      const amountDue = currentOrder.totalAmount - newAmountPaid;
      const allItemsGiven = editOrderItems.every((item) => item.given === true);

      let autoStatus: 'pending' | 'completed' | 'stuck';
      if (amountDue === 0 && allItemsGiven) {
        autoStatus = 'completed';
      } else {
        autoStatus = 'pending';
      }

      // Update status
      updates.status = autoStatus;

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await service.updateOrder(currentOrder.$id!, updates);
        toast.success(`Order updated successfully! Status: ${autoStatus}`);

        // Update local state
        setCurrentOrder({ ...currentOrder, ...updates });
        setAdditionalPayment(0);
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setPaymentRemarks('');
        setIsEditing(false);

        if (onUpdate) onUpdate();
      } else {
        toast('No changes to save');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      setEditError('Failed to update order. Please try again.');
      toast.error('Failed to update order');
    } finally {
      setEditLoading(false);
    }
  };

  const paymentHistory: PaymentRecord[] = (() => {
    try {
      return JSON.parse(currentOrder.paymentHistory || '[]');
    } catch (e) {
      return [];
    }
  })();

  const amountDue = currentOrder.totalAmount - currentOrder.amountPaid;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 p-6 border-b-2 border-boutique-secondary sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-white">
                {isEditing ? 'Edit Order' : 'Order Details'} - Bill #{currentOrder.billNo}
              </h3>
              <p className="text-amber-100 text-sm">
                {isEditing ? 'Update payment and item status' : 'Complete order information'}
              </p>
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20"
              onClick={onClose}
              disabled={editLoading}
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer & Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-boutique-primary mb-2">Customer Details</h4>
              <p className="text-sm">
                <span className="font-semibold">{currentOrder.customerName}</span>
              </p>
              <p className="text-sm text-boutique-dark/60">{currentOrder.customerPhone}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-boutique-primary mb-2">Order Information</h4>
              <p className="text-sm">
                <span className="text-boutique-dark/60">Sale Date: </span>
                <span className="font-semibold">{formatDate(currentOrder.saleDate)}</span>
              </p>
              <p className="text-sm mt-1">
                <span className="text-boutique-dark/60">Status: </span>
                <span
                  className={`${getStatusBadge(currentOrder.status)} badge-sm font-semibold uppercase`}
                >
                  {currentOrder.status}
                </span>
              </p>
              {!isEditing && currentOrder.$createdAt && (
                <p className="text-xs text-boutique-dark/60 mt-2">
                  Created: {formatDateTime(currentOrder.$createdAt)}
                </p>
              )}
            </div>
          </div>

          {/* Items Section */}
          <div>
            <h4 className="font-semibold text-boutique-primary mb-3">
              Order Items ({editOrderItems.length})
            </h4>
            <div className="space-y-2">
              {editOrderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-boutique-accent/30"
                >
                  <span className="font-medium text-boutique-dark">{item.itemId}</span>
                  {isEditing ? (
                    <button
                      type="button"
                      className={`btn btn-xs gap-1 transition-all ${
                        item.given
                          ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-300'
                      }`}
                      onClick={() => toggleItemGiven(index)}
                      disabled={editLoading}
                    >
                      {item.given ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Given
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Pending
                        </>
                      )}
                    </button>
                  ) : (
                    <span
                      className={`badge badge-sm ${item.given ? 'badge-success' : 'badge-warning'}`}
                    >
                      {item.given ? '✓ Given' : '⏳ Pending'}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {!isEditing && (
              <p className="text-xs text-boutique-dark/60 mt-2 italic">
                * Status auto-updates: Completed when fully paid & all items given
              </p>
            )}
          </div>

          {/* Financial Summary */}
          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-semibold text-boutique-primary mb-3">Financial Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-boutique-dark/60">Total Amount</p>
                <p className="font-bold text-boutique-primary text-lg">
                  {formatCurrency(currentOrder.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-boutique-dark/60">Amount Paid</p>
                <p className="font-bold text-green-600 text-lg">
                  {formatCurrency(currentOrder.amountPaid)}
                </p>
              </div>
              <div>
                <p className="text-boutique-dark/60">Amount Due</p>
                <p className="font-bold text-red-600 text-lg">{formatCurrency(amountDue)}</p>
              </div>
              {!privacyMode && (
                <div>
                  <p className="text-boutique-dark/60">Profit</p>
                  <p
                    className={`font-bold text-lg ${currentOrder.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(currentOrder.totalProfit)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          {paymentHistory.length > 0 && (
            <div>
              <h4 className="font-semibold text-boutique-primary mb-3">Payment History</h4>
              <div className="overflow-x-auto">
                <table className="table table-sm bg-white rounded-lg">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="text-boutique-dark">#</th>
                      <th className="text-boutique-dark">Date & Time</th>
                      <th className="text-right text-boutique-dark">Amount</th>
                      <th className="text-boutique-dark">Method</th>
                      <th className="text-boutique-dark">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment, index) => (
                      <tr key={index} className="border-b border-boutique-accent/20">
                        <td className="font-medium">{index + 1}</td>
                        <td className="text-sm">{formatDateTime(payment.date)}</td>
                        <td className="text-right font-bold text-green-600">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td>
                          <span className="badge badge-sm badge-outline uppercase">
                            {payment.method}
                          </span>
                        </td>
                        <td className="text-sm text-boutique-dark/60">{payment.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Payment Section (Edit Mode Only) */}
          {isEditing && amountDue > 0 && (
            <div className="border-t-2 border-boutique-accent/30 pt-4">
              <h5 className="font-semibold text-boutique-dark mb-3">Record New Payment</h5>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">Amount</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40"
                    value={additionalPayment || ''}
                    onChange={(e) => setAdditionalPayment(Number(e.target.value) || 0)}
                    min="0"
                    max={amountDue}
                    disabled={editLoading}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">Method</span>
                  </label>
                  <select
                    className="select select-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'upi')}
                    disabled={editLoading}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    disabled={editLoading}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold text-boutique-dark">Remarks</span>
                  <span className="label-text-alt text-xs text-boutique-dark/60">(Optional)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40"
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  disabled={editLoading}
                  placeholder="Enter payment remarks (default: Additional payment)"
                />
              </div>
            </div>
          )}

          {/* Remarks */}
          {currentOrder.remarks && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-boutique-primary mb-2">Remarks</h4>
              <p className="text-sm text-boutique-dark/80">{currentOrder.remarks}</p>
            </div>
          )}

          {/* Error Display */}
          {editError && (
            <div className="alert alert-error shadow-lg">
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
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{editError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {isEditing ? (
              <>
                <button
                  className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none gap-2 shadow-lg"
                  onClick={saveOrderChanges}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  className="btn bg-white hover:bg-slate-100 text-boutique-primary border-2 border-boutique-accent/30"
                  onClick={() => setIsEditing(false)}
                  disabled={editLoading}
                >
                  Cancel Edit
                </button>
              </>
            ) : (
              <>
                {mode === 'view' && amountDue > 0 && (
                  <button
                    className="btn bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-none gap-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Order
                  </button>
                )}
                <button
                  className="btn bg-white hover:bg-slate-100 text-boutique-primary border-2 border-boutique-accent/30"
                  onClick={onClose}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
