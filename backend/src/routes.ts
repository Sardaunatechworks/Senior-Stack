import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { api } from "../../shared/routes.js";
import { insertUserSchema } from "../../shared/schema.js";
import { setupAuth } from "./auth.js";
import { sendAdminNotification } from "./email.js";

// ... rest of your file code ...
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 1. Setup Authentication (Passport / Session)
  // This usually handles /api/login, /api/logout, /api/user
  setupAuth(app);

  // 2. Explicitly Define /api/register (The 404 Fix)
  // We define this manually to ensure it exists in Production
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate input
      const data = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existing = await storage.getUserByUsername(data.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create user (hashing is handled by storage or we do it here)
      // Assuming storage.createUser expects a hashed password if not handled internally:
      // But looking at your previous code, you hashed it manually.
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
        role: data.role || "reporter"
      });

      // Login the user immediately after registration
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return safe user object (no password)
        const { password, ...safeUser } = user as any;
        res.status(201).json(safeUser);
      });

    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        console.error("Registration error:", e);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // 3. Reports API (Your existing logic)
  
  // GET /api/reports
  app.get(api.reports.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    if (req.user!.role === 'admin') {
      const filter: any = {};
      if (req.query.status) filter.status = req.query.status as string;
      if (req.query.category) filter.category = req.query.category as string;
      const reports = await storage.getReports(filter);
      return res.json(reports);
    } else {
      const reports = await storage.getReportsByReporter(req.user!.id);
      return res.json(reports);
    }
  });

  // POST /api/reports
  app.post(api.reports.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const data = api.reports.create.input.parse(req.body);
      const report = await storage.createReport({
        ...data,
        reporterId: req.user!.id,
      });

      // Non-blocking email
      sendAdminNotification(report, req.user!.username).catch(err => console.error(err));
      
      res.status(201).json(report);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.status(500).json({ message: "Failed to create report" });
      }
    }
  });

  // GET /api/reports/:id
  app.get(api.reports.get.path, async (req, res) => {
     if (!req.isAuthenticated()) return res.sendStatus(401);
     const id = parseInt(req.params.id);
     const report = await storage.getReport(id);
     if (!report) return res.sendStatus(404);
     
     if (req.user!.role !== 'admin' && report.reporterId !== req.user!.id) {
       return res.sendStatus(403);
     }
     res.json(report);
  });

  // PATCH /api/reports/:id/status
  app.patch(api.reports.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== 'admin') return res.sendStatus(403);
    
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const updated = await storage.updateReportStatus(id, status);
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  });

  // DELETE /api/reports/:id
  app.delete(api.reports.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== 'admin') return res.sendStatus(403);
    
    const id = parseInt(req.params.id);
    await storage.deleteReport(id);
    res.sendStatus(200);
  });

  // Users API
  app.get(api.users.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== 'admin') return res.sendStatus(403);
    const users = await storage.getAllUsers();
    res.json(users);
  });

  return httpServer;
}