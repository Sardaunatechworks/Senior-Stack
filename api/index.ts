import { createServer } from "http";
import express from "express";
import cookieParser from "cookie-parser";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// ✅ STATIC IMPORTS: Vercel can now see and bundle these files automatically
// We point to the source files (.ts) or their JS equivalents if checking locally
// The .js extension is required for ESM compatibility
import { registerRoutes } from "../backend/src/routes.js"; 
import { serveStatic } from "../backend/src/static.js"; 

// api/index.ts

// ... imports remain the same ...

const app = express();

// ✅ FIX 1: Trust Vercel's Proxy (Crucial for Cookies)
app.set("trust proxy", 1); 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ✅ FIX 2: Dynamic CORS (Allows Cookies from ANY of your Vercel domains)
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ... rest of the file (createServer, registerRoutes, etc.) ...
const httpServer = createServer(app);

// Initialize Routes
// We wrap this in a promise to handle async registration if needed
const initPromise = registerRoutes(httpServer, app).then(() => {
    // Only serve static files if we aren't in a serverless API-only mode
    // but for this setup, we keep it to maintain compatibility
    serveStatic(app);
}).catch(err => {
    console.error("Failed to register routes:", err);
});

export default async (req: VercelRequest, res: VercelResponse) => {
  // Ensure routes are registered before handling request
  await initPromise;
  
  // Forward request to Express
  return app(req as any, res as any);
};