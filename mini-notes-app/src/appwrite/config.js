// src/appwrite/config.js
import { Client, Account, Databases, Storage, ID } from "appwrite";
import conf from "../conf/conf";

export class AppwriteService {
  client = new Client();
  account;
  databases;
  storage;

  constructor() {
    this.client
      .setEndpoint(conf.appwrite.url)
      .setProject(conf.appwrite.projectId);

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
  }

  // Example methods
  getCurrentUser = () => this.account.get();
  createAccount = (email, password, name) => {
    return this.account.create(ID.unique(), email, password, name);
  };

  login = (email, password) => {
    return this.account.createEmailSession(email, password);
  };
}

const appwrite = new AppwriteService();
export default appwrite;
