import { Client, Databases, ID, Storage, Query } from "appwrite";
import conf from "../conf/conf";
import { use } from "react";

export class Service {
  client = new Client();
  databases;
  bucket; //storage

  constructor() {
    this.client
      .setEndpoint(conf.appwrite.url)
      .setProject(conf.appwrite.projectId);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  async createPost({ title, slug, content, featuredImage, status, userId }) {
    try {
      const post = await this.databases.createDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionId,
        slug,
        {
          title,
          content,
          featuredImage,
          status,
          userId,
        }
      );
      return post;
    } catch (error) {
      console.log("Error creating post:", error);
      throw error;
    }
  }

  async updatePost(slug, { title, content, featuredImage, status }) {
    try {
      const post = await this.databases.updateDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionId,
        slug,
        {
          title,
          content,
          featuredImage,
          status,
        }
      );
      return post;
    } catch (error) {
      console.log("Error updating post:", error);
      throw error;
    }
  }

  async deletePost(slug) {
    try {
      const response = await this.databases.deleteDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionId,
        slug
      );
      return true;
    } catch (error) {
      console.log("Error deleting post:", error);
      return false;
    }
  }

  async getPost(slug) {
    try {
      const post = await this.databases.getDocument(
        conf.appwrite.databaseId,
        conf.appwrite.collectionId,
        slug
      );
      return post;
    } catch (error) {
      console.log("Error fetching post:", error);
      return false;
    }
  }

  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      const posts = await this.databases.listDocuments(
        conf.appwrite.databaseId,
        conf.appwrite.collectionId,
        queries
      );
      return posts;
    } catch (error) {
      console.log("Error fetching posts:", error);
      return false;
    }
  }

  //file upload service
  async uploadFile(file) {
    try {
      const response = await this.bucket.createFile(
        conf.appwrite.bucketId,
        ID.unique(),
        file
      );
      return response;
    } catch (error) {
      console.log("Error uploading file:", error);
      return false;
    }
  }
  async deleteFile(fileId) {
    try {
      const response = await this.bucket.deleteFile(
        conf.appwrite.bucketId,
        fileId
      );
      return true;
    } catch (error) {
      console.log("Error deleting file:", error);
      return false;
    }
  }

  async getFilePreview(fileId) {
    try {
      const response = await this.bucket.getFilePreview(
        conf.appwrite.bucketId,
        fileId
      );
      return response;
    } catch (error) {
      console.log("Error getting file preview:", error);
      return false;
    }
  }
}

const service = new Service();
export default service;
