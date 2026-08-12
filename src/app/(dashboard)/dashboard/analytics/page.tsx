import { verifyAndGetSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { BarChart2, MousePointer, Eye, Globe2, Share2, Smartphone, Percent } from 'lucide-react';

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams: { range?: string }
}) {
  const session = await verifyAndGetSession();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true }
  });

  if (!user || !user.profile) {
    redirect('/login');
  }

  const slug = user.profile.slug;
  const range = searchParams.range || '7d';

  // Calculate timeframe
  const now = new Date();
  let timeLimit = new Date();
  if (range === '7d') timeLimit.setDate(now.getDate() - 7);
  else if (range === '30d') timeLimit.setDate(now.getDate() - 30);
  else if (range === '90d') timeLimit.setDate(now.getDate() - 90);
  else timeLimit = new Date(0); // Lifetime

  // Fetch events in time frame
  const events = await prisma.analyticsEvent.findMany({
    where: {
      slug,
      timestamp: { gte: timeLimit }
    }
  });

  const viewsCount = events.filter(e => e.type === 'view').length;
  const clicksCount = events.filter(e => e.type === 'click').length;
  const ctrValue = viewsCount > 0 ? ((clicksCount / viewsCount) * 100).toFixed(1) : '0';

  // Helper to aggregate arrays
  const aggregate = (arr: string[]) => {
    const counts: { [key: string]: number } = {};
    arr.forEach(val => {
      const label = val || 'Unknown';
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count, percent: viewsCount > 0 ? Math.round((count / viewsCount) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5
  };

  // Groupings
  const referrers = aggregate(events.map(e => e.referrer || 'direct'));
  const countries = aggregate(events.map(e => e.country || 'Unknown'));
  const browsers = aggregate(events.map(e => e.browser || 'Unknown'));
  const devices = aggregate(events.map(e => e.device || 'desktop'));

  // Link clicks list
  const linkEvents = events.filter(e => e.type === 'click' && e.target);
  const linksMap: { [key: string]: number } = {};
  linkEvents.forEach(e => {
    if (e.target) linksMap[e.target] = (linksMap[e.target] || 0) + 1;
  });

  // Query actual links to match titles
  const userLinks = await prisma.link.findMany({
    where: { profileId: user.profile.id }
  });

  const popularLinks = Object.entries(linksMap)
    .map(([linkId, count]) => {
      const match = userLinks.find(ul => ul.id === linkId);
      return {
        title: match ? match.title : 'Deleted Custom Link',
        url: match ? match.url : '#',
        count,
        percent: clicksCount > 0 ? Math.round((count / clicksCount) * 100) : 0
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="analytics-container animate-fade flex flex-col gap-3">
      {/* Range Filter Header */}
      <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '16px' }}>
        <h3>Profile Statistics</h3>
        <div className="flex gap-1">
          <a href="/dashboard/analytics?range=7d" className={`btn btn-secondary ${range === '7d' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px' }}>7 Days</a>
          <a href="/dashboard/analytics?range=30d" className={`btn btn-secondary ${range === '30d' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px' }}>30 Days</a>
          <a href="/dashboard/analytics?range=90d" className={`btn btn-secondary ${range === '90d' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px' }}>90 Days</a>
          <a href="/dashboard/analytics?range=lifetime" className={`btn btn-secondary ${range === 'lifetime' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px' }}>Lifetime</a>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="flex justify-between align-center">
            <span className="stat-title">Views ({range})</span>
            <Eye size={16} className="text-muted" />
          </div>
          <span className="stat-value">{viewsCount}</span>
          <span className="stat-desc">Total visits logged</span>
        </div>
        <div className="stat-card">
          <div className="flex justify-between align-center">
            <span className="stat-title">Clicks ({range})</span>
            <MousePointer size={16} className="text-muted" />
          </div>
          <span className="stat-value">{clicksCount}</span>
          <span className="stat-desc">Action clicks logged</span>
        </div>
        <div className="stat-card">
          <div className="flex justify-between align-center">
            <span className="stat-title">CTR ({range})</span>
            <Percent size={16} className="text-muted" />
          </div>
          <span className="stat-value">{ctrValue}%</span>
          <span className="stat-desc">Links click conversion</span>
        </div>
      </div>

      <div className="grid grid-2 gap-3" style={{ marginTop: '12px' }}>
        {/* Popular Links */}
        <div className="glass-card flex flex-col gap-3">
          <h3 className="flex align-center gap-1">
            <BarChart2 size={16} className="text-muted" />
            Top Clicked Links
          </h3>
          <div className="flex flex-col gap-3" style={{ marginTop: '8px' }}>
            {popularLinks.length === 0 ? (
              <span className="text-muted" style={{ fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No link click data logged.</span>
            ) : (
              popularLinks.map((pl, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between align-center" style={{ fontSize: '13px' }}>
                    <span style={{ fontWeight: 600 }}>{pl.title}</span>
                    <span className="text-muted">{pl.count} clicks ({pl.percent}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pl.percent}%`, height: '100%', background: 'var(--accent-color)' }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Traffic Sources (Referrers) */}
        <div className="glass-card flex flex-col gap-3">
          <h3 className="flex align-center gap-1">
            <Share2 size={16} className="text-muted" />
            Traffic Referrers
          </h3>
          <div className="flex flex-col gap-3" style={{ marginTop: '8px' }}>
            {referrers.length === 0 ? (
              <span className="text-muted" style={{ fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No referrer data logged.</span>
            ) : (
              referrers.map((ref, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between align-center" style={{ fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, textTransform: 'lowercase' }}>{ref.label}</span>
                    <span className="text-muted">{ref.count} views ({ref.percent}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${ref.percent}%`, height: '100%', background: 'var(--accent-color)' }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-2 gap-3" style={{ marginTop: '12px' }}>
        {/* Geographic Locations */}
        <div className="glass-card flex flex-col gap-3">
          <h3 className="flex align-center gap-1">
            <Globe2 size={16} className="text-muted" />
            Top Locations
          </h3>
          <div className="flex flex-col gap-3" style={{ marginTop: '8px' }}>
            {countries.length === 0 ? (
              <span className="text-muted" style={{ fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No location data logged.</span>
            ) : (
              countries.map((c, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between align-center" style={{ fontSize: '13px' }}>
                    <span style={{ fontWeight: 600 }}>{c.label}</span>
                    <span className="text-muted">{c.count} views ({c.percent}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${c.percent}%`, height: '100%', background: 'var(--accent-color)' }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Devices and Browsers */}
        <div className="glass-card flex flex-col gap-3">
          <h3 className="flex align-center gap-1">
            <Globe2 size={16} className="text-muted" />
            Browsers & Device Types
          </h3>
          <div className="flex flex-col gap-3" style={{ marginTop: '8px' }}>
            {devices.length === 0 ? (
              <span className="text-muted" style={{ fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No device metrics logged.</span>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Device distribution */}
                <div className="flex flex-col gap-2">
                  <span className="input-label" style={{ fontSize: '10px' }}>Devices</span>
                  {devices.map((d, idx) => (
                    <div key={idx} className="flex align-center justify-between" style={{ fontSize: '13px' }}>
                      <span className="flex align-center gap-1">
                        <Smartphone size={14} className="text-muted" />
                        <span style={{ textTransform: 'capitalize' }}>{d.label}</span>
                      </span>
                      <span>{d.percent}%</span>
                    </div>
                  ))}
                </div>
                {/* Browser distribution */}
                <div className="flex flex-col gap-2">
                  <span className="input-label" style={{ fontSize: '10px' }}>Browsers</span>
                  {browsers.map((b, idx) => (
                    <div key={idx} className="flex justify-between align-center" style={{ fontSize: '13px' }}>
                      <span>{b.label}</span>
                      <span>{b.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
