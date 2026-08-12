import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { loginId, password } = await req.json();

    if (!loginId || !password) {
      return NextResponse.json({ error: 'Username/Email and Password are required' }, { status: 400 });
    }

    const cleanLoginId = loginId.trim().toLowerCase();

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanLoginId },
          { email: cleanLoginId }
        ]
      },
      include: {
        profile: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid username, email, or password' }, { status: 401 });
    }

    // Verify Password
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid username, email, or password' }, { status: 401 });
    }

    // Check suspension state
    if (user.profile?.isSuspended) {
      return NextResponse.json({ 
        error: 'Your account has been suspended for violating Alternate guidelines. Please contact support@alternate.lol' 
      }, { status: 403 });
    }

    // Create session
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;
    await createSession(user.id, ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        premiumStatus: user.premiumStatus
      }
    });

  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during login.' }, { status: 500 });
  }
}
