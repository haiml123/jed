'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { PageHeader, Avatar } from '@/components/ui';
import { Mail, Globe, Lock } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Director Profile — matches Figma 31                                */
/* ------------------------------------------------------------------ */

export default function DirectorProfilePage() {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  return (
    <div className="p-8 max-w-3xl">
      {/* ---- Page Header ---- */}
      <PageHeader label="PROFILE" title="Director Profile" />

      {/* ---- Profile Card ---- */}
      <div className="bg-white rounded-[20px] border border-[#e5e7eb] p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name || 'Director'} size={64} />
          <div>
            <h2 className="text-xl font-bold text-[#181c21] font-heading">{user?.name || 'Helena Vance'}</h2>
            <p className="text-sm text-[#707882]">{user?.email || 'helenavance@email.com'}</p>
            <p className="text-xs text-[#9ca3af] mt-0.5 capitalize">{user?.role?.toLowerCase() || 'School Director'}</p>
          </div>
        </div>
      </div>

      {/* ---- Preferences ---- */}
      <div className="bg-white rounded-[20px] border border-[#e5e7eb] p-6">
        <h3 className="text-sm font-bold text-[#181c21] mb-5">Preferences</h3>

        {/* Email notifications toggle */}
        <div className="flex items-center justify-between py-4 border-b border-[#f3f4f6]">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-[#707882]" />
            <span className="text-sm text-[#374151]">Email notifications</span>
          </div>
          <button
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`w-11 h-6 rounded-full transition-colors relative ${emailNotifications ? 'bg-[#00609b]' : 'bg-[#d1d5db]'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${emailNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between py-4 border-b border-[#f3f4f6]">
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-[#707882]" />
            <span className="text-sm text-[#374151]">Language</span>
          </div>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="text-sm text-[#374151] bg-transparent border-none outline-none cursor-pointer text-right"
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>Hebrew</option>
          </select>
        </div>

        {/* Change Password */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-[#707882]" />
            <span className="text-sm text-[#374151]">Change Password</span>
          </div>
          <button className="text-sm font-semibold text-[#dc2626] hover:underline">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
