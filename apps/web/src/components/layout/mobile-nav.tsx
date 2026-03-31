'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Home, TrendingUp, User, BarChart3, FileText, Users, BookOpen, FolderOpen } from 'lucide-react';

const teacherLinks = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/profile', label: 'Profile', icon: User },
];

const directorLinks = [
  { href: '/director', label: 'Overview', icon: Home },
  { href: '/director/reflections', label: 'Reflections', icon: FileText },
  { href: '/director/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/director/profile', label: 'Profile', icon: User },
];

const adminLinks = [
  { href: '/admin', label: 'Home', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/lessons', label: 'Lessons', icon: BookOpen },
  { href: '/admin/groups', label: 'Groups', icon: FolderOpen },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = user?.role === 'DIRECTOR' ? directorLinks : user?.role === 'ADMIN' ? adminLinks : teacherLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex items-center justify-around py-2 px-1 z-50 md:hidden">
      {links.map(link => {
        const active = pathname === link.href || (link.href !== '/home' && link.href !== '/director' && link.href !== '/admin' && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              active ? 'text-[#00609b]' : 'text-[#9ca3af]'
            }`}
          >
            <link.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
