import { verifyAndGetSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { 
  CheckCircle, 
  Circle, 
  Eye, 
  MousePointerClick, 
  Share2, 
  Calendar, 
  Laptop, 
  Smartphone,
  Sparkles,
  Link as LinkIcon,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardOverview() {
  const session = await verifyAndGetSession();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: {
        include: {
          links: true,
          socials: true
        }
      },
      sessions: true
    }
  });

  if (!user || !user.profile) {
    redirect('/login');
  }

  const profile = user.profile;
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${profile.slug}`;

  // Calculate views & clicks
  const views = profile.viewsCount;
  const clicks = profile.links.reduce((acc, l) => acc + l.clicksCount, 0);
  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0';

  // Compute profile completion tasks
  const tasks = [
    { name: 'Upload Avatar', done: !!profile.avatarUrl, link: '/dashboard/customize' },
    { name: 'Write a Bio Description', done: !!profile.bio, link: '/dashboard/customize' },
    { name: 'Add Custom Links', done: profile.links.length > 0, link: '/dashboard/links' },
    { name: 'Add Social Media Badges', done: profile.socials.length > 0, link: '/dashboard/links' },
    { name: 'Connect Discord or Roblox presence', done: !!profile.discordId || !!profile.robloxId, link: '/dashboard/integrations' }
  ];
  const completedTasks = tasks.filter(t => t.done).length;
  const completionPercent = Math.round((completedTasks / tasks.length) * 100);

  // Parse browser/device from session headers
  const getDeviceIcon = (ua: string | null) => {
    if (!ua) return <Laptop size={16} />;
    if (/iphone|android|mobile/i.test(ua)) return <Smartphone size={16} />;
    return <Laptop size={16} />;
  };

  // Revoke Session Action
  const revokeSessionAction = async (formData: FormData) => {
    'use server';
    const targetSessionId = formData.get('sessionId') as string;
    const sessionAuth = await verifyAndGetSession();
    if (sessionAuth && targetSessionId) {
      await prisma.session.deleteMany({
        where: {
          id: targetSessionId,
          userId: sessionAuth.userId
        }
      });
    }
    redirect('/dashboard');
  };

  return (
    <div className="overview-container animate-fade">
      {/* Quick Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="flex justify-between align-center">
            <span className="stat-title">Profile Views</span>
            <Eye size={16} className="text-muted" />
          </div>
          <span className="stat-value">{views}</span>
          <span className="stat-desc">Unique views (1 hour cooldown)</span>
        </div>

        <div className="stat-card">
          <div className="flex justify-between align-center">
            <span className="stat-title">Link Clicks</span>
            <MousePointerClick size={16} className="text-muted" />
          </div>
          <span className="stat-value">{clicks}</span>
          <span className="stat-desc">Accumulated clicks on profile items</span>
        </div>

        <div className="stat-card">
          <div className="flex justify-between align-center">
            <span className="stat-title">Click-Through Rate</span>
            <Sparkles size={16} className="text-muted" />
          </div>
          <span className="stat-value">{ctr}%</span>
          <span className="stat-desc">Overall conversion metrics</span>
        </div>
      </div>

      <div className="grid grid-2 gap-3" style={{ marginTop: '24px' }}>
        {/* Left Side: Completion and Url controls */}
        <div className="flex flex-col gap-3">
          {/* Public Link Card */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '12px' }} className="flex align-center gap-1">
              <Globe size={18} className="text-muted" />
              Public Identity
            </h3>
            <div className="flex align-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
              <code style={{ fontSize: '14px', color: 'var(--accent-light)' }}>alternate.lol/{profile.slug}</code>
              <a href={profileUrl} target="_blank" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                <Share2 size={14} /> Visit
              </a>
            </div>
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }} className="flex align-center gap-1">
              <Calendar size={14} /> Account Age: {Math.round((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
          </div>

          {/* Profile Completion Checklist */}
          <div className="glass-card">
            <div className="flex justify-between align-center" style={{ marginBottom: '16px' }}>
              <h3>Profile Completion</h3>
              <span className="premium-tag">{completionPercent}%</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ width: `${completionPercent}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.3s ease' }}></div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.map((t, idx) => (
                <li key={idx} className="flex align-center justify-between" style={{ fontSize: '14px' }}>
                  <div className="flex align-center gap-1" style={{ color: t.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {t.done ? <CheckCircle size={16} style={{ color: 'var(--accent-color)' }} /> : <Circle size={16} />}
                    <span>{t.name}</span>
                  </div>
                  {!t.done && (
                    <Link href={t.link} className="text-muted" style={{ fontSize: '12px', textDecoration: 'underline' }}>
                      Configure
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Active Sessions */}
        <div className="glass-card flex flex-col gap-3">
          <h3>Active Sessions & Devices</h3>
          <p className="text-muted" style={{ fontSize: '13px' }}>Below are the active browser tokens logged into your Alternate account. Revoke any unknown sessions.</p>
          
          <div className="flex flex-col gap-2" style={{ marginTop: '12px' }}>
            {user.sessions.map((s) => (
              <div key={s.id} className="flex justify-between align-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                <div className="flex align-center gap-2">
                  <div style={{ padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                    {getDeviceIcon(s.userAgent)}
                  </div>
                  <div className="flex flex-col" style={{ fontSize: '13px' }}>
                    <span style={{ fontWeight: 600 }}>{s.ipAddress || 'Unknown IP'}</span>
                    <span className="text-muted" style={{ fontSize: '11px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.userAgent || 'Unknown browser details'}
                    </span>
                    <span className="text-muted" style={{ fontSize: '10px' }}>
                      Last active: {new Date(s.lastActiveAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {s.id === session.id ? (
                  <span className="premium-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Current</span>
                ) : (
                  <form action={revokeSessionAction}>
                    <input type="hidden" name="sessionId" value={s.id} />
                    <button type="submit" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                      Revoke
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
