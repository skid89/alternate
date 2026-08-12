import { verifyAndGetSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { 
  Users, 
  Flag, 
  History, 
  ShieldCheck, 
  Ban, 
  CheckCircle2, 
  Trash2, 
  Award,
  KeyRound,
  ArrowLeft,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0; // Live admin updates

export default async function AdminPanel({
  searchParams
}: {
  searchParams: { tab?: string; success?: string; error?: string }
}) {
  const activeTab = searchParams.tab || 'overview';

  // 1. Check if ANY Admin/Owner exists in DB
  const adminCount = await prisma.user.count({
    where: {
      role: { in: ['OWNER', 'ADMIN'] }
    }
  });

  const setupMode = adminCount === 0;

  // First-time setup action
  const handleSetupAction = async (formData: FormData) => {
    'use server';
    const setupSecret = formData.get('setupSecret') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const envSecret = process.env.ADMIN_SETUP_SECRET || 'alternate-admin-initialize-token-2026-secure';

    if (setupSecret !== envSecret) {
      redirect('/admin?error=invalid_setup_secret');
    }

    if (!username || !email || !password) {
      redirect('/admin?error=missing_setup_fields');
    }

    const cleanUsername = username.trim().toLowerCase();
    const passwordHash = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: cleanUsername,
          email: email.trim().toLowerCase(),
          passwordHash,
          role: 'OWNER',
          premiumStatus: 'LIFETIME'
        }
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          slug: cleanUsername,
          displayName: 'Alternate Admin Owner',
          bio: 'First system owner account.'
        }
      });
    });

    redirect('/login?success=admin_created');
  };

  if (setupMode) {
    // Render first-time setup panel
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
        <form action={handleSetupAction} className="glass-card" style={{ width: '100%', maxWidth: '420px', backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>First-time Owner Setup</h2>
          <p className="text-muted" style={{ fontSize: '13px' }}>No system administrator accounts exist. Initialize the first Owner account using the system setup secret.</p>
          
          {searchParams.error && (
            <div style={{ color: '#ef4444', fontSize: '12px', padding: '8px', border: '1px solid #ef4444', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
              ⚠ Error: {searchParams.error === 'invalid_setup_secret' ? 'Invalid ADMIN_SETUP_SECRET.' : 'Fill out all input fields.'}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Setup Secret (ADMIN_SETUP_SECRET)</label>
            <input type="password" name="setupSecret" className="input-field" required />
          </div>
          <div className="input-group">
            <label className="input-label">Admin Username</label>
            <input type="text" name="username" className="input-field" placeholder="e.g. owner" required />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" name="email" className="input-field" placeholder="admin@alternate.lol" required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" name="password" className="input-field" placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
            Initialize Owner Account
          </button>
        </form>
      </div>
    );
  }

  // 2. Standard Admin Access: Check session and user privileges
  const session = await verifyAndGetSession();
  if (!session || !['OWNER', 'ADMIN', 'MODERATOR'].includes(session.user.role)) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>403 Forbidden</h2>
          <p className="text-muted" style={{ fontSize: '14px', marginTop: '6px' }}>You do not have administrative clearance to access this control panel.</p>
          <Link href="/dashboard" className="btn btn-secondary" style={{ marginTop: '16px' }}>Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Fetch admin statistics
  const usersCount = await prisma.user.count();
  const reportsCount = await prisma.report.count({ where: { status: 'PENDING' } });
  const premiumCount = await prisma.user.count({ where: { premiumStatus: { not: 'FREE' } } });
  
  // Data for tabs
  const users = await prisma.user.findMany({
    take: 30,
    orderBy: { createdAt: 'desc' },
    include: { profile: true }
  });

  const reports = await prisma.report.findMany({
    where: { status: 'PENDING' },
    include: { profile: true }
  });

  const auditLogs = await prisma.auditLog.findMany({
    take: 20,
    orderBy: { timestamp: 'desc' },
    include: { actor: { select: { username: true } } }
  });

  // Admin Server Actions
  const toggleBanAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth || !['OWNER', 'ADMIN'].includes(sessionAuth.user.role)) return;

    const targetUserId = formData.get('userId') as string;
    const user = await prisma.user.findUnique({ where: { id: targetUserId }, include: { profile: true } });
    if (!user || !user.profile) return;

    const isSuspended = !user.profile.isSuspended;

    // Toggle suspension
    await prisma.profile.update({
      where: { userId: targetUserId },
      data: { isSuspended }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorId: sessionAuth.userId,
        action: isSuspended ? 'USER_SUSPEND' : 'USER_UNSUSPEND',
        targetId: targetUserId,
        details: `Toggled suspension state of user ${user.username} to ${isSuspended}`
      }
    });

    redirect('/admin?tab=users&success=ban_toggled');
  };

  const assignVerifiedBadgeAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth || !['OWNER', 'ADMIN'].includes(sessionAuth.user.role)) return;

    const targetUserId = formData.get('userId') as string;
    const badge = await prisma.badge.findUnique({ where: { name: 'Verified' } });
    if (!badge) return;

    // Check if already assigned
    const exists = await prisma.userBadge.findFirst({
      where: { userId: targetUserId, badgeId: badge.id }
    });

    if (!exists) {
      await prisma.userBadge.create({
        data: { userId: targetUserId, badgeId: badge.id }
      });
      // Set premium Status to VERIFIED
      await prisma.user.update({
        where: { id: targetUserId },
        data: { premiumStatus: 'VERIFIED' }
      });

      await prisma.auditLog.create({
        data: {
          actorId: sessionAuth.userId,
          action: 'BADGE_ASSIGN',
          targetId: targetUserId,
          details: 'Assigned Verified badge'
        }
      });
    }

    redirect('/admin?tab=users&success=badge_assigned');
  };

  const resolveReportAction = async (formData: FormData) => {
    'use server';
    const sessionAuth = await verifyAndGetSession();
    if (!sessionAuth) return;

    const reportId = formData.get('reportId') as string;
    await prisma.report.update({
      where: { id: reportId },
      data: { status: 'RESOLVED' }
    });

    redirect('/admin?tab=reports&success=report_resolved');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        
        {/* Navigation header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '8px' }}>
              <ArrowLeft size={16} />
            </Link>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>System Administration</h1>
          </div>
          <span className="premium-tag" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Admin Clearance</span>
        </div>

        {searchParams.success && (
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', fontSize: '14px', marginBottom: '24px' }}>
            ✓ Admin operation processed successfully.
          </div>
        )}

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px', marginBottom: '24px' }}>
          <Link href="/admin?tab=overview" className={`btn btn-secondary ${activeTab === 'overview' ? 'active' : ''}`} style={{ fontSize: '13px' }}>
            <Activity size={14} /> Overview
          </Link>
          <Link href="/admin?tab=users" className={`btn btn-secondary ${activeTab === 'users' ? 'active' : ''}`} style={{ fontSize: '13px' }}>
            <Users size={14} /> Users
          </Link>
          <Link href="/admin?tab=reports" className={`btn btn-secondary ${activeTab === 'reports' ? 'active' : ''}`} style={{ fontSize: '13px' }}>
            <Flag size={14} /> Reports ({reportsCount})
          </Link>
          <Link href="/admin?tab=logs" className={`btn btn-secondary ${activeTab === 'logs' ? 'active' : ''}`} style={{ fontSize: '13px' }}>
            <History size={14} /> Audit Trail
          </Link>
        </div>

        {/* TAB 1: Overview */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-3">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-title">Total Users</span>
                <span className="stat-value">{usersCount}</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Pending Reports</span>
                <span className="stat-value" style={{ color: '#ef4444' }}>{reportsCount}</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Premium Subscriptions</span>
                <span className="stat-value" style={{ color: '#f59e0b' }}>{premiumCount}</span>
              </div>
            </div>
            <div className="glass-card" style={{ marginTop: '12px' }}>
              <h3>System Health status</h3>
              <p className="text-muted" style={{ fontSize: '13px' }}>Alternate core infrastructure and server actions are fully operational. SQLite/Postgres configurations loaded.</p>
            </div>
          </div>
        )}

        {/* TAB 2: Users Management List */}
        {activeTab === 'users' && (
          <div className="glass-card flex flex-col gap-3">
            <h3>Registered Accounts</h3>
            <div style={{ overflowX: 'auto', marginTop: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>Username</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Role</th>
                    <th style={{ padding: '12px' }}>Premium</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>@{u.username}</td>
                      <td style={{ padding: '12px' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>{u.role}</td>
                      <td style={{ padding: '12px' }}>{u.premiumStatus}</td>
                      <td style={{ padding: '12px' }}>
                        {u.profile?.isSuspended ? (
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>Suspended</span>
                        ) : (
                          <span style={{ color: '#10b981' }}>Active</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <form action={toggleBanAction}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button type="submit" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444' }}>
                            <Ban size={10} /> {u.profile?.isSuspended ? 'Unban' : 'Ban'}
                          </button>
                        </form>
                        <form action={assignVerifiedBadgeAction}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button type="submit" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--accent-light)' }}>
                            <Award size={10} /> Verify
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Reports Queue */}
        {activeTab === 'reports' && (
          <div className="glass-card flex flex-col gap-3">
            <h3>Pending Moderation Queue</h3>
            <div className="flex flex-col gap-2" style={{ marginTop: '12px' }}>
              {reports.length === 0 ? (
                <span className="text-muted" style={{ fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No pending abuse reports.</span>
              ) : (
                reports.map(r => (
                  <div key={r.id} className="flex justify-between align-center" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                    <div className="flex flex-col gap-1" style={{ fontSize: '13px' }}>
                      <span style={{ fontWeight: 700 }}>Report on Profile: @{r.profile.slug}</span>
                      <span className="text-muted" style={{ fontSize: '11px' }}>Category: {r.category} | Reporter: {r.reporterEmail}</span>
                      <p style={{ marginTop: '6px' }}>{r.description}</p>
                    </div>
                    <form action={resolveReportAction}>
                      <input type="hidden" name="reportId" value={r.id} />
                      <button type="submit" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: '#10b981' }}>
                        <CheckCircle2 size={12} /> Resolve
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Audit logs */}
        {activeTab === 'logs' && (
          <div className="glass-card flex flex-col gap-3">
            <h3>System Audit Trail</h3>
            <div className="flex flex-col gap-2" style={{ marginTop: '12px' }}>
              {auditLogs.map(log => (
                <div key={log.id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.02)', fontSize: '13px' }}>
                  <div className="flex justify-between align-center" style={{ marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Action: {log.action}</span>
                    <span className="text-muted" style={{ fontSize: '11px' }}>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-muted" style={{ fontSize: '12px' }}>
                    Actor: {log.actor?.username || 'System'} | Details: {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
