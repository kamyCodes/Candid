'use client';

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASS: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-10 h-10 text-xs',
};

export default function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`${SIZE_CLASS[size]} rounded-full bg-[#e7eaee] text-ink-soft font-semibold flex items-center justify-center shrink-0`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
