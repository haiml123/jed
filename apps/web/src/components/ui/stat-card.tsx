'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  badge?: string;
  badgeColor?: string;
  progress?: number;
  progressColor?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  color = '#00609b',
  badge,
  badgeColor = '#2f6c00',
  progress,
  progressColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-[32px] p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <div className="w-[40px] h-[40px] rounded-2xl flex items-center justify-center" style={{ backgroundColor: color }}>
            {icon}
          </div>
        )}
        {badge && (
          <span className="text-xs font-bold" style={{ color: badgeColor }}>{badge}</span>
        )}
      </div>
      <p className="text-sm font-bold text-[#707882] tracking-wide uppercase">{label}</p>
      <p className="text-4xl font-extrabold font-heading" style={{ color: color === '#2f6c00' ? color : '#181c21' }}>{value}</p>
      {progress !== undefined && (
        <div className="w-full bg-[#e5e8ef] rounded-full h-2 mt-2">
          <div
            className="rounded-full h-2 transition-all"
            style={{ width: `${progress}%`, backgroundColor: progressColor || color }}
          />
        </div>
      )}
    </div>
  );
}
