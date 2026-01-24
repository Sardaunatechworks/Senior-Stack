import { createServer } from "http";
import express from "express";
import cookieParser from "cookie-parser";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// STATIC IMPORTS (Fixes the "Module Not Found" error)
import { registerRoutes } from "../backend/src/routes";
import { serveStatic } from "../backend/src/static";

let app: any = null;

async function getApp() {
  // Return cached app if it exists (prevents cold start delays)
  if (app) return app;

  const appInstance = express();

  appInstance.use(express.json());
  appInstance.use(express.urlencoded({ extended: false }));
  appInstance.use(cookieParser());

  // Fix CORS for Vercel
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

  // Register routes and static files
  try {
    await registerRoutes(httpServer, appInstance);
    serveStatic(appInstance);
  } catch (err) {
    console.error("Failed to register routes:", err);
  }

  app = appInstance;
  return app;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const appInstance = await getApp();
    return appInstance(req as any, res as any);
  } catch (error) {
    console.error("API Integration Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};