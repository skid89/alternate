import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/utils/db";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, props: { params: Promise<{ username: string }> }) {
  try {
    const params = await props.params;
    const username = params.username.toLowerCase();
    const db = await readDb();

    // Check maintenance mode
    const cookieStore = await cookies();
    const sessionUser = cookieStore.get("session_user")?.value;
    const currentUser = db.users.find((u) => u.username === sessionUser);
    const isBypassed = currentUser && (currentUser.role === "Owner" || currentUser.role === "Admin");

    if (db.maintenanceMode && !isBypassed) {
      return NextResponse.json({ error: "Platform is under maintenance." }, { status: 503 });
    }

    const user = db.users.find((u) => u.username === username);
    if (!user) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      username: user.username,
      role: user.role,
      config: user.config,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ username: string }> }) {
  try {
    const params = await props.params;
    const username = params.username.toLowerCase();
    const cookieStore = await cookies();
    const sessionUser = cookieStore.get("session_user")?.value;

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await readDb();
    const currentUser = db.users.find((u) => u.username === sessionUser);

    // Only allow self update, or Owner/Admin updates
    const isAllowed = sessionUser === username || (currentUser && (currentUser.role === "Owner" || currentUser.role === "Admin"));
    if (!isAllowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUserIndex = db.users.findIndex((u) => u.username === username);
    if (targetUserIndex === -1) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const { config } = await req.json();
    if (!config) {
      return NextResponse.json({ error: "Missing configuration" }, { status: 400 });
    }

    // Preserve username field
    config.username = username;

    db.users[targetUserIndex].config = config;

    db.auditLogs.unshift({
      id: Math.random().toString(),
      action: "Update Profile",
      details: `Updated profile config for ${username}.`,
      timestamp: new Date().toLocaleTimeString(),
    });

    await writeDb(db);

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
