import React from 'react';
import type { OrderItem } from '../../../types/order';

interface OrderItemRowProps {
  item: OrderItem;
  index: number;
  onItemChange: (index: number, field: keyof OrderItem, value: string | number | boolean) => void;
  onRemove: (index: number) => void;
  disabled: boolean;
}

const OrderItemRow: React.FC<OrderItemRowProps> = ({
  item,
  index,
  onItemChange,
  onRemove,
  disabled,
}) => {
  return (
    <div className="p-3 bg-white rounded-lg border border-boutique-accent/20">
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* Item ID Input */}
        <div className="col-span-12 md:col-span-2">
          <input
            type="text"
            placeholder="Item ID*"
            className={`input input-sm input-bordered w-full text-boutique-dark border focus:outline-none ${
              item.isValidating
                ? 'bg-yellow-50 border-yellow-500'
                : item.itemExists
                  ? 'bg-green-50 border-green-500'
                  : item.itemId.trim() && !item.isValidating
                    ? 'bg-red-50 border-red-500'
                    : 'bg-white border-boutique-accent/40 focus:border-boutique-secondary'
            }`}
            value={item.itemId}
            onChange={(e) => onItemChange(index, 'itemId', e.target.value)}
            disabled={disabled}
          />
          {item.isValidating && <span className="text-xs text-yellow-600 mt-1">Validating...</span>}
        </div>

        {/* Cost Price - Read Only */}
        <div className="col-span-3 md:col-span-1">
          <input
            type="number"
            placeholder="Cost"
            className="input input-sm input-bordered w-full bg-gray-50 text-boutique-dark border border-boutique-accent/40 text-xs"
            value={item.costPrice || ''}
            readOnly
            tabIndex={-1}
          />
        </div>

        {/* Marked Price - Read Only */}
        <div className="col-span-3 md:col-span-1">
          <input
            type="number"
            placeholder="Marked"
            className="input input-sm input-bordered w-full bg-gray-50 text-boutique-dark border border-boutique-accent/40 text-xs"
            value={item.markedPrice || ''}
            readOnly
            tabIndex={-1}
          />
        </div>

        {/* Discount - Editable */}
        <div className="col-span-3 md:col-span-1">
          <input
            type="number"
            placeholder="Disc."
            className="input input-sm input-bordered w-full bg-white text-boutique-dark border border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none"
            value={item.discount || ''}
            onChange={(e) => onItemChange(index, 'discount', Number(e.target.value))}
            min="0"
            disabled={!item.itemExists || disabled}
          />
        </div>

        {/* Selling Price - Editable */}
        <div className="col-span-3 md:col-span-2">
          <input
            type="number"
            placeholder="Selling Price*"
            className="input input-sm input-bordered w-full bg-white text-boutique-dark border border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none"
            value={item.sellingPrice || ''}
            onChange={(e) => onItemChange(index, 'sellingPrice', Number(e.target.value))}
            min="0"
            disabled={!item.itemExists || disabled}
          />
        </div>

        {/* Profit - Read Only */}
        <div className="col-span-4 md:col-span-2">
          <input
            type="number"
            placeholder="Profit"
            className={`input input-sm input-bordered w-full text-boutique-dark border border-boutique-accent/40 cursor-not-allowed ${
              item.sellingPrice > 0 && item.sellingPrice - item.costPrice >= 0
                ? 'bg-green-50 text-green-700'
                : item.sellingPrice > 0
                  ? 'bg-red-50 text-red-700'
                  : 'bg-gray-50'
            }`}
            value={item.sellingPrice > 0 ? item.sellingPrice - item.costPrice : ''}
            readOnly
            tabIndex={-1}
          />
        </div>

        {/* Given Status - Toggle Button */}
        <div className="col-span-4 md:col-span-1 flex items-center justify-center">
          <button
            type="button"
            className={`btn btn-xs gap-1 transition-all ${
              item.given
                ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-300'
            }`}
            onClick={() => onItemChange(index, 'given', !item.given)}
            disabled={!item.itemExists || disabled}
            title={item.given ? 'Item given to customer' : 'Item pending (alterations)'}
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
                <span className="hidden md:inline">Given</span>
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
                <span className="hidden md:inline">Pending</span>
              </>
            )}
          </button>
        </div>

        {/* Remove Button */}
        <div className="col-span-4 md:col-span-2 flex items-center justify-center gap-1">
          <button
            type="button"
            className="btn btn-xs btn-error gap-1"
            onClick={() => onRemove(index)}
            disabled={disabled}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden md:inline">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderItemRow;
