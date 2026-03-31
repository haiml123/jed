'use client';

export default function PawBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden>
      <svg className="absolute top-8 right-12 w-24 h-24 text-[#dfe2e9] opacity-40 rotate-[-15deg]" viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="65" rx="25" ry="20" />
        <ellipse cx="30" cy="35" rx="10" ry="13" transform="rotate(-15 30 35)" />
        <ellipse cx="70" cy="35" rx="10" ry="13" transform="rotate(15 70 35)" />
        <ellipse cx="18" cy="52" rx="8" ry="11" transform="rotate(-30 18 52)" />
        <ellipse cx="82" cy="52" rx="8" ry="11" transform="rotate(30 82 52)" />
      </svg>
      <svg className="absolute bottom-20 left-8 w-16 h-16 text-[#dfe2e9] opacity-30 rotate-[25deg]" viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="65" rx="25" ry="20" />
        <ellipse cx="30" cy="35" rx="10" ry="13" transform="rotate(-15 30 35)" />
        <ellipse cx="70" cy="35" rx="10" ry="13" transform="rotate(15 70 35)" />
        <ellipse cx="18" cy="52" rx="8" ry="11" transform="rotate(-30 18 52)" />
        <ellipse cx="82" cy="52" rx="8" ry="11" transform="rotate(30 82 52)" />
      </svg>
      <svg className="absolute top-1/2 right-1/4 w-20 h-20 text-[#dfe2e9] opacity-25 rotate-[45deg]" viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="65" rx="25" ry="20" />
        <ellipse cx="30" cy="35" rx="10" ry="13" transform="rotate(-15 30 35)" />
        <ellipse cx="70" cy="35" rx="10" ry="13" transform="rotate(15 70 35)" />
        <ellipse cx="18" cy="52" rx="8" ry="11" transform="rotate(-30 18 52)" />
        <ellipse cx="82" cy="52" rx="8" ry="11" transform="rotate(30 82 52)" />
      </svg>
      <svg className="absolute bottom-8 right-8 w-12 h-12 text-[#dfe2e9] opacity-35 rotate-[-35deg]" viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="65" rx="25" ry="20" />
        <ellipse cx="30" cy="35" rx="10" ry="13" transform="rotate(-15 30 35)" />
        <ellipse cx="70" cy="35" rx="10" ry="13" transform="rotate(15 70 35)" />
        <ellipse cx="18" cy="52" rx="8" ry="11" transform="rotate(-30 18 52)" />
        <ellipse cx="82" cy="52" rx="8" ry="11" transform="rotate(30 82 52)" />
      </svg>
      <svg className="absolute top-32 left-1/3 w-14 h-14 text-[#dfe2e9] opacity-20 rotate-[60deg]" viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="65" rx="25" ry="20" />
        <ellipse cx="30" cy="35" rx="10" ry="13" transform="rotate(-15 30 35)" />
        <ellipse cx="70" cy="35" rx="10" ry="13" transform="rotate(15 70 35)" />
        <ellipse cx="18" cy="52" rx="8" ry="11" transform="rotate(-30 18 52)" />
        <ellipse cx="82" cy="52" rx="8" ry="11" transform="rotate(30 82 52)" />
      </svg>
    </div>
  );
}
