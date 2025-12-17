import React from 'react';
import type { OrderFormData, OrderItem } from '../../../types/order';

interface OrderSummaryProps {
  orderData: OrderFormData;
  orderItems: OrderItem[];
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  privacyMode?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderData,
  orderItems,
  onInputChange,
  privacyMode = false,
}) => {
  const validItemsCount = orderItems.filter((i) => i.itemExists).length;
  const amountDue = orderData.totalAmount - orderData.amountPaid;

  return (
    <div className="bg-purple-50 p-4 rounded-lg border-2 border-boutique-accent/30">
      <h4 className="font-semibold text-boutique-primary mb-3">Order Summary</h4>

      {/* Totals Section */}
      <div
        className={`grid grid-cols-1 ${privacyMode ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4 mb-4`}
      >
        <div>
          <label className="label">
            <span className="label-text font-semibold text-boutique-dark">Total Amount</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full bg-gray-100 text-boutique-primary font-bold border-2 border-boutique-accent/40 cursor-not-allowed"
            value={orderData.totalAmount || 0}
            readOnly
            tabIndex={-1}
          />
        </div>

        {!privacyMode && (
          <div>
            <label className="label">
              <span className="label-text font-semibold text-boutique-dark">Total Profit</span>
            </label>
            <input
              type="number"
              className={`input input-bordered w-full font-bold border-2 border-boutique-accent/40 cursor-not-allowed ${
                orderData.totalProfit > 0
                  ? 'bg-green-50 text-green-700'
                  : orderData.totalProfit < 0
                    ? 'bg-red-50 text-red-700'
                    : 'bg-gray-100 text-boutique-primary'
              }`}
              value={orderData.totalProfit !== 0 ? orderData.totalProfit : ''}
              readOnly
              tabIndex={-1}
            />
          </div>
        )}

        <div>
          <label className="label">
            <span className="label-text font-semibold text-boutique-dark">Items Count</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full bg-gray-100 text-boutique-primary font-bold border-2 border-boutique-accent/40 cursor-not-allowed"
            value={validItemsCount}
            readOnly
            tabIndex={-1}
          />
        </div>
      </div>

      {/* Payment Section */}
      <div className="border-t-2 border-boutique-accent/30 pt-4">
        <h4 className="font-semibold text-boutique-primary mb-3">Payment Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold text-boutique-dark">
                Amount Received <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="number"
              name="amountPaid"
              placeholder="Enter amount received"
              className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
              value={orderData.amountPaid || ''}
              onChange={onInputChange}
              min="0"
              max={orderData.totalAmount}
            />
            <label className="label">
              <span className="label-text-alt text-xs text-boutique-dark/60">
                Can be partial/advance payment
              </span>
            </label>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold text-boutique-dark">
                Payment Method <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="paymentMethod"
              className="select select-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
              value={orderData.paymentMethod}
              onChange={onInputChange}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold text-boutique-dark">Amount Due</span>
            </label>
            <input
              type="number"
              className={`input input-bordered w-full font-bold border-2 border-boutique-accent/40 cursor-not-allowed ${
                amountDue > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}
              value={amountDue || 0}
              readOnly
              tabIndex={-1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
