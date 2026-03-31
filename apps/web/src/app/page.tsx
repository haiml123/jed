'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (user.role === 'DIRECTOR') router.replace('/director');
    else if (user.role === 'ADMIN') router.replace('/admin');
    else router.replace('/home');
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
