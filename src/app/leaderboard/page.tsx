import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Trophy, Eye, ArrowLeft, Star } from 'lucide-react';

export const revalidate = 60; // Cache leaderboard for 60 seconds

export default async function LeaderboardPage() {
  // Query popular public profiles
  const profiles = await prisma.profile.findMany({
    where: {
      isPrivate: false,
      isUnlisted: false,
      isSuspended: false
    },
    orderBy: {
      viewsCount: 'desc'
    },
    take: 20,
    include: {
      user: {
        include: {
          badges: {
            include: { badge: true }
          }
        }
      }
    }
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div className="container" style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <Link href="/" className="btn btn-secondary" style={{ padding: '8px' }}>
            <ArrowLeft size={16} />
          </Link>
          <div className="flex align-center gap-1">
            <Trophy size={20} style={{ color: 'var(--accent-color)' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Popular Linkers</h1>
          </div>
        </div>

        <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
          Discover the top-viewed profiles on Alternate. Sorted dynamically by unique profile views.
        </p>

        {/* Profiles Rankings List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {profiles.length === 0 ? (
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: '#71717a' }}>
              No public profiles have been indexed yet.
            </div>
          ) : (
            profiles.map((profile, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              
              return (
                <Link 
                  href={`/${profile.slug}`} 
                  key={profile.id} 
                  className="glass-card flex align-center justify-between" 
                  style={{ 
                    padding: '16px 20px', 
                    borderRadius: '12px', 
                    border: isTopThree ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid var(--card-border)',
                    backgroundColor: '#09090b',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div className="flex align-center gap-3">
                    {/* Rank index */}
                    <span style={{ 
                      fontWeight: 800, 
                      fontSize: '15px', 
                      width: '24px', 
                      color: rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#b45309' : '#52525b' 
                    }}>
                      #{rank}
                    </span>

                    {/* Avatar PFP */}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                      {profile.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.avatarUrl} alt="PFP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '11px', color: '#71717a' }}>PFP</div>
                      )}
                    </div>

                    {/* Names details */}
                    <div className="flex flex-col align-start">
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff' }} className="flex align-center gap-1">
                        {profile.displayName}
                        {profile.user.badges.some(b => b.badge.name === 'Verified') && (
                          <Star size={12} style={{ color: '#8b5cf6', fill: '#8b5cf6' }} />
                        )}
                      </span>
                      <span style={{ fontSize: '11px', color: '#71717a', fontFamily: 'monospace' }}>@{profile.slug}</span>
                    </div>
                  </div>

                  {/* Views indicator */}
                  <div className="flex align-center gap-1 text-muted" style={{ fontSize: '13px' }}>
                    <Eye size={12} />
                    <span>{profile.viewsCount}</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
