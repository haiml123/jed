'use client';

interface PageHeaderProps {
  label: string;
  title: string;
  labelColor?: string;
}

export default function PageHeader({ label, title, labelColor = '#00609b' }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <p className="text-base font-bold font-heading mb-1" style={{ color: labelColor }}>{label}</p>
      <h1 className="font-heading text-[48px] leading-tight font-normal text-[#181c21]">{title}</h1>
    </div>
  );
}
