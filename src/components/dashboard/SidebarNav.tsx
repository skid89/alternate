'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, 
  Paintbrush, 
  Link as LinkIcon, 
  BarChart3, 
  Compass, 
  MessageSquare, 
  Lock, 
  Sparkles, 
  ShieldAlert 
} from 'lucide-react';

interface SidebarNavProps {
  username: string;
  isAdmin: boolean;
}

export default function SidebarNav({ username, isAdmin }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path ? 'active' : '';

  return (
    <nav className="sidebar-nav">
      <div className="nav-section">
        <span className="section-title">General</span>
        <Link href="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
          <User size={18} />
          <span>Overview</span>
        </Link>
        <Link href="/dashboard/customize" className={`nav-item ${isActive('/dashboard/customize')}`}>
          <Paintbrush size={18} />
          <span>Customize</span>
        </Link>
        <Link href="/dashboard/links" className={`nav-item ${isActive('/dashboard/links')}`}>
          <LinkIcon size={18} />
          <span>Links & Socials</span>
        </Link>
        <Link href="/dashboard/analytics" className={`nav-item ${isActive('/dashboard/analytics')}`}>
          <BarChart3 size={18} />
          <span>Analytics</span>
        </Link>
      </div>

      <div className="nav-section">
        <span className="section-title">Account</span>
        <Link href="/dashboard/integrations" className={`nav-item ${isActive('/dashboard/integrations')}`}>
          <Compass size={18} />
          <span>Integrations</span>
        </Link>
        <Link href="/dashboard/comments" className={`nav-item ${isActive('/dashboard/comments')}`}>
          <MessageSquare size={18} />
          <span>Comments</span>
        </Link>
        <Link href="/dashboard/security" className={`nav-item ${isActive('/dashboard/security')}`}>
          <Lock size={18} />
          <span>Security</span>
        </Link>
        <Link href={`/${username}`} target="_blank" className="nav-item view-profile-btn">
          <Sparkles size={18} />
          <span>View Profile</span>
        </Link>
      </div>

      {isAdmin && (
        <div className="nav-section admin-section">
          <span className="section-title">Management</span>
          <Link href="/admin" className={`nav-item admin-item ${isActive('/admin')}`}>
            <ShieldAlert size={18} />
            <span>Admin Panel</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
