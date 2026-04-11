'use client';

import { ReactNode } from 'react';

export interface TabNavItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabNavProps {
  items: TabNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Rounded-pill tab nav used for multi-step wizards (Create/Edit Lesson):
 * Details / Video / Quiz / Add Teachers.
 *
 * Matches Figma: 343:14370, 346:17596
 */
export default function TabNav({ items, activeId, onChange, className = '' }: TabNavProps) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {items.map(tab => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-colors ${
              active
                ? 'bg-[#00609b] text-white'
                : 'bg-[#eff6ff] text-[#1a6ebf] hover:bg-[#dbeafe]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
