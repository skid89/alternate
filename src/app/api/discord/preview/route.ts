import { NextResponse } from "next/server";
import { fetchDiscordPresence } from "@/lib/discord";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = process.env.DEMO_DISCORD_USER_ID;

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "DEMO_DISCORD_USER_ID is not configured" },
      { status: 503 }
    );
  }

  try {
    const presence = await fetchDiscordPresence(userId);

    if (!presence) {
      return NextResponse.json(
        { success: false, error: "Could not fetch Discord presence. Is Lanyard enabled for this user?" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, presence });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
