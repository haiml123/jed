'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Avatar from '@/components/ui/avatar';
import { Home, User, TrendingUp, BookOpen, Users, BarChart3, FileText, LogOut, FolderOpen } from 'lucide-react';

const teacherLinks = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/progress', label: 'My Progress', icon: TrendingUp },
  { href: '/profile', label: 'Profile', icon: User },
];

const directorLinks = [
  { href: '/director', label: 'Overview', icon: Home },
  { href: '/director/reflections', label: 'Reflections', icon: FileText },
  { href: '/director/analytics', label: 'Analytics', icon: BarChart3 },
];

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/lessons', label: 'Lessons', icon: BookOpen },
  { href: '/admin/groups', label: 'Groups', icon: FolderOpen },
  { href: '/admin/profile', label: 'Profile', icon: User },
];

const ROLE_LABELS: Record<string, string> = {
  TEACHER: 'Teacher',
  DIRECTOR: 'Director',
  ADMIN: 'Admin',
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const links =
    user?.role === 'DIRECTOR'
      ? directorLinks
      : user?.role === 'ADMIN'
        ? adminLinks
        : teacherLinks;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-[220px] bg-white border-r border-border min-h-screen flex flex-col shrink-0">
      {/* JED Logo */}
      <div className="p-5 pb-4">
        <Image src="/assets/shared/jed-logo.png" alt="JED" width={76} height={71} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== '/home' &&
              link.href !== '/director' &&
              link.href !== '/admin' &&
              pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#eff6ff] text-[#1a6ebf]'
                  : 'text-[#374151] hover:bg-gray-50'
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User info + Logout */}
      <div className="px-4 pb-5 space-y-3">
        {/* User avatar and info */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar
              src={user.avatarUrl}
              name={user.name}
              size={36}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#374151] truncate">{user.name}</p>
              <p className="text-xs text-[#6b7280]">{ROLE_LABELS[user.role] ?? user.role}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium text-[#6b7280] hover:bg-gray-50 w-full transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
