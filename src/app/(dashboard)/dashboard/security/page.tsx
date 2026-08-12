import { verifyAndGetSession, hashPassword, comparePassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Lock, EyeOff, ShieldAlert, KeyRound, Globe2 } from 'lucide-react';

export default async function SecurityPage({
  searchParams
}: {
  searchParams: { success?: string; error?: string }
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

  const profile = user.profile;

  // Server Action to update privacy options
  const updatePrivacyAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const isPrivate = formData.get('isPrivate') === 'on';
    const isUnlisted = formData.get('isUnlisted') === 'on';
    const seoIndexing = formData.get('seoIndexing') === 'on';
    const commentsEnabled = formData.get('commentsEnabled') === 'on';

    await prisma.profile.update({
      where: { userId: sessionAuth.userId },
      data: {
        isPrivate,
        isUnlisted,
        seoIndexing,
        commentsEnabled
      }
    });

    redirect('/dashboard/security?success=privacy_updated');
  };

  // Server Action to change password
  const updatePasswordAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      redirect('/dashboard/security?error=missing_password_fields');
    }

    if (newPassword !== confirmPassword) {
      redirect('/dashboard/security?error=password_mismatch');
    }

    if (newPassword.length < 8) {
      redirect('/dashboard/security?error=password_too_short');
    }

    // Get current user password hash from DB
    const userDb = await prisma.user.findUnique({ where: { id: sessionAuth.userId } });
    if (!userDb) return;

    // Verify current password
    const isMatch = await comparePassword(currentPassword, userDb.passwordHash);
    if (!isMatch) {
      redirect('/dashboard/security?error=incorrect_current_password');
    }

    // Hash and update
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: sessionAuth.userId },
      data: { passwordHash: hashed }
    });

    // Revoke other sessions (keep current one)
    await prisma.session.deleteMany({
      where: {
        userId: sessionAuth.userId,
        NOT: { id: sessionAuth.id }
      }
    });

    redirect('/dashboard/security?success=password_changed');
  };

  // Server Action to revoke all active sessions
  const revokeAllSessionsAction = async () => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    await prisma.session.deleteMany({
      where: { userId: sessionAuth.userId }
    });

    // Redirect to login because all sessions (including current one) are deleted
    redirect('/login?success=all_sessions_revoked');
  };

  return (
    <div className="security-container animate-fade flex flex-col gap-3">
      {searchParams.success && (
        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', fontSize: '14px' }}>
          ✓ {searchParams.success === 'privacy_updated' ? 'Privacy parameters successfully updated.' : 
             searchParams.success === 'password_changed' ? 'Password changed successfully. All other device sessions have been logged out.' : 
             'Sessions revoked.'}
        </div>
      )}
      {searchParams.error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', fontSize: '14px' }}>
          ⚠ Error: {searchParams.error === 'password_mismatch' ? 'New passwords do not match.' : 
                     searchParams.error === 'password_too_short' ? 'New password must be at least 8 characters long.' :
                     searchParams.error === 'incorrect_current_password' ? 'The current password you provided is incorrect.' :
                     'Failed to change password. Fill out all input fields.'}
        </div>
      )}

      <div className="grid grid-2 gap-3">
        {/* Left Column: Privacy Options */}
        <form action={updatePrivacyAction} className="glass-card flex flex-col gap-3">
          <h3 className="flex align-center gap-1">
            <EyeOff size={18} className="text-muted" />
            Profile Privacy & Indexing
          </h3>
          <p className="text-muted" style={{ fontSize: '13px' }}>Control your profile visibility and search engine configurations.</p>
          
          <div className="flex flex-col gap-3" style={{ marginTop: '16px' }}>
            <div className="flex justify-between align-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
              <div className="flex flex-col">
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Private Account</span>
                <span className="text-muted" style={{ fontSize: '12px' }}>Hides your profile completely from the public. Only visible to you.</span>
              </div>
              <input type="checkbox" name="isPrivate" defaultChecked={profile.isPrivate} />
            </div>

            <div className="flex justify-between align-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
              <div className="flex flex-col">
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Unlisted Profile</span>
                <span className="text-muted" style={{ fontSize: '12px' }}>Hides your page from the Alternate leaderboard and discovery sections.</span>
              </div>
              <input type="checkbox" name="isUnlisted" defaultChecked={profile.isUnlisted} />
            </div>

            <div className="flex justify-between align-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
              <div className="flex flex-col">
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Search Engine Indexing</span>
                <span className="text-muted" style={{ fontSize: '12px' }}>Allows Google and Bing bots to index your alternate.lol page.</span>
              </div>
              <input type="checkbox" name="seoIndexing" defaultChecked={profile.seoIndexing} />
            </div>

            <div className="flex justify-between align-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
              <div className="flex flex-col">
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Enable Comments</span>
                <span className="text-muted" style={{ fontSize: '12px' }}>Allow visitors to submit posts and reviews directly to your card.</span>
              </div>
              <input type="checkbox" name="commentsEnabled" defaultChecked={profile.commentsEnabled} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>
            Update Privacy
          </button>
        </form>

        {/* Right Column: Password Change */}
        <form action={updatePasswordAction} className="glass-card flex flex-col gap-3">
          <h3 className="flex align-center gap-1">
            <KeyRound size={18} className="text-muted" />
            Change Password
          </h3>
          <p className="text-muted" style={{ fontSize: '13px' }}>Change your credentials. Note: This will invalidate all other logged-in device sessions.</p>
          
          <div className="flex flex-col gap-2" style={{ marginTop: '16px' }}>
            <div className="input-group">
              <label className="input-label">Current Password</label>
              <input type="password" name="currentPassword" className="input-field" required />
            </div>
            <div className="input-group">
              <label className="input-label">New Password</label>
              <input type="password" name="newPassword" className="input-field" required />
            </div>
            <div className="input-group">
              <label className="input-label">Confirm New Password</label>
              <input type="password" name="confirmPassword" className="input-field" required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>
            Save Password
          </button>
        </form>
      </div>

      {/* Force Revoke Area */}
      <div className="glass-card flex justify-between align-center" style={{ marginTop: '12px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
        <div className="flex flex-col">
          <span style={{ fontWeight: 600, fontSize: '15px', color: '#ef4444' }} className="flex align-center gap-1">
            <ShieldAlert size={18} /> Danger Zone: Revoke All Device Sessions
          </span>
          <span className="text-muted" style={{ fontSize: '13px' }}>
            Instantly log out of every device and active browser tab. This session will also be closed.
          </span>
        </div>
        <form action={revokeAllSessionsAction}>
          <button type="submit" className="btn" style={{ background: '#ef4444', color: '#ffffff' }}>
            Revoke All Sessions
          </button>
        </form>
      </div>
    </div>
  );
}
