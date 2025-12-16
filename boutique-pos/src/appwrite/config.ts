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

  async updateItemSoldStatus(documentId: string, sold: boolean) {
    try {
      return await this.databases.updateDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionIds.items,
        documentId,
        { sold }
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
}

const service = new Service();
export default service;
