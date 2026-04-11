'use client';

import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
  error?: string;
}

/**
 * Standard form field wrapper: label + input slot + optional hint/error.
 * Matches the pill-shaped inputs used in the admin CRUD forms
 * (Add User, Add Lesson, etc.) — see Figma 314:7768, 343:14370.
 */
export default function FormField({ label, required, children, hint, error }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#374151]">
        {label}
        {required && <span className="text-[#dc2626] ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-[#9ca3af]">{hint}</p>}
      {error && <p className="text-[11px] text-[#dc2626]">{error}</p>}
    </div>
  );
}

/**
 * Standard pill-shaped text input matching Figma admin forms.
 */
export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full h-11 px-4 rounded-full border border-[#e5e7eb] bg-white text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#00609b] focus:ring-1 focus:ring-[#00609b]/20 outline-none transition-colors ${className}`}
    />
  );
}

/**
 * Standard textarea matching admin form style.
 */
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full px-4 py-3 rounded-[20px] border border-[#e5e7eb] bg-white text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#00609b] focus:ring-1 focus:ring-[#00609b]/20 outline-none transition-colors resize-none ${className}`}
    />
  );
}
