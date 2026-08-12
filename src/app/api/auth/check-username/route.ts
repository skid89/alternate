import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';


const RESERVED_SLUGS = [
  'admin', 'api', 'status', 'leaderboard', 'dashboard', 'login', 'register', 
  'partners', 'pricing', 'auth', 'assets', 'uploads', 'settings', 'customize', 
  'premium', 'terms', 'privacy', 'index', 'home'
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Validate rules
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      return NextResponse.json({ 
        available: false, 
        error: 'Username must be 3-20 characters long and contain only lowercase letters, numbers, and underscores.' 
      });
    }

    if (RESERVED_SLUGS.includes(cleanUsername)) {
      return NextResponse.json({ 
        available: false, 
        error: 'This username is reserved and cannot be claimed.' 
      });
    }

    // Check availability in User table
    const existingUser = await prisma.user.findFirst({
      where: {
        username: cleanUsername
      }
    });

    if (existingUser) {
      return NextResponse.json({ 
        available: false, 
        error: 'Username is already taken' 
      });
    }

    return NextResponse.json({ available: true });

  } catch (error: any) {
    console.error('Username check error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
