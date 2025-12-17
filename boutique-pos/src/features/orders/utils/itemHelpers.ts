import type { OrderItem } from '../../../types/order';

/**
 * Handle discount change for an order item
 */
export const handleDiscountChange = (item: OrderItem, discount: number): Partial<OrderItem> => {
  const sellingPrice = Math.max(0, item.markedPrice - discount);
  return { discount, sellingPrice };
};

/**
 * Handle selling price change for an order item
 */
export const handleSellingPriceChange = (
  item: OrderItem,
  sellingPrice: number
): Partial<OrderItem> => {
  const discount = Math.max(0, item.markedPrice - sellingPrice);
  return { sellingPrice, discount };
};

/**
 * Reset item to initial validating state
 */
export const setItemValidating = (itemId: string): Partial<OrderItem> => {
  return {
    itemId,
    isValidating: true,
  };
};

/**
 * Clear item data
 */
export const clearItemData = (): Partial<OrderItem> => {
  return {
    itemId: '',
    costPrice: 0,
    markedPrice: 0,
    discount: 0,
    sellingPrice: 0,
    itemExists: false,
    isValidating: false,
  };
};
