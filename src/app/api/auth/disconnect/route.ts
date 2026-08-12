import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAndGetSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAndGetSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform } = await req.json();

    if (!platform || !['discord', 'roblox'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform parameter' }, { status: 400 });
    }

    if (platform === 'discord') {
      await prisma.profile.update({
        where: { userId: session.userId },
        data: { 
          discordId: null,
          discordPresenceEnabled: false
        }
      });
      // Optionally delete discord social link
      await prisma.social.deleteMany({
        where: { 
          profile: { userId: session.userId },
          platform: 'discord'
        }
      });
    } else if (platform === 'roblox') {
      await prisma.profile.update({
        where: { userId: session.userId },
        data: { 
          robloxId: null,
          robloxPresenceEnabled: false
        }
      });
      // Optionally delete roblox social link
      await prisma.social.deleteMany({
        where: { 
          profile: { userId: session.userId },
          platform: 'roblox'
        }
      });
    }

    return NextResponse.json({ success: true, message: `Successfully unlinked ${platform}` });

  } catch (error) {
    console.error('Disconnection API error:', error);
    return NextResponse.json({ error: 'Failed to unlink account' }, { status: 500 });
  }
}
