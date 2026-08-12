import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyAndGetSession, logout } from '@/lib/auth';
import { LogOut } from 'lucide-react';
import SidebarNav from '@/components/dashboard/SidebarNav';
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

        <SidebarNav username={user.username} isAdmin={isAdmin} />

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
