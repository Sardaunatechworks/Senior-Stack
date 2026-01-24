import type { VercelRequest, VercelResponse } from "@vercel/node";

let app: any = null;

async function initializeApp() {
  if (app) return app;

  const express = await import("express");
  const cookieParser = await import("cookie-parser");
  const { registerRoutes } = await import("../backend/src/routes");
  const { serveStatic } = await import("../backend/src/static");
  const { createServer } = await import("http");

  const appInstance = express.default();

  appInstance.use(express.default.json());
  appInstance.use(express.default.urlencoded({ extended: false }));
  appInstance.use(cookieParser.default());

  // CORS headers for Vercel
  appInstance.use((req: any, res: any, next: any) => {
   // Ensure we add https:// if VERCEL_URL is present
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
    await registerRoutes(httpServer, appInstance);
  } catch (error: any) {
    console.error("Failed to initialize application:", error);
    throw error;
  }

  serveStatic(appInstance);

  app = appInstance;
  return app;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const appInstance = await initializeApp();
    return appInstance(req as any, res as any);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

