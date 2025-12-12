const conf = {
  appwrite: {
    url: String(import.meta.env.VITE_APPWRITE_URL),
    projectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    databaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    collectionIds: {
      items: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID_Items),
      orders: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID_ORDERS),
      customers: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID_CUSTOMERS)
    }
  }
};

export default conf;