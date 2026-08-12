import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyAndGetSession, logout } from '@/lib/auth';
import { 
  User, 
  Paintbrush, 
  Link as LinkIcon, 
  BarChart3, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  Compass,
  MessageSquare,
  Sparkles,
  Lock
} from 'lucide-react';
import '@/styles/dashboard.css';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyAndGetSession();

  if (!session) {
    redirect('/login?error=session_required');
  }

  const user = session.user;
  const isAdmin = ['OWNER', 'ADMIN', 'MODERATOR'].includes(user.role);

  // Logout Server Action helper
  const handleLogout = async () => {
    'use server';
    await logout();
    redirect('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo">
            /alternate
          </Link>
          {user.premiumStatus !== 'FREE' && (
            <span className="premium-tag">{user.premiumStatus.toLowerCase()}</span>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="section-title">General</span>
            <Link href="/dashboard" className="nav-item">
              <User size={18} />
              <span>Overview</span>
            </Link>
            <Link href="/dashboard/customize" className="nav-item">
              <Paintbrush size={18} />
              <span>Customize</span>
            </Link>
            <Link href="/dashboard/links" className="nav-item">
              <LinkIcon size={18} />
              <span>Links & Socials</span>
            </Link>
            <Link href="/dashboard/analytics" className="nav-item">
              <BarChart3 size={18} />
              <span>Analytics</span>
            </Link>
          </div>

          <div className="nav-section">
            <span className="section-title">Account</span>
            <Link href="/dashboard/integrations" className="nav-item">
              <Compass size={18} />
              <span>Integrations</span>
            </Link>
            <Link href="/dashboard/comments" className="nav-item">
              <MessageSquare size={18} />
              <span>Comments</span>
            </Link>
            <Link href="/dashboard/security" className="nav-item">
              <Lock size={18} />
              <span>Security</span>
            </Link>
            <Link href={`/${user.username}`} target="_blank" className="nav-item view-profile-btn">
              <Sparkles size={18} />
              <span>View Profile</span>
            </Link>
          </div>

          {isAdmin && (
            <div className="nav-section admin-section">
              <span className="section-title">Management</span>
              <Link href="/admin" className="nav-item admin-item">
                <ShieldAlert size={18} />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">@{user.username}</span>
            <span className="user-role">{user.role.toLowerCase()}</span>
          </div>
          <form action={handleLogout}>
            <button type="submit" className="logout-btn">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <div className="dashboard-main-body">
          {children}
        </div>
      </main>
    </div>
  );
}
