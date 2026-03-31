'use client';

import Image from 'next/image';

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}

const COLORS = ['#00609b', '#982d94', '#2f6c00', '#dc2626', '#f59e0b', '#6366f1'];

export default function Avatar({ src, name, size = 40, className = '' }: AvatarProps) {
  const colorIndex = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % COLORS.length;
  const bg = COLORS[colorIndex];
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-heading font-bold ${className}`}
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
