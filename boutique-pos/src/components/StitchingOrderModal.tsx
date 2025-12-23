import { useState } from 'react';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import type { StitchingOrder, PaymentRecord, StitchingOrderItem } from '../types/stitching';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

interface StitchingOrderModalProps {
  order: StitchingOrder;
  mode?: 'view' | 'edit';
  onClose: () => void;
  onUpdate?: () => void;
}

const StitchingOrderModal = ({
  order,
  mode = 'view',
  onClose,
  onUpdate,
}: StitchingOrderModalProps) => {
  const { privacyMode } = useApp();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [currentOrder, setCurrentOrder] = useState(order);
  const [editStatus, setEditStatus] = useState(order.status);
  const [editRemarks, setEditRemarks] = useState(order.tailorRemarks);
  const [additionalPayment, setAdditionalPayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentRemarks, setPaymentRemarks] = useState('');

  const orderItems: StitchingOrderItem[] = (() => {
    try {
      return JSON.parse(order.items);
    } catch (error) {
      return [];
    }
  })();

  const paymentHistory: PaymentRecord[] = (() => {
    try {
      return JSON.parse(currentOrder.paymentHistory || '[]');
    } catch (error) {
      return [];
    }
  })();

  const balanceDue = currentOrder.totalAmount - currentOrder.amountPaid;

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
      'in-progress': 'badge bg-blue-100 text-blue-700 border-blue-300',
      ready: 'badge bg-purple-100 text-purple-700 border-purple-300',
      delivered: 'badge bg-green-100 text-green-700 border-green-300',
      stuck: 'badge bg-red-100 text-red-700 border-red-300',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const saveOrderChanges = async () => {
    setEditLoading(true);
    setEditError('');

    try {
      const updates: any = {};

      // Update status if changed
      if (editStatus !== currentOrder.status) {
        updates.status = editStatus;
      }

      // Update remarks if changed
      if (editRemarks !== currentOrder.tailorRemarks) {
        updates.tailorRemarks = editRemarks;
      }

      // Calculate new amount paid
      let newAmountPaid = currentOrder.amountPaid;

      // Add payment if provided
      if (additionalPayment > 0) {
        newAmountPaid = currentOrder.amountPaid + additionalPayment;
        updates.amountPaid = newAmountPaid;

        // Update payment history
        const updatedPaymentHistory = [
          ...paymentHistory,
          {
            date: new Date(paymentDate).toISOString(),
            amount: additionalPayment,
            method: paymentMethod,
            remarks: paymentRemarks.trim() || 'Additional payment',
          } as PaymentRecord,
        ];
        updates.paymentHistory = JSON.stringify(updatedPaymentHistory);
      }

      // Only proceed if there are updates
      if (Object.keys(updates).length === 0) {
        toast('No changes to save');
        setIsEditing(false);
        setEditLoading(false);
        return;
      }

      await service.updateStitchingOrder(currentOrder.$id, updates);

      // Update local state
      const updatedOrder = {
        ...currentOrder,
        ...updates,
      };
      setCurrentOrder(updatedOrder);
      setAdditionalPayment(0);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentRemarks('');
      setIsEditing(false);

      toast.success('Stitching order updated successfully!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating order:', error);
      setEditError('Failed to update order. Please try again.');
      toast.error('Failed to update order');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 p-6 border-b-2 border-boutique-secondary sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-white">
                {isEditing ? 'Edit Order' : 'Order Details'} - #{currentOrder.orderNo}
              </h3>
              <p className="text-amber-100 text-sm">
                {isEditing ? 'Update payment and status' : 'Complete order information'}
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
                <span className="text-boutique-dark/60">Order Date: </span>
                <span className="font-semibold">{formatDate(currentOrder.orderDate)}</span>
              </p>
              <p className="text-sm mt-1">
                <span className="text-boutique-dark/60">Promise Date: </span>
                <span className="font-semibold">{formatDate(currentOrder.promiseDate)}</span>
              </p>
              <p className="text-sm mt-1">
                <span className="text-boutique-dark/60">Status: </span>
                {isEditing ? (
                  <select
                    className="select select-bordered select-xs bg-white text-boutique-dark border-boutique-accent/40 ml-2"
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(
                        e.target.value as
                          | 'pending'
                          | 'in-progress'
                          | 'ready'
                          | 'delivered'
                          | 'stuck'
                      )
                    }
                    disabled={editLoading}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="stuck">Stuck</option>
                  </select>
                ) : (
                  <span
                    className={`${getStatusBadge(currentOrder.status)} badge-sm font-semibold uppercase ml-2`}
                  >
                    {currentOrder.status}
                  </span>
                )}
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
              Order Items ({orderItems.length})
            </h4>
            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border-2 border-boutique-accent/30 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-md bg-boutique-secondary text-boutique-dark border-none font-semibold">
                          {item.itemType}
                        </span>
                        <span className="text-lg font-bold text-boutique-primary">
                          {item.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-boutique-dark/70">
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
                              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                            />
                          </svg>
                          Qty:{' '}
                          <span className="font-semibold text-boutique-dark">{item.quantity}</span>
                        </span>
                        {!privacyMode && (
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(item.stitchingPrice * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fabric Details */}
                  <div className="bg-white p-3 rounded-lg border border-boutique-accent/20 mb-2">
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-boutique-dark/60 uppercase tracking-wide mb-1">
                          Fabric Details
                        </p>
                        <p className="text-sm text-boutique-dark">
                          <span className="font-semibold">
                            {item.fabric.fabricDescription || 'Not specified'}
                          </span>
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-boutique-dark/70">
                          <span
                            className={`badge badge-xs ${item.fabric.source === 'shop' ? 'badge-primary' : 'badge-ghost'}`}
                          >
                            {item.fabric.source === 'shop' ? 'Shop Provided' : 'Customer Provided'}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                              />
                            </svg>
                            {item.fabric.metersUsed}m used
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aster Details */}
                  {item.asterRequired && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                            Aster Required
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-boutique-dark capitalize">
                              {item.asterType}
                            </span>
                            {!privacyMode && (
                              <span className="text-sm font-bold text-amber-700">
                                {formatCurrency(item.asterCharge)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-semibold text-boutique-primary mb-3">Financial Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
                <p className="font-bold text-red-600 text-lg">{formatCurrency(balanceDue)}</p>
              </div>
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
          {isEditing && balanceDue > 0 && (
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
                    max={balanceDue}
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

          {/* Tailor Remarks */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-semibold text-boutique-primary mb-2">Tailor Remarks</h4>
            {isEditing ? (
              <textarea
                className="textarea textarea-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40"
                rows={3}
                placeholder="Add remarks or special instructions..."
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
                disabled={editLoading}
              ></textarea>
            ) : (
              <p className="text-sm text-boutique-dark/80">
                {currentOrder.tailorRemarks || 'No remarks'}
              </p>
            )}
          </div>

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
                {mode === 'view' && balanceDue > 0 && (
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

export default StitchingOrderModal;
