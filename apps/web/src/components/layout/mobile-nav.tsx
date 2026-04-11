'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Home,
  User,
  User as UserIcon,
  Users,
  BookOpen,
  MessageSquare,
  BarChart3,
} from 'lucide-react';

/**
 * Mobile bottom navigation.
 * Icons and labels match Figma:
 *   - Teacher (494:62091): Home / BookOpen ("Progress") / User ("Profile")
 *   - Admin   (429:37319): User ("Users") / BookOpen ("Lessons") / Users ("Groups")
 *   - Director(454:37847): Home ("Overview") / MessageSquare ("Reflections") / BarChart3 ("Analytics")
 */

const teacherLinks = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/progress', label: 'Progress', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
];

const directorLinks = [
  { href: '/director', label: 'Overview', icon: Home },
  { href: '/director/reflections', label: 'Reflections', icon: MessageSquare },
  { href: '/director/analytics', label: 'Analytics', icon: BarChart3 },
];

const adminLinks = [
  { href: '/admin/users', label: 'Users', icon: UserIcon },
  { href: '/admin/lessons', label: 'Lessons', icon: BookOpen },
  { href: '/admin/groups', label: 'Groups', icon: Users },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links =
    user?.role === 'DIRECTOR'
      ? directorLinks
      : user?.role === 'ADMIN'
        ? adminLinks
        : teacherLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex items-center justify-around py-3 px-1 z-50 md:hidden">
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
            className={`flex flex-col items-center gap-0.5 px-4 py-1 text-[11px] font-medium transition-colors ${
              active ? 'text-[#00609b]' : 'text-[#9ca3af]'
            }`}
          >
            <link.icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            {active && <span>{link.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
