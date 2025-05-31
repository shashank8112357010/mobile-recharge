import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertMobileSchema, 
  insertRechargeTransactionSchema, 
  insertFavoriteSchema, 
  insertOrderSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Mobile routes
  app.get('/api/mobiles', async (req, res) => {
    try {
      const filters = {
        brand: req.query.brand as string,
        condition: req.query.condition as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        search: req.query.search as string,
        status: req.query.status as string || 'approved',
      };
      
      const mobiles = await storage.getMobiles(filters);
      res.json(mobiles);
    } catch (error) {
      console.error("Error fetching mobiles:", error);
      res.status(500).json({ message: "Failed to fetch mobiles" });
    }
  });

  app.get('/api/mobiles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mobile = await storage.getMobile(id);
      if (!mobile) {
        return res.status(404).json({ message: "Mobile not found" });
      }
      res.json(mobile);
    } catch (error) {
      console.error("Error fetching mobile:", error);
      res.status(500).json({ message: "Failed to fetch mobile" });
    }
  });

  app.post('/api/mobiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mobileData = insertMobileSchema.parse({
        ...req.body,
        sellerId: userId,
      });
      
      const mobile = await storage.createMobile(mobileData);
      res.status(201).json(mobile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid mobile data", errors: error.errors });
      }
      console.error("Error creating mobile:", error);
      res.status(500).json({ message: "Failed to create mobile listing" });
    }
  });

  app.put('/api/mobiles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns the mobile or is admin
      const existingMobile = await storage.getMobile(id);
      if (!existingMobile) {
        return res.status(404).json({ message: "Mobile not found" });
      }
      
      const user = await storage.getUser(userId);
      if (existingMobile.sellerId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this listing" });
      }
      
      const updatedMobile = await storage.updateMobile(id, req.body);
      res.json(updatedMobile);
    } catch (error) {
      console.error("Error updating mobile:", error);
      res.status(500).json({ message: "Failed to update mobile" });
    }
  });

  app.delete('/api/mobiles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns the mobile or is admin
      const existingMobile = await storage.getMobile(id);
      if (!existingMobile) {
        return res.status(404).json({ message: "Mobile not found" });
      }
      
      const user = await storage.getUser(userId);
      if (existingMobile.sellerId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this listing" });
      }
      
      const deleted = await storage.deleteMobile(id);
      if (deleted) {
        res.json({ message: "Mobile deleted successfully" });
      } else {
        res.status(404).json({ message: "Mobile not found" });
      }
    } catch (error) {
      console.error("Error deleting mobile:", error);
      res.status(500).json({ message: "Failed to delete mobile" });
    }
  });

  // User's mobiles
  app.get('/api/user/mobiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mobiles = await storage.getMobiles({ sellerId: userId });
      res.json(mobiles);
    } catch (error) {
      console.error("Error fetching user mobiles:", error);
      res.status(500).json({ message: "Failed to fetch user mobiles" });
    }
  });

  // Recharge routes
  app.post('/api/recharge', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionData = insertRechargeTransactionSchema.parse({
        ...req.body,
        userId,
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      });
      
      const transaction = await storage.createRechargeTransaction(transactionData);
      
      // In a real app, integrate with payment gateway here
      // For now, mark as success
      const updatedTransaction = await storage.updateRechargeTransaction(transaction.id, {
        status: 'success'
      });
      
      res.status(201).json(updatedTransaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recharge data", errors: error.errors });
      }
      console.error("Error processing recharge:", error);
      res.status(500).json({ message: "Failed to process recharge" });
    }
  });

  app.get('/api/recharge/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getRechargeTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching recharge history:", error);
      res.status(500).json({ message: "Failed to fetch recharge history" });
    }
  });

  // Favorites routes
  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId,
      });
      
      const favorite = await storage.addToFavorites(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid favorite data", errors: error.errors });
      }
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete('/api/favorites/:mobileId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mobileId = parseInt(req.params.mobileId);
      
      const removed = await storage.removeFromFavorites(userId, mobileId);
      if (removed) {
        res.json({ message: "Removed from favorites" });
      } else {
        res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        buyerId: userId,
      });
      
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const type = req.query.type as 'buyer' | 'seller' | undefined;
      const orders = await storage.getOrders(userId, type);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Admin routes
  app.get('/api/admin/pending-mobiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const pendingMobiles = await storage.getPendingMobiles();
      res.json(pendingMobiles);
    } catch (error) {
      console.error("Error fetching pending mobiles:", error);
      res.status(500).json({ message: "Failed to fetch pending mobiles" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const [usersCount, totalRevenue, pendingMobiles] = await Promise.all([
        storage.getUsersCount(),
        storage.getTotalRevenue(),
        storage.getPendingMobiles(),
      ]);
      
      res.json({
        usersCount,
        totalRevenue,
        pendingApprovalsCount: pendingMobiles.length,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.put('/api/admin/mobiles/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      const updatedMobile = await storage.updateMobile(id, { status: 'approved' });
      res.json(updatedMobile);
    } catch (error) {
      console.error("Error approving mobile:", error);
      res.status(500).json({ message: "Failed to approve mobile" });
    }
  });

  app.put('/api/admin/mobiles/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      const updatedMobile = await storage.updateMobile(id, { status: 'rejected' });
      res.json(updatedMobile);
    } catch (error) {
      console.error("Error rejecting mobile:", error);
      res.status(500).json({ message: "Failed to reject mobile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
