import fs from "fs/promises";
import path from "path";
import { FullProfileConfig } from "@/types/profile";
import { DEFAULT_PROFILE_CONFIG } from "./defaultConfig";

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

const DB_FILE = path.join(process.cwd(), "src", "data", "db.json");

async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {}
}

const initialData: DatabaseSchema = {
  users: [
    {
      username: "koni",
      password: "password123",
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

export async function readDb(): Promise<DatabaseSchema> {
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
  await ensureDir(DB_FILE);
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}
