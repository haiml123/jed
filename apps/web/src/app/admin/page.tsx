'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui';
import { Users, BookOpen, FolderOpen } from 'lucide-react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Admin Dashboard — hub linking to Users, Lessons, Groups            */
/* ------------------------------------------------------------------ */

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [lessonCount, setLessonCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);

  useEffect(() => {
    api.users.list().then(u => setUserCount(u.length)).catch(console.error);
    api.lessons.list().then(l => setLessonCount(l.length)).catch(console.error);
    api.groups.list().then(g => setGroupCount(g.length)).catch(console.error);
  }, []);

  const cards = [
    {
      label: 'Total Users',
      value: userCount,
      icon: Users,
      href: '/admin/users',
      gradient: 'linear-gradient(135deg, #00609b 0%, #004a79 100%)',
    },
    {
      label: 'Total Lessons',
      value: lessonCount,
      icon: BookOpen,
      href: '/admin/lessons',
      gradient: 'linear-gradient(135deg, #0e9aa7 0%, #0c8491 100%)',
    },
    {
      label: 'Total Groups',
      value: groupCount,
      icon: FolderOpen,
      href: '/admin/groups',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    },
  ];

  return (
    <div className="p-8">
      {/* ---- Page Header ---- */}
      <PageHeader label="DASHBOARD" title="Admin Dashboard" />

      {/* ---- Stat Cards ---- */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {cards.map(c => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-[32px] p-6 text-white hover:shadow-lg transition-shadow group"
            style={{ background: c.gradient }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <c.icon size={20} className="text-white" />
              </div>
            </div>
            <p className="text-xs font-bold tracking-widest uppercase opacity-80 mb-1">{c.label}</p>
            <p className="text-[42px] font-extrabold font-heading leading-none">{c.value}</p>
            <p className="text-xs opacity-60 mt-2 group-hover:opacity-80 transition-opacity">Click to manage &rarr;</p>
          </Link>
        ))}
      </div>

      {/* ---- Quick Actions ---- */}
      <div className="bg-white rounded-[20px] border border-[#e5e7eb] p-6">
        <h3 className="text-sm font-bold text-[#181c21] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <Link href="/admin/users" className="flex items-center gap-3 p-4 rounded-xl border border-[#e5e7eb] hover:border-[#00609b] hover:bg-[#f0f7ff] transition-colors">
            <Users size={18} className="text-[#00609b]" />
            <span className="text-sm font-medium text-[#374151]">Manage Users</span>
          </Link>
          <Link href="/admin/lessons" className="flex items-center gap-3 p-4 rounded-xl border border-[#e5e7eb] hover:border-[#00609b] hover:bg-[#f0f7ff] transition-colors">
            <BookOpen size={18} className="text-[#00609b]" />
            <span className="text-sm font-medium text-[#374151]">Manage Lessons</span>
          </Link>
          <Link href="/admin/groups" className="flex items-center gap-3 p-4 rounded-xl border border-[#e5e7eb] hover:border-[#00609b] hover:bg-[#f0f7ff] transition-colors">
            <FolderOpen size={18} className="text-[#00609b]" />
            <span className="text-sm font-medium text-[#374151]">Manage Groups</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
