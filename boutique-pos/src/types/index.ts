export interface Customer {
  $id?: string;
  phone: string;
  name: string;
  measurements?: string; // JSON string of measurement data
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

export interface PaymentRecord {
  amount: number;
  date: string;
  method: 'cash' | 'upi';
  remarks?: string;
}

export interface Order {
  $id?: string;
  billNo: number; // Serial bill number (1, 2, 3...)
  customerPhone: string;
  customerName?: string; // Customer name stored directly in order
  items: string; // JSON stringified array of OrderItem[] or simple string format
  status: 'pending' | 'completed' | 'stuck';
  remarks?: string;
  totalAmount: number;
  totalProfit: number;
  amountPaid: number; // Total amount received so far
  paymentHistory: string; // JSON stringified array of PaymentRecord[]
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

export interface Fabric {
  $id?: string;
  fabricId: string;
  name?: string;
  color?: string;
  totalMeters: number;
  usedMeters?: number;
  purchaseRate: number;
  sellingRate: number;
  supplier?: string;
  purchaseDate?: string;
  remarks?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface Accessory {
  $id?: string;
  accessoryId: string;
  type: string; // button, border, lace, zip, etc.
  description: string;
  unit: 'piece' | 'meter' | 'set';
  quantityInStock: number;
  quantityUsed?: number;
  purchaseRate: number;
  sellingRate: number;
  supplier?: string;
  remarks?: string;
  $createdAt?: string;
  $updatedAt?: string;
}
