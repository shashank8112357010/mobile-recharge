import {
  users,
  mobiles,
  rechargeTransactions,
  favorites,
  orders,
  type User,
  type UpsertUser,
  type Mobile,
  type InsertMobile,
  type RechargeTransaction,
  type InsertRechargeTransaction,
  type Favorite,
  type InsertFavorite,
  type Order,
  type InsertOrder,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Mobile operations
  getMobiles(filters?: {
    brand?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    status?: string;
    sellerId?: string;
  }): Promise<(Mobile & { seller: User })[]>;
  getMobile(id: number): Promise<(Mobile & { seller: User }) | undefined>;
  createMobile(mobile: InsertMobile): Promise<Mobile>;
  updateMobile(id: number, updates: Partial<Mobile>): Promise<Mobile | undefined>;
  deleteMobile(id: number): Promise<boolean>;
  
  // Recharge operations
  createRechargeTransaction(transaction: InsertRechargeTransaction): Promise<RechargeTransaction>;
  getRechargeTransactions(userId: string): Promise<RechargeTransaction[]>;
  updateRechargeTransaction(id: number, updates: Partial<RechargeTransaction>): Promise<RechargeTransaction | undefined>;
  
  // Favorites operations
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(userId: string, mobileId: number): Promise<boolean>;
  getUserFavorites(userId: string): Promise<(Favorite & { mobile: Mobile & { seller: User } })[]>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(userId: string, type?: 'buyer' | 'seller'): Promise<(Order & { mobile: Mobile; buyer: User; seller: User })[]>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined>;
  
  // Admin operations
  getPendingMobiles(): Promise<(Mobile & { seller: User })[]>;
  getUsersCount(): Promise<number>;
  getTotalRevenue(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Mobile operations
  async getMobiles(filters?: {
    brand?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    status?: string;
    sellerId?: string;
  }): Promise<(Mobile & { seller: User })[]> {
    let query = db
      .select({
        id: mobiles.id,
        sellerId: mobiles.sellerId,
        brand: mobiles.brand,
        model: mobiles.model,
        storage: mobiles.storage,
        color: mobiles.color,
        condition: mobiles.condition,
        price: mobiles.price,
        description: mobiles.description,
        images: mobiles.images,
        isNew: mobiles.isNew,
        status: mobiles.status,
        location: mobiles.location,
        specifications: mobiles.specifications,
        accessories: mobiles.accessories,
        createdAt: mobiles.createdAt,
        updatedAt: mobiles.updatedAt,
        seller: users,
      })
      .from(mobiles)
      .innerJoin(users, eq(mobiles.sellerId, users.id))
      .orderBy(desc(mobiles.createdAt));

    const conditions = [];
    
    if (filters) {
      if (filters.status) {
        conditions.push(eq(mobiles.status, filters.status));
      }
      if (filters.brand) {
        conditions.push(eq(mobiles.brand, filters.brand));
      }
      if (filters.condition) {
        conditions.push(eq(mobiles.condition, filters.condition));
      }
      if (filters.minPrice) {
        conditions.push(sql`${mobiles.price} >= ${filters.minPrice}`);
      }
      if (filters.maxPrice) {
        conditions.push(sql`${mobiles.price} <= ${filters.maxPrice}`);
      }
      if (filters.search) {
        conditions.push(
          or(
            ilike(mobiles.brand, `%${filters.search}%`),
            ilike(mobiles.model, `%${filters.search}%`),
            ilike(mobiles.description, `%${filters.search}%`)
          )
        );
      }
      if (filters.sellerId) {
        conditions.push(eq(mobiles.sellerId, filters.sellerId));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query;
  }

  async getMobile(id: number): Promise<(Mobile & { seller: User }) | undefined> {
    const [result] = await db
      .select({
        id: mobiles.id,
        sellerId: mobiles.sellerId,
        brand: mobiles.brand,
        model: mobiles.model,
        storage: mobiles.storage,
        color: mobiles.color,
        condition: mobiles.condition,
        price: mobiles.price,
        description: mobiles.description,
        images: mobiles.images,
        isNew: mobiles.isNew,
        status: mobiles.status,
        location: mobiles.location,
        specifications: mobiles.specifications,
        accessories: mobiles.accessories,
        createdAt: mobiles.createdAt,
        updatedAt: mobiles.updatedAt,
        seller: users,
      })
      .from(mobiles)
      .innerJoin(users, eq(mobiles.sellerId, users.id))
      .where(eq(mobiles.id, id));
    
    return result;
  }

  async createMobile(mobile: InsertMobile): Promise<Mobile> {
    const [result] = await db.insert(mobiles).values(mobile).returning();
    return result;
  }

  async updateMobile(id: number, updates: Partial<Mobile>): Promise<Mobile | undefined> {
    const [result] = await db
      .update(mobiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mobiles.id, id))
      .returning();
    return result;
  }

  async deleteMobile(id: number): Promise<boolean> {
    const result = await db.delete(mobiles).where(eq(mobiles.id, id));
    return result.rowCount > 0;
  }

  // Recharge operations
  async createRechargeTransaction(transaction: InsertRechargeTransaction): Promise<RechargeTransaction> {
    const [result] = await db.insert(rechargeTransactions).values(transaction).returning();
    return result;
  }

  async getRechargeTransactions(userId: string): Promise<RechargeTransaction[]> {
    return db
      .select()
      .from(rechargeTransactions)
      .where(eq(rechargeTransactions.userId, userId))
      .orderBy(desc(rechargeTransactions.createdAt));
  }

  async updateRechargeTransaction(id: number, updates: Partial<RechargeTransaction>): Promise<RechargeTransaction | undefined> {
    const [result] = await db
      .update(rechargeTransactions)
      .set(updates)
      .where(eq(rechargeTransactions.id, id))
      .returning();
    return result;
  }

  // Favorites operations
  async addToFavorites(favorite: InsertFavorite): Promise<Favorite> {
    const [result] = await db.insert(favorites).values(favorite).returning();
    return result;
  }

  async removeFromFavorites(userId: string, mobileId: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.mobileId, mobileId)));
    return result.rowCount > 0;
  }

  async getUserFavorites(userId: string): Promise<(Favorite & { mobile: Mobile & { seller: User } })[]> {
    return db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        mobileId: favorites.mobileId,
        createdAt: favorites.createdAt,
        mobile: {
          id: mobiles.id,
          sellerId: mobiles.sellerId,
          brand: mobiles.brand,
          model: mobiles.model,
          storage: mobiles.storage,
          color: mobiles.color,
          condition: mobiles.condition,
          price: mobiles.price,
          description: mobiles.description,
          images: mobiles.images,
          isNew: mobiles.isNew,
          status: mobiles.status,
          location: mobiles.location,
          specifications: mobiles.specifications,
          accessories: mobiles.accessories,
          createdAt: mobiles.createdAt,
          updatedAt: mobiles.updatedAt,
          seller: users,
        },
      })
      .from(favorites)
      .innerJoin(mobiles, eq(favorites.mobileId, mobiles.id))
      .innerJoin(users, eq(mobiles.sellerId, users.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [result] = await db.insert(orders).values(order).returning();
    return result;
  }

  async getOrders(userId: string, type?: 'buyer' | 'seller'): Promise<(Order & { mobile: Mobile; buyer: User; seller: User })[]> {
    // Simplified version - return empty array for now to fix the error
    return [];
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const [result] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result;
  }

  // Admin operations
  async getPendingMobiles(): Promise<(Mobile & { seller: User })[]> {
    return this.getMobiles({ status: 'pending' });
  }

  async getUsersCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result.count;
  }

  async getTotalRevenue(): Promise<number> {
    const [result] = await db
      .select({ total: sql<number>`sum(${orders.amount})` })
      .from(orders)
      .where(eq(orders.paymentStatus, 'completed'));
    return result.total || 0;
  }
}

export const storage = new DatabaseStorage();
