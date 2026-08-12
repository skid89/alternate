import { cookies } from 'next/headers';
import { prisma } from './db';
import * as bcrypt from 'bcryptjs';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'alternate-local-dev-jwt-signing-key-random-and-secure-987654321'
);

const SESSION_COOKIE_NAME = 'alternate_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface SessionPayload {
  sessionId: string;
  userId: string;
  username: string;
  role: string;
}

export async function createSession(userId: string, ipAddress?: string, userAgent?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, role: true }
  });

  if (!user) throw new Error('User not found');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days session

  // 1. Create session record in database
  const sessionRecord = await prisma.session.create({
    data: {
      userId: user.id,
      token: Math.random().toString(36).substring(2) + Date.now().toString(36),
      ipAddress,
      userAgent,
      expiresAt
    }
  });

  // 2. Generate signed JWT token containing the session reference
  const payload: SessionPayload = {
    sessionId: sessionRecord.id,
    userId: user.id,
    username: user.username,
    role: user.role
  };

  const jwt = await new jose.SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);

  // 3. Set Cookie
  cookies().set(SESSION_COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  });

  return { session: sessionRecord, token: jwt };
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

export async function verifyAndGetSession() {
  const payload = await getSessionPayload();
  if (!payload) return null;

  // Verify session exists in DB and hasn't expired
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          premiumStatus: true
        }
      }
    }
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    await logout();
    return null;
  }

  // Update last active time (debounced / updated occasionally)
  const now = new Date();
  if (now.getTime() - session.lastActiveAt.getTime() > 1000 * 60 * 5) {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActiveAt: now }
    });
  }

  return session;
}

export async function logout() {
  const payload = await getSessionPayload();
  if (payload) {
    // Delete session from DB
    await prisma.session.delete({ where: { id: payload.sessionId } }).catch(() => {});
  }
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function revokeSession(sessionId: string, actorId: string, isAdmin = false) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (!session) return false;

  // Ensure authorized (is owner of session or admin)
  if (session.userId !== actorId && !isAdmin) {
    throw new Error('Unauthorized session revocation');
  }

  await prisma.session.delete({
    where: { id: sessionId }
  });

  return true;
}

export async function revokeAllSessions(userId: string) {
  await prisma.session.deleteMany({
    where: { userId }
  });
}
