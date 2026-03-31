'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from './sidebar';
import MobileNav from './mobile-nav';
import PawBackground from '@/components/ui/paw-background';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar: hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-auto relative pb-16 md:pb-0">
        <PawBackground />
        <div className="relative z-10">{children}</div>
      </main>

      {/* Bottom nav: visible on mobile, hidden on md+ */}
      <MobileNav />
    </div>
  );
}
