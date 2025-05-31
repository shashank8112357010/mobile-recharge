import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mobile listings table
export const mobiles = pgTable("mobiles", {
  id: serial("id").primaryKey(),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  brand: varchar("brand").notNull(),
  model: varchar("model").notNull(),
  storage: varchar("storage"), // e.g., "128GB", "256GB"
  color: varchar("color"),
  condition: varchar("condition").notNull(), // excellent, good, fair, poor
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  images: jsonb("images").default([]), // array of image URLs
  isNew: boolean("is_new").default(false),
  status: varchar("status").default("pending"), // pending, approved, rejected, sold
  location: varchar("location"),
  specifications: jsonb("specifications").default({}), // RAM, processor, etc.
  accessories: jsonb("accessories").default([]), // charger, box, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recharge transactions table
export const rechargeTransactions = pgTable("recharge_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  mobileNumber: varchar("mobile_number").notNull(),
  operator: varchar("operator").notNull(), // airtel, jio, vi, bsnl
  planType: varchar("plan_type").notNull(), // prepaid, postpaid, dth
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  planDetails: jsonb("plan_details"), // validity, data, etc.
  transactionId: varchar("transaction_id").unique(),
  status: varchar("status").default("pending"), // pending, success, failed
  paymentMethod: varchar("payment_method"), // upi, wallet, card
  createdAt: timestamp("created_at").defaultNow(),
});

// User favorites/wishlist
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  mobileId: integer("mobile_id").notNull().references(() => mobiles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders/purchases
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  mobileId: integer("mobile_id").notNull().references(() => mobiles.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, confirmed, shipped, delivered, cancelled
  paymentMethod: varchar("payment_method"),
  paymentStatus: varchar("payment_status").default("pending"),
  shippingAddress: jsonb("shipping_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  mobiles: many(mobiles),
  rechargeTransactions: many(rechargeTransactions),
  favorites: many(favorites),
  ordersAsBuyer: many(orders, { relationName: "buyer" }),
  ordersAsSeller: many(orders, { relationName: "seller" }),
}));

export const mobilesRelations = relations(mobiles, ({ one, many }) => ({
  seller: one(users, {
    fields: [mobiles.sellerId],
    references: [users.id],
  }),
  favorites: many(favorites),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
  mobile: one(mobiles, {
    fields: [orders.mobileId],
    references: [mobiles.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  mobile: one(mobiles, {
    fields: [favorites.mobileId],
    references: [mobiles.id],
  }),
}));

export const rechargeTransactionsRelations = relations(rechargeTransactions, ({ one }) => ({
  user: one(users, {
    fields: [rechargeTransactions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const upsertUserSchema = createInsertSchema(users);
export const insertMobileSchema = createInsertSchema(mobiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertRechargeTransactionSchema = createInsertSchema(rechargeTransactions).omit({
  id: true,
  createdAt: true,
});
export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});
export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMobile = z.infer<typeof insertMobileSchema>;
export type Mobile = typeof mobiles.$inferSelect;
export type InsertRechargeTransaction = z.infer<typeof insertRechargeTransactionSchema>;
export type RechargeTransaction = typeof rechargeTransactions.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
