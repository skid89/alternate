import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/utils/db";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  const sessionUser = cookieStore.get("session_user")?.value;
  if (!sessionUser) return false;

  const db = await readDb();
  const user = db.users.find((u) => u.username === sessionUser);
  return user && (user.role === "Owner" || user.role === "Admin");
}

export async function GET() {
  try {
    const db = await readDb();

    // Only return users list if admin to protect data, or return redacted
    const cleanUsers = db.users.map(u => ({
      username: u.username,
      role: u.role
    }));

    return NextResponse.json({
      maintenanceMode: db.maintenanceMode,
      announcement: db.announcement,
      reservedNames: db.reservedNames,
      auditLogs: db.auditLogs,
      users: cleanUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, value, username, role } = await req.json();
    const db = await readDb();

    if (action === "setMaintenanceMode") {
      db.maintenanceMode = !!value;
      db.auditLogs.unshift({
        id: Math.random().toString(),
        action: "Toggle Maintenance",
        details: `Maintenance mode set to ${db.maintenanceMode}`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } else if (action === "setAnnouncement") {
      db.announcement = String(value);
      db.auditLogs.unshift({
        id: Math.random().toString(),
        action: "Update Announcement",
        details: `Announcement updated to: "${db.announcement}"`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } else if (action === "deleteUser") {
      db.users = db.users.filter(u => u.username !== username);
      db.auditLogs.unshift({
        id: Math.random().toString(),
        action: "Delete User",
        details: `Deleted user ${username}`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } else if (action === "updateUserRole") {
      const idx = db.users.findIndex(u => u.username === username);
      if (idx !== -1) {
        db.users[idx].role = role;
        db.auditLogs.unshift({
          id: Math.random().toString(),
          action: "Update Role",
          details: `Updated role of ${username} to ${role}`,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } else if (action === "addReservedName") {
      const name = String(value).trim().toLowerCase();
      if (name && !db.reservedNames.includes(name)) {
        db.reservedNames.push(name);
        db.auditLogs.unshift({
          id: Math.random().toString(),
          action: "Reserve Username",
          details: `Added '${name}' to reserved names.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } else if (action === "removeReservedName") {
      const name = String(value);
      db.reservedNames = db.reservedNames.filter(n => n !== name);
      db.auditLogs.unshift({
        id: Math.random().toString(),
        action: "Release Username",
        details: `Removed '${name}' from reserved names.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    await writeDb(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
