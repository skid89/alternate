import { verifyAndGetSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Globe, Disc, ShieldAlert, CheckCircle, ToggleLeft, ToggleRight, XCircle } from 'lucide-react';

export default async function IntegrationsPage({
  searchParams
}: {
  searchParams: { success?: string; error?: string }
}) {
  const session = await verifyAndGetSession();
  if (!session) {
    redirect('/login');
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId }
  });

  if (!profile) {
    redirect('/login');
  }

  // Construct Discord OAuth Authorize link
  const discordClientId = process.env.DISCORD_CLIENT_ID || '';
  const redirectUri = encodeURIComponent(process.env.DISCORD_REDIRECT_URI || '');
  const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;

  // Server Action to update integrations toggles and Roblox ID
  const updateIntegrationsAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const discordPresenceEnabled = formData.get('discordPresence') === 'on';
    const robloxPresenceEnabled = formData.get('robloxPresence') === 'on';
    const robloxId = formData.get('robloxId') as string;

    await prisma.profile.update({
      where: { userId: sessionAuth.userId },
      data: {
        discordPresenceEnabled,
        robloxPresenceEnabled,
        robloxId: robloxId ? robloxId.trim() : null
      }
    });

    redirect('/dashboard/integrations?success=settings_updated');
  };

  // Server Action to disconnect integrations
  const disconnectAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const platform = formData.get('platform') as string;

    if (platform === 'discord') {
      await prisma.profile.update({
        where: { userId: sessionAuth.userId },
        data: {
          discordId: null,
          discordPresenceEnabled: false
        }
      });
      // Delete Discord social item
      await prisma.social.deleteMany({
        where: {
          profileId: profile.id,
          platform: 'discord'
        }
      });
    } else if (platform === 'roblox') {
      await prisma.profile.update({
        where: { userId: sessionAuth.userId },
        data: {
          robloxId: null,
          robloxPresenceEnabled: false
        }
      });
      // Delete Roblox social item
      await prisma.social.deleteMany({
        where: {
          profileId: profile.id,
          platform: 'roblox'
        }
      });
    }

    redirect('/dashboard/integrations?success=disconnected');
  };

  return (
    <div className="integrations-container animate-fade flex flex-col gap-3">
      {/* Toast logs */}
      {searchParams.success && (
        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', fontSize: '14px' }}>
          ✓ {searchParams.success === 'settings_updated' ? 'Settings updated successfully.' : 
             searchParams.success === 'discord_linked' ? 'Discord account connected successfully.' : 
             'Connection disconnected successfully.'}
        </div>
      )}
      {searchParams.error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', fontSize: '14px' }}>
          ⚠ Error: {searchParams.error === 'discord_already_linked' ? 'This Discord account is already linked to another Alternate profile.' : 'Failed to process integration operation.'}
        </div>
      )}

      <div className="grid grid-2 gap-3">
        {/* Discord Card */}
        <div className="glass-card flex flex-col justify-between" style={{ minHeight: '260px' }}>
          <div className="flex flex-col gap-1">
            <div className="flex align-center gap-2" style={{ marginBottom: '12px' }}>
              <Disc size={28} style={{ color: '#5865F2' }} />
              <h3>Discord OAuth & Status</h3>
            </div>
            <p className="text-muted" style={{ fontSize: '13px', lineHeight: '1.6' }}>
              Link your Discord profile to display your custom online status, custom activity, active games, and Spotify listening presence directly on your public page. We query the Lanyard API to resolve your active presence real-time.
            </p>
          </div>

          <div style={{ marginTop: '24px' }}>
            {profile.discordId ? (
              <div className="flex align-center justify-between" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                <div className="flex align-center gap-1" style={{ color: '#10b981', fontSize: '13px' }}>
                  <CheckCircle size={16} />
                  <span>Linked ID: {profile.discordId}</span>
                </div>
                <form action={disconnectAction}>
                  <input type="hidden" name="platform" value="discord" />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', color: '#ef4444' }}>
                    Disconnect
                  </button>
                </form>
              </div>
            ) : (
              <a href={discordOAuthUrl} className="btn btn-accent" style={{ background: '#5865F2', display: 'flex', width: '100%' }}>
                Connect Discord Account
              </a>
            )}
          </div>
        </div>

        {/* Roblox Card */}
        <div className="glass-card flex flex-col justify-between" style={{ minHeight: '260px' }}>
          <div className="flex flex-col gap-1">
            <div className="flex align-center gap-2" style={{ marginBottom: '12px' }}>
              <Globe size={28} style={{ color: '#E81C03' }} />
              <h3>Roblox Integration</h3>
            </div>
            <p className="text-muted" style={{ fontSize: '13px', lineHeight: '1.6' }}>
              Connect your Roblox account using your public Roblox User ID. Alternate will fetch your online presence (Offline, Online, In Game, or In Studio) alongside your current experience/place ID to showcase what you are playing.
            </p>
          </div>

          <div style={{ marginTop: '24px' }}>
            {profile.robloxId ? (
              <div className="flex align-center justify-between" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                <div className="flex align-center gap-1" style={{ color: '#10b981', fontSize: '13px' }}>
                  <CheckCircle size={16} />
                  <span>Linked ID: {profile.robloxId}</span>
                </div>
                <form action={disconnectAction}>
                  <input type="hidden" name="platform" value="roblox" />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', color: '#ef4444' }}>
                    Disconnect
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Roblox ID not connected. Save connection details using the configuration form below.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form action={updateIntegrationsAction} className="glass-card flex flex-col gap-3" style={{ marginTop: '12px' }}>
        <h3>Integration Settings</h3>
        <p className="text-muted" style={{ fontSize: '13px' }}>Configure how presence metadata and active indicators are shared on your public profile card.</p>
        
        <div className="flex flex-col gap-3" style={{ marginTop: '16px' }}>
          {/* Discord Toggle */}
          <div className="flex justify-between align-center" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
            <div className="flex flex-col">
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Display Discord Presence Status</span>
              <span className="text-muted" style={{ fontSize: '12px' }}>Renders your active Discord online tag, game details, and Spotify tracks.</span>
            </div>
            <label className="switch" style={{ cursor: 'pointer' }}>
              <input type="checkbox" name="discordPresence" defaultChecked={profile.discordPresenceEnabled} disabled={!profile.discordId} />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Roblox Toggle */}
          <div className="flex justify-between align-center" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
            <div className="flex flex-col">
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Display Roblox Presence Status</span>
              <span className="text-muted" style={{ fontSize: '12px' }}>Renders when you are actively inside a Roblox game session.</span>
            </div>
            <label className="switch" style={{ cursor: 'pointer' }}>
              <input type="checkbox" name="robloxPresence" defaultChecked={profile.robloxPresenceEnabled} disabled={!profile.robloxId} />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Roblox ID input */}
          <div className="input-group">
            <label className="input-label">Roblox User ID</label>
            <input 
              type="text" 
              name="robloxId" 
              className="input-field" 
              placeholder="e.g. 15632488" 
              defaultValue={profile.robloxId || ''} 
            />
            <span className="text-muted" style={{ fontSize: '11px' }}>Can be found in your Roblox profile URL: https://roblox.com/users/YOUR_ID/profile</span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>
          Save Configuration
        </button>
      </form>
    </div>
  );
}
