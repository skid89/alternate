import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, UserAccount } from "@/utils/db";
import { cookies } from "next/headers";
import { DEFAULT_PROFILE_CONFIG } from "@/utils/defaultConfig";

export async function GET() {
  const cookieStore = await cookies();
  const sessionUser = cookieStore.get("session_user")?.value;

  if (!sessionUser) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const db = await readDb();
  const user = db.users.find((u) => u.username === sessionUser);

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: user.username,
      role: user.role,
      config: user.config,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { action, username, password, role } = await req.json();

    const formattedUsername = username?.trim().toLowerCase();
    if (!formattedUsername) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const db = await readDb();

    if (action === "register") {
      // Check if user exists or is reserved
      if (db.users.some((u) => u.username === formattedUsername) || db.reservedNames.includes(formattedUsername)) {
        return NextResponse.json({ error: "Username already exists or is reserved." }, { status: 400 });
      }

      const newUser: UserAccount = {
        username: formattedUsername,
        password: password || "password123",
        role: role || "User",
        config: {
          ...DEFAULT_PROFILE_CONFIG,
          username: formattedUsername,
          bio: `Hello! I am a proud ${role || "User"} of alternate.lol`,
        },
      };

      db.users.push(newUser);
      
      // Add audit log
      db.auditLogs.unshift({
        id: Math.random().toString(),
        action: "Register User",
        details: `Registered user ${formattedUsername} with role ${role || "User"}.`,
        timestamp: new Date().toLocaleTimeString(),
      });

      await writeDb(db);

      const cookieStore = await cookies();
      cookieStore.set("session_user", formattedUsername, { httpOnly: true, path: "/" });

      return NextResponse.json({
        success: true,
        user: { username: newUser.username, role: newUser.role, config: newUser.config },
      });
    } else {
      // Login
      const user = db.users.find((u) => u.username === formattedUsername);
      if (!user) {
        // If user doesn't exist, we can register them automatically on demand
        // or return error. Let's return error to follow standard flow.
        return NextResponse.json({ error: "User not found. Claim your slot!" }, { status: 404 });
      }

      // In mock login, if password is provided, we check it (or just let it pass if empty for ease)
      if (password && user.password && user.password !== password) {
        return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
      }

      db.auditLogs.unshift({
        id: Math.random().toString(),
        action: "User Login",
        details: `User ${formattedUsername} logged in successfully.`,
        timestamp: new Date().toLocaleTimeString(),
      });
      await writeDb(db);

      const cookieStore = await cookies();
      cookieStore.set("session_user", formattedUsername, { httpOnly: true, path: "/" });

      return NextResponse.json({
        success: true,
        user: { username: user.username, role: user.role, config: user.config },
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const sessionUser = cookieStore.get("session_user")?.value;

  if (sessionUser) {
    const db = await readDb();
    db.auditLogs.unshift({
      id: Math.random().toString(),
      action: "User Logout",
      details: `User ${sessionUser} logged out.`,
      timestamp: new Date().toLocaleTimeString(),
    });
    await writeDb(db);
  }

  cookieStore.delete("session_user");
  return NextResponse.json({ success: true });
}
