import { createServer } from "http";
import express from "express";
import cookieParser from "cookie-parser";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// FIXED IMPORTS: Added ".js" extension for ESM compatibility
import { registerRoutes } from "../backend/src/routes.js";
import { serveStatic } from "../backend/src/static.js";

let app: any = null;

async function getApp() {
  if (app) return app;

  const appInstance = express();

  appInstance.use(express.json());
  appInstance.use(express.urlencoded({ extended: false }));
  appInstance.use(cookieParser());

  // CORS Configuration
  appInstance.use((req: any, res: any, next: any) => {
    const allowedOrigin = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "*";
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  const httpServer = createServer(appInstance);

  try {
    // Pass the appInstance to routes
    await registerRoutes(httpServer, appInstance);
    // Serve static files if needed (though Vercel handles this usually)
    serveStatic(appInstance);
  } catch (err) {
    console.error("Failed to initialize backend:", err);
  }

  app = appInstance;
  return app;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const appInstance = await getApp();
    return appInstance(req as any, res as any);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};