import type { OrderItem } from '../../../types/order';

/**
 * Calculate total amount from order items
 */
export const calculateTotalAmount = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.sellingPrice, 0);
};

/**
 * Calculate total cost from order items
 */
export const calculateTotalCost = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.costPrice, 0);
};

/**
 * Calculate total profit (amount - cost)
 */
export const calculateTotalProfit = (items: OrderItem[]): number => {
  const totalAmount = calculateTotalAmount(items);
  const totalCost = calculateTotalCost(items);
  return totalAmount - totalCost;
};

/**
 * Filter valid items for calculation (must exist and have selling price)
 */
export const getValidItems = (items: OrderItem[]): OrderItem[] => {
  return items.filter((item) => item.itemExists && item.itemId.trim() && item.sellingPrice > 0);
};
