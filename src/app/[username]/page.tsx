import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getDiscordPresence, getRobloxPresence } from '@/lib/presence';
import { trackEvent } from '@/lib/tracker';
import { verifyAndGetSession } from '@/lib/auth';
import ProfileClient from './ProfileClient';
import { NextRequest } from 'next/server';

interface RouteProps {
  params: { username: string };
}

export const dynamic = 'force-dynamic';

// 1. Generate SEO Metadata dynamically
export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const slug = params.username.toLowerCase();
  
  const profile = await prisma.profile.findUnique({
    where: { slug },
    include: { user: true }
  });

  if (!profile || profile.isSuspended || profile.isPrivate) {
    return {
      title: 'Profile Not Found | Alternate'
    };
  }

  const title = profile.seoTitle || `${profile.displayName} (@${profile.slug}) | Alternate`;
  const desc = profile.seoDescription || profile.bio || `View ${profile.displayName}'s customized links and integrations page on Alternate.`;

  return {
    title,
    description: desc,
    robots: {
      index: profile.seoIndexing,
      follow: profile.seoIndexing
    },
    openGraph: {
      title,
      description: desc,
      type: 'profile',
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : []
    }
  };
}

// 2. Main Page Render
export default async function ProfilePage({
  params
}: RouteProps) {
  const slug = params.username.toLowerCase();

  // Find profile in DB
  const profile = await prisma.profile.findUnique({
    where: { slug },
    include: {
      user: {
        include: {
          badges: {
            include: { badge: true },
            orderBy: { order: 'asc' }
          }
        }
      },
      links: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      },
      socials: {
        orderBy: { order: 'asc' }
      },
      comments: {
        where: {
          OR: [
            { status: 'APPROVED' },
            { isPinned: true }
          ]
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
      }
    }
  });

  if (!profile || profile.isSuspended) {
    notFound();
  }

  // Handle privacy restrictions
  const session = await verifyAndGetSession();
  const isOwner = session?.userId === profile.userId;

  if (profile.isPrivate && !isOwner) {
    return (
      <div className="profile-viewport flex-col gap-2" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>This profile is private</h2>
        <p className="text-muted" style={{ fontSize: '14px' }}>The owner has restricted public access to this profile.</p>
        <a href="/" className="btn btn-secondary" style={{ marginTop: '16px' }}>Go Home</a>
      </div>
    );
  }

  // Trigger analytics tracking (simulated request parsing for views tracker)
  // Inside standard page routing, we can extract headers via next/headers
  const headersObj = require('next/headers').headers();
  const dummyUrl = new URL(`http://localhost:3000/${slug}`);
  const reqDummy = new NextRequest(dummyUrl.toString(), {
    headers: headersObj
  });

  // Track the profile view event
  await trackEvent(slug, 'view', null, reqDummy);

  // Fetch integrations presence values from real APIs
  let discordPresence = null;
  if (profile.discordPresenceEnabled && profile.discordId) {
    discordPresence = await getDiscordPresence(profile.discordId);
  }

  let robloxPresence = null;
  if (profile.robloxPresenceEnabled && profile.robloxId) {
    robloxPresence = await getRobloxPresence(profile.robloxId);
  }

  const mappedBadges = profile.user.badges.map(ub => ({
    name: ub.badge.name,
    icon: ub.badge.icon,
    color: ub.badge.color
  }));

  const mappedComments = profile.comments.map(c => ({
    id: c.id,
    authorName: c.authorName,
    content: c.content,
    isPinned: c.isPinned,
    createdAt: c.createdAt.toISOString()
  }));

  return (
    <ProfileClient
      profile={profile}
      badges={mappedBadges}
      links={profile.links}
      socials={profile.socials}
      comments={mappedComments}
      discordPresence={discordPresence}
      robloxPresence={robloxPresence}
    />
  );
}
