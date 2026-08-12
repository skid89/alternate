import { verifyAndGetSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Trash2, ArrowUp, ArrowDown, ExternalLink, PlusCircle, AlertCircle } from 'lucide-react';

export default async function LinksPage({
  searchParams
}: {
  searchParams: { success?: string; error?: string }
}) {
  const session = await verifyAndGetSession();
  if (!session) {
    redirect('/login');
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
    include: {
      links: { orderBy: { order: 'asc' } },
      socials: { orderBy: { order: 'asc' } }
    }
  });

  if (!profile) {
    redirect('/login');
  }

  // URL security validator
  const isValidUrl = (urlStr: string): boolean => {
    const cleanUrl = urlStr.trim().toLowerCase();
    if (cleanUrl.startsWith('javascript:') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('vbscript:')) {
      return false;
    }
    // Allow relative local paths or full HTTP(S) links
    if (cleanUrl.startsWith('/') || cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return true;
    }
    return false;
  };

  // Server Actions for Links
  const addLinkAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const isLarge = formData.get('isLarge') === 'on';

    if (!title || !url) {
      redirect('/dashboard/links?error=missing_fields');
    }

    if (!isValidUrl(url)) {
      redirect('/dashboard/links?error=invalid_url');
    }

    // Find next order index
    const profileDb = await prisma.profile.findUnique({
      where: { userId: sessionAuth.userId },
      include: { links: true }
    });
    const nextOrder = profileDb ? profileDb.links.length : 0;

    await prisma.link.create({
      data: {
        profileId: profile.id,
        title: title.trim(),
        url: url.trim(),
        isLarge,
        order: nextOrder
      }
    });

    redirect('/dashboard/links?success=link_added');
  };

  const deleteLinkAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const linkId = formData.get('linkId') as string;

    await prisma.link.deleteMany({
      where: {
        id: linkId,
        profile: { userId: sessionAuth.userId }
      }
    });

    redirect('/dashboard/links?success=link_deleted');
  };

  const reorderLinkAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const linkId = formData.get('linkId') as string;
    const direction = formData.get('direction') as 'up' | 'down';

    const links = await prisma.link.findMany({
      where: { profileId: profile.id },
      orderBy: { order: 'asc' }
    });

    const index = links.findIndex(l => l.id === linkId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      // Swap order value
      const current = links[index];
      const target = links[index - 1];
      await prisma.$transaction([
        prisma.link.update({ where: { id: current.id }, data: { order: target.order } }),
        prisma.link.update({ where: { id: target.id }, data: { order: current.order } })
      ]);
    } else if (direction === 'down' && index < links.length - 1) {
      const current = links[index];
      const target = links[index + 1];
      await prisma.$transaction([
        prisma.link.update({ where: { id: current.id }, data: { order: target.order } }),
        prisma.link.update({ where: { id: target.id }, data: { order: current.order } })
      ]);
    }

    redirect('/dashboard/links?success=reordered');
  };

  // Server Actions for Social Badges
  const addSocialAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const platform = formData.get('platform') as string;
    const value = formData.get('value') as string;

    if (!platform || !value) {
      redirect('/dashboard/links?error=social_missing');
    }

    // Check if platform is already linked
    const existing = await prisma.social.findFirst({
      where: {
        profileId: profile.id,
        platform
      }
    });

    if (existing) {
      await prisma.social.update({
        where: { id: existing.id },
        data: { value: value.trim() }
      });
    } else {
      await prisma.social.create({
        data: {
          profileId: profile.id,
          platform,
          value: value.trim()
        }
      });
    }

    redirect('/dashboard/links?success=social_updated');
  };

  const deleteSocialAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const socialId = formData.get('socialId') as string;

    await prisma.social.deleteMany({
      where: {
        id: socialId,
        profile: { userId: sessionAuth.userId }
      }
    });

    redirect('/dashboard/links?success=social_deleted');
  };

  return (
    <div className="links-container animate-fade flex flex-col gap-3">
      {/* Toast notifications */}
      {searchParams.success && (
        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', fontSize: '14px' }}>
          ✓ {searchParams.success === 'link_added' ? 'Custom link created successfully.' :
             searchParams.success === 'link_deleted' ? 'Link deleted successfully.' :
             searchParams.success === 'social_updated' ? 'Social integration profile added.' :
             searchParams.success === 'social_deleted' ? 'Social platform badge removed.' :
             'Order updated.'}
        </div>
      )}
      {searchParams.error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', fontSize: '14px' }} className="flex align-center gap-1">
          <AlertCircle size={16} />
          <span>
            {searchParams.error === 'invalid_url' ? 'URL input rejected. Malicious protocols (e.g. javascript:) are forbidden.' :
             searchParams.error === 'missing_fields' ? 'All fields are required to create a new link.' :
             'Failed to process operation.'}
          </span>
        </div>
      )}

      <div className="grid grid-2 gap-3">
        {/* Left Card: Links Manager */}
        <div className="glass-card flex flex-col gap-3">
          <h3>Custom Profile Links</h3>
          <p className="text-muted" style={{ fontSize: '13px' }}>Create and manage redirect buttons on your profile. Drag-and-drop or use ordering toggles.</p>
          
          {/* New Link Form */}
          <form action={addLinkAction} className="flex flex-col gap-2" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '20px', marginBottom: '10px' }}>
            <div className="input-group">
              <label className="input-label">Link Title</label>
              <input type="text" name="title" className="input-field" placeholder="e.g. My GitHub" required />
            </div>
            <div className="input-group">
              <label className="input-label">Redirect URL</label>
              <input type="text" name="url" className="input-field" placeholder="e.g. https://github.com/myuser" required />
            </div>
            <div className="flex align-center gap-1" style={{ fontSize: '13px', marginTop: '4px' }}>
              <input type="checkbox" name="isLarge" id="isLarge" />
              <label htmlFor="isLarge">Highlight Link (Large Banner Style)</label>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', alignSelf: 'flex-start' }}>
              <PlusCircle size={16} /> Add Link
            </button>
          </form>

          {/* Links List */}
          <div className="flex flex-col gap-2">
            {profile.links.length === 0 ? (
              <span className="text-muted" style={{ fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No custom links added yet.</span>
            ) : (
              profile.links.map((link, idx) => (
                <div key={link.id} className="flex justify-between align-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                  <div className="flex flex-col" style={{ fontSize: '13px' }}>
                    <span style={{ fontWeight: 600 }} className="flex align-center gap-1">
                      {link.title} {link.isLarge && <span className="premium-tag" style={{ fontSize: '8px' }}>Large</span>}
                    </span>
                    <a href={link.url} target="_blank" className="text-muted" style={{ fontSize: '11px', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {link.url} <ExternalLink size={10} />
                    </a>
                  </div>

                  <div className="flex align-center gap-1">
                    <form action={reorderLinkAction}>
                      <input type="hidden" name="linkId" value={link.id} />
                      <button type="submit" name="direction" value="up" disabled={idx === 0} className="btn btn-secondary" style={{ padding: '6px' }}>
                        <ArrowUp size={12} />
                      </button>
                      <button type="submit" name="direction" value="down" disabled={idx === profile.links.length - 1} className="btn btn-secondary" style={{ padding: '6px' }}>
                        <ArrowDown size={12} />
                      </button>
                    </form>
                    <form action={deleteLinkAction}>
                      <input type="hidden" name="linkId" value={link.id} />
                      <button type="submit" className="btn btn-secondary" style={{ padding: '6px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <Trash2 size={12} />
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Card: Social Badges Manager */}
        <div className="glass-card flex flex-col gap-3">
          <h3>Social Media Badges</h3>
          <p className="text-muted" style={{ fontSize: '13px' }}>Add sleek icons linking to your social profiles. Displayed at the header or top card.</p>

          <form action={addSocialAction} className="flex flex-col gap-2" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '20px', marginBottom: '10px' }}>
            <div className="input-group">
              <label className="input-label">Social Platform</label>
              <select name="platform" className="input-field" style={{ background: 'var(--card-bg-elevated)' }}>
                <option value="discord">Discord (Username/Invite)</option>
                <option value="roblox">Roblox (Username/Profile Link)</option>
                <option value="youtube">YouTube (Channel Slug)</option>
                <option value="tiktok">TikTok (Username)</option>
                <option value="instagram">Instagram (Username)</option>
                <option value="twitter">X / Twitter (Username)</option>
                <option value="github">GitHub (Username)</option>
                <option value="spotify">Spotify (Profile/Playlist Link)</option>
                <option value="steam">Steam (Community URL)</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Username or Custom URL</label>
              <input type="text" name="value" className="input-field" placeholder="e.g. alternate-lol" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', alignSelf: 'flex-start' }}>
              <PlusCircle size={16} /> Link Platform
            </button>
          </form>

          {/* Social Links List */}
          <div className="flex flex-col gap-2">
            {profile.socials.length === 0 ? (
              <span className="text-muted" style={{ fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No social links connected.</span>
            ) : (
              profile.socials.map((social) => (
                <div key={social.id} className="flex justify-between align-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                  <div className="flex flex-col" style={{ fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{social.platform}</span>
                    <span className="text-muted" style={{ fontSize: '11px' }}>{social.value}</span>
                  </div>
                  <form action={deleteSocialAction}>
                    <input type="hidden" name="socialId" value={social.id} />
                    <button type="submit" className="btn btn-secondary" style={{ padding: '6px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
