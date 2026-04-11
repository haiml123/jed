'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Bell, Globe, Lock, Camera, ChevronDown } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import Avatar from '@/components/ui/avatar';

/* ------------------------------------------------------------------ */
/*  Admin Profile — matches Figma admin-profile-desktop.png            */
/* ------------------------------------------------------------------ */

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);

  const userName = user?.name || user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="p-4 md:p-6">
      <PageHeader label="PROFILE" title="Admin Profile" />

      <div className="space-y-4 max-w-[1139px]">
        {/* ---- User Info Card ---- */}
        <div className="bg-white rounded-[20px] p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-[70px] h-[70px] rounded-full border-[3px] border-[#0079c2] flex items-center justify-center overflow-hidden">
                <Avatar
                  src={user?.avatarUrl || '/assets/shared/jed-icon-profile.png'}
                  name={userName}
                  size={56}
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-[#0079c2] rounded-full flex items-center justify-center border-2 border-white">
                <Camera size={12} className="text-white" />
              </div>
            </div>
            <div>
              <h2 className="font-heading text-lg font-extrabold text-[#333]">
                {userName}
              </h2>
              <p className="text-xs text-[#6b7280]">JKG Academy</p>
              <p className="text-xs text-[#6b7280]">Role: Admin</p>
              <p className="text-[10.5px] text-[#9ca3af] mt-0.5">
                Member since March 2026
              </p>
            </div>
          </div>
        </div>

        {/* ---- Preferences Card ---- */}
        <div className="bg-white rounded-[20px] p-6">
          <h3 className="font-heading text-base font-extrabold text-[#333] mb-5">
            Preferences
          </h3>
          <div className="space-y-5">
            {/* Email notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-[#6b7280]" />
                <div>
                  <p className="text-xs font-semibold text-[#333]">
                    Email notifications
                  </p>
                  <p className="text-[10.5px] text-[#9ca3af]">
                    Receive updates about your progress
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-[42px] h-[21px] rounded-full relative transition-colors ${
                  emailNotifications ? 'bg-[#0079c2]' : 'bg-gray-300'
                }`}
                aria-label="Toggle email notifications"
              >
                <div
                  className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[1.5px] transition-all shadow-sm ${
                    emailNotifications ? 'right-[1.5px]' : 'left-[1.5px]'
                  }`}
                />
              </button>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-[#6b7280]" />
                <div>
                  <p className="text-xs font-semibold text-[#333]">Language</p>
                  <p className="text-[10.5px] text-[#9ca3af]">
                    Choose your preferred language
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-[11px] font-semibold text-[#374151]">
                English <ChevronDown size={9} />
              </button>
            </div>

            {/* Change Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-[#6b7280]" />
                <div>
                  <p className="text-xs font-semibold text-[#333]">
                    Change Password
                  </p>
                  <p className="text-[10.5px] text-[#9ca3af]">
                    Update your account password
                  </p>
                </div>
              </div>
              <button className="bg-[#fee2e2] text-[#dc2626] text-sm font-semibold px-4 py-1.5 rounded-2xl hover:bg-red-200 transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
