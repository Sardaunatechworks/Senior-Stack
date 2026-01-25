import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../shared/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

// 1. VALIDATE DATABASE_URL EXISTS
if (!DATABASE_URL) {
  console.error("❌ FATAL: DATABASE_URL environment variable is not set");
  console.error("Please set DATABASE_URL in your .env file");
  console.error("Format: postgresql://user:password@host:port/database");
  process.exit(1);
}

// 2. VALIDATE DATABASE_URL FORMAT
if (!DATABASE_URL.startsWith("postgresql://") && !DATABASE_URL.startsWith("postgres://")) {
  console.error("❌ FATAL: Invalid DATABASE_URL format");
  console.error("Must start with 'postgresql://' or 'postgres://'");
  console.error("Received:", DATABASE_URL.substring(0, 50) + "...");
  process.exit(1);
}

// 3. CREATE POOL WITH PRODUCTION CONFIG
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false // Required for Supabase
  },
  max: 20, // Max pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 4. ERROR HANDLER FOR POOL
pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
  process.exit(1);
});

// 5. SYNCHRONOUS CONNECTION VALIDATION
export async function validateDatabaseConnection(): Promise<void> {
  try {
    console.log("📡 Validating Supabase connection...");
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("✅ Supabase connected successfully at:", result.rows[0].now);
  } catch (err: any) {
    console.error("❌ FATAL: Database connection failed");
    console.error("Error:", err.message);
    
    // Detailed error diagnosis
    if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
      console.error("📍 Cause: Network/DNS error - cannot reach database host");
      console.error("   - Check if DATABASE_URL hostname is correct");
      console.error("   - Check network connectivity");
      console.error("   - Check firewall/router settings");
    } else if (err.code === "EACCES") {
      console.error("📍 Cause: Authentication error - invalid credentials");
      console.error("   - Check username and password in DATABASE_URL");
    } else if (err.code === "ENOTFOUND") {
      console.error("📍 Cause: DNS resolution failed");
      console.error("   - Check if hostname is correct");
    } else if (err.message.includes("SSL")) {
      console.error("📍 Cause: SSL certificate error");
      console.error("   - Verify SSL configuration");
    }
    
    process.exit(1);
  }
}

// 6. INITIALIZE DRIZZLE ORM
export const db = drizzle(pool, { schema });

console.log("📦 Database module loaded. Waiting for connection validation...");

