import { Client, Databases, ID, Storage, Query } from 'appwrite';
import conf from '../conf/conf';
import type { Customer, Item, Order } from '../types';

export class Service {
  client = new Client();
  databases: Databases;
  storage: Storage;

  constructor() {
    this.client.setEndpoint(conf.appwrite.url).setProject(conf.appwrite.projectId);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
  }

  // Customer operations
  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    try {
      const res = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.customers,
        [Query.equal('phone', phone)]
      );
      console.log('Response from Appwrite:', res);
      return res?.documents?.length ? (res.documents[0] as any) : null;
    } catch (error: any) {
      console.log('Error fetching customer by phone:', error);
      console.log('Error details:', error.message, error.code);
      throw error;
    }
  }

  async createCustomer(customer: Omit<Customer, '$id' | '$createdAt' | '$updatedAt'>) {
    try {
      return await this.databases.createDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.customers,
        ID.unique(),
        customer
      );
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Item operations
  async getItems(soldStatus?: boolean): Promise<Item[]> {
    try {
      const queries = soldStatus !== undefined ? [Query.equal('sold', soldStatus)] : [];

      const res = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.items,
        queries
      );
      return res.documents as any[];
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  async getItemById(itemId: string): Promise<Item | null> {
    try {
      const res = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.items,
        [Query.equal('itemId', itemId)]
      );
      return res.documents.length ? (res.documents[0] as any) : null;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  }

  async createItem(item: Omit<Item, '$id' | '$createdAt' | '$updatedAt'>) {
    try {
      return await this.databases.createDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.items,
        ID.unique(),
        item
      );
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  async updateItemSoldStatus(documentId: string, sold: boolean, sellingPrice?: number) {
    try {
      const updates: any = { sold };

      if (sellingPrice !== undefined) {
        updates.defaultSellingPrice = sellingPrice;
      }

      return await this.databases.updateDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.items,
        documentId,
        updates
      );
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async updateItemWithSaleDetails(documentId: string, sellingPrice: number) {
    try {
      return await this.databases.updateDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.items,
        documentId,
        {
          sold: true,
          defaultSellingPrice: sellingPrice,
        }
      );
    } catch (error) {
      console.error('Error updating item with sale details:', error);
      throw error;
    }
  }

  // Order operations
  async createOrder(order: Omit<Order, '$id' | '$createdAt' | '$updatedAt'>) {
    try {
      return await this.databases.createDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.orders,
        ID.unique(),
        order
      );
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrdersByCustomer(customerPhone: string): Promise<Order[]> {
    try {
      const res = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.orders,
        [Query.equal('customerPhone', customerPhone)]
      );
      return res.documents as any[];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getAllOrders(limit: number = 100): Promise<Order[]> {
    try {
      const res = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.orders,
        [Query.limit(limit), Query.orderDesc('saleDate')]
      );
      return res.documents as any[];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getNextBillNumber(): Promise<number> {
    try {
      const res = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.orders,
        [Query.limit(1), Query.orderDesc('billNo')]
      );
      if (res.documents.length > 0) {
        const lastOrder = res.documents[0] as any;
        return (lastOrder.billNo || 0) + 1;
      }
      return 1; // First bill number
    } catch (error) {
      console.error('Error fetching next bill number:', error);
      return 1; // Default to 1 if error
    }
  }

  async getOrderByBillNo(billNo: number): Promise<Order | null> {
    try {
      const res = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.orders,
        [Query.equal('billNo', billNo)]
      );
      return res.documents.length > 0 ? (res.documents[0] as any) : null;
    } catch (error) {
      console.error('Error fetching order by bill number:', error);
      throw error;
    }
  }

  async updateOrder(
    documentId: string,
    updates: Partial<Omit<Order, '$id' | '$createdAt' | '$updatedAt'>>
  ) {
    try {
      return await this.databases.updateDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.orders,
        documentId,
        updates
      );
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Stitching Orders operations
  async getStitchingOrders(): Promise<any[]> {
    try {
      const res = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.stitchingOrders,
        [Query.orderDesc('$createdAt'), Query.limit(100)]
      );
      return res.documents;
    } catch (error) {
      console.error('Error fetching stitching orders:', error);
      throw error;
    }
  }

  async getStitchingOrderById(id: string): Promise<any> {
    try {
      return await this.databases.getDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.stitchingOrders,
        id
      );
    } catch (error) {
      console.error('Error fetching stitching order:', error);
      throw error;
    }
  }

  async createStitchingOrder(order: any) {
    try {
      return await this.databases.createDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.stitchingOrders,
        ID.unique(),
        order
      );
    } catch (error) {
      console.error('Error creating stitching order:', error);
      throw error;
    }
  }

  async updateStitchingOrder(documentId: string, updates: any) {
    try {
      return await this.databases.updateDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.stitchingOrders,
        documentId,
        updates
      );
    } catch (error) {
      console.error('Error updating stitching order:', error);
      throw error;
    }
  }

  // Fabric Inventory operations
  async getFabricInventory(): Promise<any[]> {
    try {
      const res = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.fabricInventory,
        [Query.orderDesc('$createdAt'), Query.limit(100)]
      );
      return res.documents;
    } catch (error) {
      console.error('Error fetching fabric inventory:', error);
      throw error;
    }
  }

  async getFabrics(): Promise<any[]> {
    return this.getFabricInventory();
  }

  async getFabricById(fabricId: string): Promise<any | null> {
    try {
      const res = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.fabricInventory,
        [Query.equal('fabricId', fabricId)]
      );
      return res?.documents?.length ? res.documents[0] : null;
    } catch (error) {
      console.error('Error fetching fabric by ID:', error);
      throw error;
    }
  }

  async createFabric(fabric: any) {
    try {
      return await this.databases.createDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.fabricInventory,
        ID.unique(),
        fabric
      );
    } catch (error) {
      console.error('Error creating fabric:', error);
      throw error;
    }
  }

  async updateFabric(documentId: string, updates: any) {
    try {
      return await this.databases.updateDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.fabricInventory,
        documentId,
        updates
      );
    } catch (error) {
      console.error('Error updating fabric:', error);
      throw error;
    }
  }

  // Accessory Inventory operations
  async getAccessoryInventory(): Promise<any[]> {
    try {
      const res = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.accessoryInventory,
        [Query.orderDesc('$createdAt'), Query.limit(100)]
      );
      return res.documents;
    } catch (error) {
      console.error('Error fetching accessory inventory:', error);
      throw error;
    }
  }

  async getAccessories(): Promise<any[]> {
    return this.getAccessoryInventory();
  }

  async getAccessoryById(accessoryId: string): Promise<any | null> {
    try {
      const res = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.accessoryInventory,
        [Query.equal('accessoryId', accessoryId)]
      );
      return res?.documents?.length ? res.documents[0] : null;
    } catch (error) {
      console.error('Error fetching accessory by ID:', error);
      throw error;
    }
  }

  async createAccessory(accessory: any) {
    try {
      return await this.databases.createDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.accessoryInventory,
        ID.unique(),
        accessory
      );
    } catch (error) {
      console.error('Error creating accessory:', error);
      throw error;
    }
  }

  async updateAccessory(documentId: string, updates: any) {
    try {
      return await this.databases.updateDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.accessoryInventory,
        documentId,
        updates
      );
    } catch (error) {
      console.error('Error updating accessory:', error);
      throw error;
    }
  }

  // Update customer with measurements
  async updateCustomer(documentId: string, updates: any) {
    try {
      return await this.databases.updateDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.customers,
        documentId,
        updates
      );
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Update or create customer measurements
  async updateCustomerMeasurements(phone: string, name: string, measurements: string) {
    try {
      const existingCustomer = await this.getCustomerByPhone(phone);

      if (existingCustomer && existingCustomer.$id) {
        // Update existing customer
        return await this.updateCustomer(existingCustomer.$id, {
          measurements,
        });
      } else {
        // Create new customer with measurements
        return await this.createCustomer({
          phone,
          name,
          measurements,
        });
      }
    } catch (error) {
      console.error('Error updating customer measurements:', error);
      throw error;
    }
  }
}

const service = new Service();
export default service;
