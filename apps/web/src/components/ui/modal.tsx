'use client';

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, subtitle, children, maxWidth = '560px' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] shadow-xl w-full mx-4 max-h-[85vh] overflow-y-auto" style={{ maxWidth }}>
        <div className="flex items-center justify-between p-5 pb-3 border-b border-[#e5e7eb]">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#181c21]">{title}</h2>
            {subtitle && <p className="text-xs text-[#707882] mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#f3f4f6] flex items-center justify-center transition-colors">
            <X size={18} className="text-[#6b7280]" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
