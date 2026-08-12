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
  Award,
  ArrowLeft,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import '@/styles/admin.css';

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
      <div className="admin-center-viewport">
        <form action={handleSetupAction} className="admin-setup-card animate-fade">
          <h2 className="admin-setup-title">First-time Owner Setup</h2>
          <p className="text-muted" style={{ fontSize: '13px', lineHeight: 1.5 }}>
            No system administrator accounts exist. Initialize the first Owner account using the system setup secret.
          </p>
          
          {searchParams.error && (
            <div className="admin-toast-error" style={{ color: '#ef4444', fontSize: '12px', padding: '10px', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.03)', textAlign: 'center' }}>
              ⚠ Error: {searchParams.error === 'invalid_setup_secret' ? 'Invalid ADMIN_SETUP_SECRET.' : 'Fill out all input fields.'}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Setup Secret</label>
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

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', width: '100%' }}>
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
      <div className="admin-center-viewport">
        <div className="admin-forbidden-box animate-scale">
          <h2 className="admin-forbidden-title">403 Forbidden</h2>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            You do not have administrative clearance to access this control panel.
          </p>
          <Link href="/dashboard" className="btn btn-secondary" style={{ marginTop: '8px' }}>
            Go to Dashboard
          </Link>
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
    <div className="admin-viewport animate-fade">
      <div className="admin-container">
        
        {/* Navigation header */}
        <div className="admin-header-row">
          <div className="admin-header-left">
            <Link href="/dashboard" className="admin-btn-back">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="admin-title">System Administration</h1>
          </div>
          <span className="admin-clearance-badge">Admin Clearance</span>
        </div>

        {searchParams.success && (
          <div className="admin-notification">
            ✓ Admin operation processed successfully.
          </div>
        )}

        {/* Tab Controls */}
        <div className="admin-tab-controls">
          <Link href="/admin?tab=overview" className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}>
            <Activity size={14} /> Overview
          </Link>
          <Link href="/admin?tab=users" className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}>
            <Users size={14} /> Users
          </Link>
          <Link href="/admin?tab=reports" className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}>
            <Flag size={14} /> Reports ({reportsCount})
          </Link>
          <Link href="/admin?tab=logs" className={`admin-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}>
            <History size={14} /> Audit Trail
          </Link>
        </div>

        {/* TAB 1: Overview */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-3">
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <span className="admin-stat-label">Total Users</span>
                <span className="admin-stat-value">{usersCount}</span>
              </div>
              <div className="admin-stat-card" style={{ borderLeft: '2px solid rgba(239, 68, 68, 0.4)' }}>
                <span className="admin-stat-label">Pending Reports</span>
                <span className="admin-stat-value" style={{ color: '#ef4444' }}>{reportsCount}</span>
              </div>
              <div className="admin-stat-card" style={{ borderLeft: '2px solid rgba(245, 158, 11, 0.4)' }}>
                <span className="admin-stat-label">Premium accounts</span>
                <span className="admin-stat-value" style={{ color: '#f59e0b' }}>{premiumCount}</span>
              </div>
            </div>
            <div className="glass-card" style={{ marginTop: '12px' }}>
              <h3>System Infrastructure Status</h3>
              <p className="text-muted" style={{ fontSize: '13px', marginTop: '6px', lineHeight: 1.5 }}>
                Alternate core server functions are fully operational. Local storage file upload boundaries and Neon PostgreSQL instances are connected.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Users Management List */}
        {activeTab === 'users' && (
          <div className="glass-card flex flex-col gap-3">
            <h3>Registered Accounts</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Premium status</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="admin-user-slug">@{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.premiumStatus}</td>
                      <td>
                        {u.profile?.isSuspended ? (
                          <span className="admin-badge-suspended">Suspended</span>
                        ) : (
                          <span className="admin-badge-active">Active</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <form action={toggleBanAction}>
                            <input type="hidden" name="userId" value={u.id} />
                            <button type="submit" className="admin-btn-action ban">
                              <Ban size={10} /> {u.profile?.isSuspended ? 'Unban' : 'Ban'}
                            </button>
                          </form>
                          <form action={assignVerifiedBadgeAction}>
                            <input type="hidden" name="userId" value={u.id} />
                            <button type="submit" className="admin-btn-action verify">
                              <Award size={10} /> Verify
                            </button>
                          </form>
                        </div>
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
            <div className="admin-reports-stack" style={{ marginTop: '12px' }}>
              {reports.length === 0 ? (
                <span className="text-muted" style={{ fontSize: '13px', textAlign: 'center', padding: '32px 0', display: 'block' }}>
                  No pending abuse reports.
                </span>
              ) : (
                reports.map(r => (
                  <div key={r.id} className="admin-report-card">
                    <div className="admin-report-info">
                      <span className="admin-report-title">Report on Profile: @{r.profile.slug}</span>
                      <span className="admin-report-meta">
                        Category: {r.category} | Reporter: {r.reporterEmail}
                      </span>
                      <p className="admin-report-desc">{r.description}</p>
                    </div>
                    <form action={resolveReportAction}>
                      <input type="hidden" name="reportId" value={r.id} />
                      <button type="submit" className="admin-btn-action admin-btn-resolve">
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
            <div className="admin-audit-stack" style={{ marginTop: '12px' }}>
              {auditLogs.map(log => (
                <div key={log.id} className="admin-audit-item">
                  <div className="admin-audit-header">
                    <span className="admin-audit-action">Action: {log.action}</span>
                    <span className="admin-audit-time">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="admin-audit-details">
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
