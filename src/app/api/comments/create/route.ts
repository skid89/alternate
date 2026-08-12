import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { profileId, authorName, content } = await req.json();

    if (!profileId || !authorName || !content) {
      return NextResponse.json({ error: 'Missing required inputs' }, { status: 400 });
    }

    if (authorName.trim().length > 32 || content.trim().length > 250) {
      return NextResponse.json({ error: 'Character limit exceeded' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';

    // Simple spam check: limit to 2 comments per IP per profile per 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentCommentsCount = await prisma.comment.count({
      where: {
        profileId,
        ipAddress,
        createdAt: { gte: tenMinutesAgo }
      }
    });

    if (recentCommentsCount >= 2) {
      return NextResponse.json({ error: 'You are commenting too fast. Please wait a few minutes.' }, { status: 429 });
    }

    const comment = await prisma.comment.create({
      data: {
        profileId,
        authorName: authorName.trim(),
        content: content.trim(),
        status: 'PENDING',
        ipAddress
      }
    });

    return NextResponse.json({ success: true, comment });

  } catch (error) {
    console.error('Comment creation API error:', error);
    return NextResponse.json({ error: 'Failed to post comment.' }, { status: 500 });
  }
}
