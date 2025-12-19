// Stitching Order Types

export interface Measurement {
  length?: string;
  waist?: string;
  chest?: string;
  hip?: string;
  upperChest?: string;
  shoulder?: string;
  frontNeck?: string;
  backNeck?: string;
  armhole?: string;
  sleeveLength?: string;
  sleeveCircumference?: string;
}

export interface FabricDetail {
  source: 'shop' | 'customer';
  fabricId: string | null;
  fabricDescription: string;
  metersUsed: number;
  ratePerMeter: number;
  fabricCost: number;
}

export interface AdditionalCharge {
  type: string; // dye, fall-pico, kaaj, lace, piping, etc.
  description: string;
  amount: number;
}

export interface AccessoryUsage {
  accessoryId: string;
  type: string;
  quantityUsed: number;
  unitPrice: number;
  totalCost: number;
  billedToCustomer: boolean;
}

export interface StitchingOrderItem {
  itemType: string; // blouse, kurti, suit, lehenga, saree, etc.
  description: string;
  quantity: number;
  stitchingPrice: number;
  asterRequired: boolean;
  asterType: string | null; // cotton, tapeta
  asterCharge: number;
  pieceGiven: boolean;
  fabric: FabricDetail;
  additionalCharges: AdditionalCharge[];
  accessories: AccessoryUsage[];
}

export interface PaymentRecord {
  date: string;
  amount: number;
  method: 'cash' | 'upi';
  remarks: string;
}

export interface StitchingOrder {
  $id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  orderDate: string;
  promiseDate: string;
  totalAmount: number;
  amountPaid: number;
  status: 'pending' | 'in-progress' | 'ready' | 'delivered' | 'stuck';
  tailorRemarks: string;
  items: string; // JSON string of StitchingOrderItem[]
  paymentHistory: string; // JSON string of PaymentRecord[]
  $createdAt: string;
  $updatedAt: string;
}

export interface StitchingOrderFormData {
  orderNo: string;
  customerName: string;
  customerPhone: string;
  orderDate: string;
  promiseDate: string;
  totalAmount: number;
  amountPaid: number;
  status: 'pending' | 'in-progress' | 'ready' | 'delivered' | 'stuck';
  tailorRemarks: string;
  items: StitchingOrderItem[];
  paymentHistory: PaymentRecord[];
}

export interface FabricInventory {
  $id: string;
  fabricId: string;
  name: string;
  color: string;
  totalMeters: number;
  usedMeters: number;
  purchaseRate: number;
  sellingRate: number;
  supplier: string;
  purchaseDate: string;
  remarks: string;
  $createdAt: string;
}

export interface AccessoryInventory {
  $id: string;
  accessoryId: string;
  type: string; // button, border, pad, chain, lining, zipper, etc.
  description: string;
  unit: 'piece' | 'meter' | 'set';
  quantityInStock: number;
  quantityUsed: number;
  purchaseRate: number;
  sellingRate: number;
  supplier: string;
  remarks: string;
  $createdAt: string;
}

// Initial values for forms
export const initialStitchingOrderItem: StitchingOrderItem = {
  itemType: '',
  description: '',
  quantity: 1,
  stitchingPrice: 0,
  asterRequired: false,
  asterType: null,
  asterCharge: 0,
  pieceGiven: false,
  fabric: {
    source: 'customer',
    fabricId: null,
    fabricDescription: '',
    metersUsed: 0,
    ratePerMeter: 0,
    fabricCost: 0,
  },
  additionalCharges: [],
  accessories: [],
};

export const initialStitchingOrderFormData: StitchingOrderFormData = {
  orderNo: '',
  customerName: '',
  customerPhone: '',
  orderDate: new Date().toISOString().split('T')[0],
  promiseDate: '',
  totalAmount: 0,
  amountPaid: 0,
  status: 'pending',
  tailorRemarks: '',
  items: [initialStitchingOrderItem],
  paymentHistory: [],
};
