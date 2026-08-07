import fs from "fs/promises";
import path from "path";
import os from "os";
import { FullProfileConfig } from "@/types/profile";
import { DEFAULT_PROFILE_CONFIG } from "./defaultConfig";
import { Pool } from "pg";

export interface UserAccount {
  username: string;
  password?: string;
  role: "Owner" | "Admin" | "Moderator" | "Staff" | "Alpha" | "Beta" | "Premium" | "User";
  config: FullProfileConfig;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface DatabaseSchema {
  users: UserAccount[];
  maintenanceMode: boolean;
  announcement: string;
  reservedNames: string[];
  auditLogs: AuditLog[];
}

// Persistent locally, but falls back to temporary directory on Serverless hosts (e.g. Vercel) where filesystem is read-only
const isServerless = process.env.VERCEL || process.env.LAMBDA_TASK_ROOT || process.env.AWS_EXECUTION_ENV;
const DB_FILE = isServerless 
  ? path.join(os.tmpdir(), "alternate_db.json")
  : path.join(process.cwd(), "data", "alternate_db.json");

// PostgreSQL connection pool (instantiated only if URL is provided)
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
let pool: Pool | null = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for many hosting services like Supabase/Railway/Vercel
    }
  });
}

const adminUser = process.env.ADMIN_USERNAME || "koni";
const adminPass = process.env.ADMIN_PASSWORD || "password123";

const initialData: DatabaseSchema = {
  users: [
    {
      username: adminUser.toLowerCase(),
      password: adminPass,
      role: "Owner",
      config: DEFAULT_PROFILE_CONFIG,
    },
    {
      username: "zuka",
      password: "password123",
      role: "Admin",
      config: {
        ...DEFAULT_PROFILE_CONFIG,
        username: "zuka",
        bio: "alternate.lol admin. link reserved.",
      },
    },
  ],
  maintenanceMode: false,
  announcement: "Welcome to alternate.lol private linker platform!",
  reservedNames: ["admin", "system", "alternate", "login", "dashboard", "owner"],
  auditLogs: [
    {
      id: "1",
      action: "System Init",
      details: "alternate.lol system started successfully.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ],
};

async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {}
}

// PostgreSQL Initializer / Migrator
async function initPostgres(clientPool: Pool): Promise<void> {
  const client = await clientPool.connect();
  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(255) PRIMARY KEY,
        password VARCHAR(255),
        role VARCHAR(50),
        config JSONB
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB
      );
    `);

    // Seed default settings if empty
    const checkSettings = await client.query("SELECT COUNT(*) FROM settings");
    if (parseInt(checkSettings.rows[0].count) === 0) {
      await client.query("INSERT INTO settings (key, value) VALUES ($1, $2)", ["maintenanceMode", JSON.stringify(initialData.maintenanceMode)]);
      await client.query("INSERT INTO settings (key, value) VALUES ($1, $2)", ["announcement", JSON.stringify(initialData.announcement)]);
      await client.query("INSERT INTO settings (key, value) VALUES ($1, $2)", ["reservedNames", JSON.stringify(initialData.reservedNames)]);
      await client.query("INSERT INTO settings (key, value) VALUES ($1, $2)", ["auditLogs", JSON.stringify(initialData.auditLogs)]);
    }

    // Seed default users if empty
    const checkUsers = await client.query("SELECT COUNT(*) FROM users");
    if (parseInt(checkUsers.rows[0].count) === 0) {
      for (const u of initialData.users) {
        await client.query(
          "INSERT INTO users (username, password, role, config) VALUES ($1, $2, $3, $4)",
          [u.username, u.password || "password123", u.role, JSON.stringify(u.config)]
        );
      }
    }
  } finally {
    client.release();
  }
}

export async function readDb(): Promise<DatabaseSchema> {
  if (pool) {
    try {
      await initPostgres(pool);
      const userRes = await pool.query("SELECT username, password, role, config FROM users");
      const settingsRes = await pool.query("SELECT key, value FROM settings");

      const dbUsers: UserAccount[] = userRes.rows.map(row => ({
        username: row.username,
        password: row.password,
        role: row.role as any,
        config: row.config
      }));

      const settingsMap = new Map<string, any>();
      settingsRes.rows.forEach(row => {
        settingsMap.set(row.key, row.value);
      });

      return {
        users: dbUsers,
        maintenanceMode: settingsMap.get("maintenanceMode") ?? false,
        announcement: settingsMap.get("announcement") ?? "",
        reservedNames: settingsMap.get("reservedNames") ?? [],
        auditLogs: settingsMap.get("auditLogs") ?? []
      };
    } catch (err) {
      console.error("Postgres read failed, falling back to local file", err);
    }
  }

  // Local JSON File Fallback
  await ensureDir(DB_FILE);
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  if (pool) {
    try {
      await initPostgres(pool);
      // Update Settings
      await pool.query("INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2", ["maintenanceMode", JSON.stringify(data.maintenanceMode)]);
      await pool.query("INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2", ["announcement", JSON.stringify(data.announcement)]);
      await pool.query("INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2", ["reservedNames", JSON.stringify(data.reservedNames)]);
      await pool.query("INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2", ["auditLogs", JSON.stringify(data.auditLogs)]);

      // Sync Users table
      // To keep things simple and secure, we clear and re-insert or perform upserts.
      // Upserting users:
      for (const u of data.users) {
        await pool.query(
          "INSERT INTO users (username, password, role, config) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO UPDATE SET password = $2, role = $3, config = $4",
          [u.username, u.password || "password123", u.role, JSON.stringify(u.config)]
        );
      }

      // Delete users in database that are no longer in the array
      const currentUsernames = data.users.map(u => u.username);
      if (currentUsernames.length > 0) {
        await pool.query("DELETE FROM users WHERE NOT (username = ANY($1))", [currentUsernames]);
      } else {
        await pool.query("DELETE FROM users");
      }
      return;
    } catch (err) {
      console.error("Postgres write failed, falling back to local file", err);
    }
  }

  // Local JSON File Fallback
  await ensureDir(DB_FILE);
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}
