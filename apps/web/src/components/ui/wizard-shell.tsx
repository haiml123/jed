'use client';

import { ReactNode } from 'react';
import TabNav, { TabNavItem } from './tab-nav';

interface WizardShellProps {
  label: string; // Breadcrumb label, e.g. "LESSONS > EDIT LESSON"
  title: string; // Big page title, e.g. "Edit Lesson Details"
  tabs: TabNavItem[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  children: ReactNode;
  /** Footer actions (Cancel / Save as Draft / Update Lesson etc.) */
  footer?: ReactNode;
}

/**
 * Full-page wizard shell used for Create/Edit Lesson, Create/Edit User, etc.
 * Matches Figma pattern from 343:14944 (Add Lesson), 343:14370 (Edit Lesson).
 *
 * Layout:
 *   - Breadcrumb label (blue, uppercase)
 *   - Big title (Plus Jakarta Sans, 48px)
 *   - Tab nav (pill tabs)
 *   - Form card (rounded-panel, white)
 *   - Footer actions (right-aligned)
 */
export default function WizardShell({
  label,
  title,
  tabs,
  activeTabId,
  onTabChange,
  children,
  footer,
}: WizardShellProps) {
  return (
    <div className="p-4 md:p-6 max-w-[1200px]">
      <div className="mb-6">
        <p className="text-[12px] font-bold font-heading text-[#00609b] tracking-wider uppercase mb-1">
          {label}
        </p>
        <h1 className="font-heading text-3xl md:text-[48px] leading-tight font-normal text-[#181c21]">
          {title}
        </h1>
      </div>

      <TabNav items={tabs} activeId={activeTabId} onChange={onTabChange} className="mb-6" />

      <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm">
        {children}
      </div>

      {footer && (
        <div className="flex items-center justify-end gap-3 mt-6">
          {footer}
        </div>
      )}
    </div>
  );
}
