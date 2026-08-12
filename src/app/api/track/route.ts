import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/tracker';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { slug, type, target } = await req.json();

    if (!slug || type !== 'click' || !target) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Track click event
    await trackEvent(slug, 'click', target, req);

    // Update clicksCount field in DB (decoupled increment)
    await prisma.link.updateMany({
      where: { id: target },
      data: { clicksCount: { increment: 1 } }
    }).catch(() => {});

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Click tracking API error:', error);
    return NextResponse.json({ error: 'Failed to record tracking metrics.' }, { status: 500 });
  }
}
