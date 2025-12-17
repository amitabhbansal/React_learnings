/**
 * Enhanced item structure for orders
 */
export interface OrderItem {
  itemId: string;
  costPrice: number;
  markedPrice: number;
  discount: number;
  sellingPrice: number;
  itemExists: boolean;
  isValidating: boolean;
  given: boolean;
}

/**
 * Form state for creating a new order
 */
export interface OrderFormData {
  customerPhone: string;
  customerName: string;
  remarks: string;
  saleDate: string;
  status: 'pending' | 'completed' | 'stuck';
  totalAmount: number;
  totalProfit: number;
  amountPaid: number;
  paymentMethod: 'cash' | 'upi';
}

/**
 * Initial state for order form
 */
export const initialOrderFormData: OrderFormData = {
  customerPhone: '',
  customerName: '',
  remarks: '',
  saleDate: new Date().toISOString().split('T')[0],
  status: 'pending',
  totalAmount: 0,
  totalProfit: 0,
  amountPaid: 0,
  paymentMethod: 'cash',
};

/**
 * Initial state for order item
 */
export const initialOrderItem: OrderItem = {
  itemId: '',
  costPrice: 0,
  markedPrice: 0,
  discount: 0,
  sellingPrice: 0,
  itemExists: false,
  isValidating: false,
  given: true,
};
