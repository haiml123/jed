'use client';

import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Camera, Globe, Lock, Bell, ChevronDown } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import Avatar from '@/components/ui/avatar';

export default function ProfilePage() {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [progress, setProgress] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    api.progress.xp().then(d => setXp(d.totalXp)).catch(console.error);
    api.progress.list().then(setProgress).catch(console.error);
    api.lessons.list().then(setLessons).catch(console.error);
  }, []);

  const totalUnits = lessons.reduce((sum: number, l: any) => sum + l.units.length, 0);
  const completedUnits = progress.filter((p: any) => p.quizCompleted).length;
  const userName = user?.email?.split('@')[0] || user?.name || 'Teacher';

  return (
    <div className="p-6">
      <PageHeader label="PROFILE" title="Teacher Profile" />

      <div className="space-y-4 max-w-[1139px]">
        {/* My Progress summary */}
        <div className="bg-white rounded-[14px] p-5">
          <h3 className="font-heading text-[17px] font-semibold text-[#111827] mb-3">My Progress</h3>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-[20px] px-4 py-2 flex items-center gap-2 border border-gray-100">
              <div className="w-2.5 h-5 bg-[#00609b] rounded-full" />
              <span className="text-base font-extrabold text-[#111827] font-heading">{xp}</span>
              <span className="text-[13px] text-[#9ca3af]">XP</span>
            </div>
            <div className="bg-white rounded-[20px] px-4 py-2 flex items-center gap-2 border border-gray-100">
              <span className="text-base font-extrabold text-[#111827] font-heading">{completedUnits}/{totalUnits}</span>
              <span className="text-[13px] text-[#9ca3af]">Lessons</span>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-[20px] p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-[70px] h-[70px] rounded-full border-[3px] border-[#0079c2] flex items-center justify-center overflow-hidden">
                <Avatar
                  src="/assets/shared/jed-icon-profile.png"
                  name={userName}
                  size={56}
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-[#0079c2] rounded-full flex items-center justify-center border-2 border-white">
                <Camera size={12} className="text-white" />
              </div>
            </div>
            <div>
              <h2 className="font-heading text-lg font-extrabold text-[#333]">{userName}</h2>
              <p className="text-xs text-[#6b7280]">JKG Academy</p>
              <p className="text-xs text-[#6b7280]">Role: {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Teacher'}</p>
              <p className="text-[10.5px] text-[#9ca3af] mt-0.5">Member since March 2026</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-[20px] p-6">
          <h3 className="font-heading text-base font-extrabold text-[#333] mb-5">Preferences</h3>
          <div className="space-y-5">
            {/* Email notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-[#6b7280]" />
                <div>
                  <p className="text-xs font-semibold text-[#333]">Email notifications</p>
                  <p className="text-[10.5px] text-[#9ca3af]">Receive updates about your progress</p>
                </div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-[42px] h-[21px] rounded-full relative transition-colors ${emailNotifications ? 'bg-[#0079c2]' : 'bg-gray-300'}`}
              >
                <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[1.5px] transition-all shadow-sm ${emailNotifications ? 'right-[1.5px]' : 'left-[1.5px]'}`} />
              </button>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-[#6b7280]" />
                <div>
                  <p className="text-xs font-semibold text-[#333]">Language</p>
                  <p className="text-[10.5px] text-[#9ca3af]">Choose your preferred language</p>
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
                  <p className="text-xs font-semibold text-[#333]">Change Password</p>
                  <p className="text-[10.5px] text-[#9ca3af]">Update your account password</p>
                </div>
              </div>
              <button className="bg-[#fee2e2] text-[#dc2626] text-sm font-semibold px-4 py-1.5 rounded-2xl hover:bg-red-200 transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="bg-[#ebf4fc] rounded-[20px] px-5 py-3.5">
          <p className="text-xs font-bold text-[#0079c2]">
            Note: Contact your director to update school or lesson assignments.
          </p>
        </div>
      </div>
    </div>
  );
}
