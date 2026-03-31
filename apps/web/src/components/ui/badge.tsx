'use client';

type BadgeVariant = 'required' | 'optional' | 'mandatory' | 'locked' | 'active' | 'draft' | 'inProgress' | 'completed' | 'director' | 'admin' | 'teacher';

const VARIANTS: Record<BadgeVariant, { bg: string; text: string }> = {
  required: { bg: '#dc2626', text: '#ffffff' },
  mandatory: { bg: '#d0e4ff', text: '#004a79' },
  optional: { bg: '#f3e8ff', text: '#982d94' },
  locked: { bg: '#e5e7eb', text: '#707882' },
  active: { bg: '#dcfce7', text: '#166534' },
  draft: { bg: '#fef3c7', text: '#92400e' },
  inProgress: { bg: '#dbeafe', text: '#1e40af' },
  completed: { bg: '#dcfce7', text: '#166534' },
  director: { bg: '#dbeafe', text: '#00609b' },
  admin: { bg: '#fee2e2', text: '#dc2626' },
  teacher: { bg: '#dcfce7', text: '#2f6c00' },
};

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  const { bg, text } = VARIANTS[variant];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${className}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {children}
    </span>
  );
}
