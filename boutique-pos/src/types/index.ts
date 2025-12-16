export interface Customer {
  phone: string;
  name: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface Item {
  $id?: string;
  title?: string;
  itemId: string;
  color?: string;
  size?: string;
  sold?: boolean;
  remarks?: string;
  costPrice: number;
  markedPrice: number;
  defaultSellingPrice?: number;
  discount?: number; // Discount given when sold
  sellingPrice?: number; // Actual selling price when sold
  $createdAt?: string;
  $updatedAt?: string;
}

export interface OrderItem {
  itemId: string;
  title?: string;
  sellingPrice: number;
  costPrice: number;
  color?: string;
  size?: string;
}

export interface Order {
  $id?: string;
  customerPhone: string;
  customerName?: string; // Customer name stored directly in order
  items: string; // JSON stringified array of OrderItem[] or simple string format
  status: 'pending' | 'completed' | 'stuck';
  remarks?: string;
  totalAmount: number;
  totalProfit: number;
  saleDate: string;
  $createdAt?: string;
  $updatedAt?: string;
}

// Helper functions for Order items
export const stringifyOrderItems = (items: OrderItem[]): string => {
  return JSON.stringify(items);
};

export const parseOrderItems = (itemsString: string): OrderItem[] => {
  try {
    return JSON.parse(itemsString);
  } catch (error) {
    console.error('Error parsing order items:', error);
    return [];
  }
};
