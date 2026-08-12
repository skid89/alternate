import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

const RESERVED_SLUGS = [
  'admin', 'api', 'status', 'leaderboard', 'dashboard', 'login', 'register', 
  'partners', 'pricing', 'auth', 'assets', 'uploads', 'settings', 'customize', 
  'premium', 'terms', 'privacy', 'index', 'home'
];

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    
    // Validate username rules
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      return NextResponse.json({ 
        error: 'Username must be 3-20 characters long and contain only lowercase letters, numbers, and underscores.' 
      }, { status: 400 });
    }

    if (RESERVED_SLUGS.includes(cleanUsername)) {
      return NextResponse.json({ error: 'This username is reserved and cannot be claimed.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { email: email.trim().toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === cleanUsername) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Email address is already in use' }, { status: 400 });
    }

    // Hash password and save
    const passwordHash = await hashPassword(password);
    
    // Run User and Profile creation inside a Prisma transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: cleanUsername,
          email: email.trim().toLowerCase(),
          passwordHash
        }
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          slug: cleanUsername,
          displayName: username,
          bio: `Hello! I am ${username}. Welcome to my Alternate page.`,
          layout: 'DEFAULT'
        }
      });

      return user;
    });

    // Create session (log in automatically)
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;
    await createSession(newUser.id, ipAddress, userAgent);

    return NextResponse.json({ 
      success: true, 
      user: { id: newUser.id, username: newUser.username, email: newUser.email } 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during registration.' }, { status: 500 });
  }
}
