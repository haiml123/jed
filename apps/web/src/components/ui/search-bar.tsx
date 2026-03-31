'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-4 rounded-full border border-[#e5e7eb] bg-white text-sm text-[#333] placeholder:text-[#9ca3af] focus:border-[#00609b] focus:ring-1 focus:ring-[#00609b]/20 outline-none transition-colors"
      />
    </div>
  );
}
