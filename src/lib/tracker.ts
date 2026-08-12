import { prisma } from './db';
import { NextRequest } from 'next/server';

// Common bots list to filter out from analytics
const BOT_USER_AGENTS = [
  /bot/i, /spider/i, /crawl/i, /slurp/i, /google/i, /bing/i, /yandex/i, 
  /yahoo/i, /baidu/i, /duckduck/i, /lighthouse/i, /headless/i, /node-fetch/i, /curl/i
];

export function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  return BOT_USER_AGENTS.some((regex) => regex.test(userAgent));
}

export function parseUserAgent(userAgent: string) {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'desktop';

  if (!userAgent) return { browser, os, device };

  // Parse OS
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/macintosh|mac os/i.test(userAgent)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS';
    device = 'mobile';
  } else if (/android/i.test(userAgent)) {
    os = 'Android';
    device = 'mobile';
  } else if (/linux/i.test(userAgent)) os = 'Linux';

  // Parse Browser
  if (/chrome|crios/i.test(userAgent) && !/edge|edg/i.test(userAgent) && !/opr/i.test(userAgent)) browser = 'Chrome';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
  else if (/edge|edg/i.test(userAgent)) browser = 'Edge';
  else if (/opr/i.test(userAgent)) browser = 'Opera';

  // Device check override
  if (/ipad/i.test(userAgent) || (/tablet/i.test(userAgent) && !/mobile/i.test(userAgent))) {
    device = 'tablet';
  } else if (/mobile/i.test(userAgent)) {
    device = 'mobile';
  }

  return { browser, os, device };
}

export async function trackEvent(
  slug: string,
  type: 'view' | 'click',
  target: string | null = null,
  req: NextRequest
) {
  const userAgent = req.headers.get('user-agent') || '';
  
  // 1. Filter bots
  if (isBot(userAgent)) return;

  const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
  const country = req.headers.get('x-vercel-ip-country') || 'NZ'; // Default to NZ local or mock
  const referrerRaw = req.headers.get('referer') || '';
  
  // Parse Referrer
  let referrer = 'direct';
  if (referrerRaw) {
    try {
      const url = new URL(referrerRaw);
      referrer = url.hostname;
    } catch (_) {
      referrer = 'direct';
    }
  }

  const { browser, os, device } = parseUserAgent(userAgent);

  // 2. Prevent view inflation (rate limiting: 1 view per IP per profile per hour)
  if (type === 'view') {
    const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60);
    const recentView = await prisma.analyticsEvent.findFirst({
      where: {
        slug,
        type: 'view',
        ipAddress,
        timestamp: {
          gte: oneHourAgo
        }
      }
    });

    if (recentView) {
      // Do not count the view if they visited in the last hour
      return;
    }

    // Increment profile viewsCount field (decoupled update)
    await prisma.profile.updateMany({
      where: { slug },
      data: { viewsCount: { increment: 1 } }
    }).catch(() => {});
  }

  // 3. Log analytics event
  await prisma.analyticsEvent.create({
    data: {
      slug,
      type,
      target,
      ipAddress,
      country,
      browser,
      os,
      device,
      referrer
    }
  }).catch((err) => {
    console.error('Failed to log analytics event:', err);
  });
}
