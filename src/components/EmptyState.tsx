'use client';

import Icon, { IconName } from './Icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="mx-auto w-full max-w-md bg-surface border border-line rounded-xl px-8 py-14 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-lg bg-canvas border border-line flex items-center justify-center mb-4">
        <Icon name={icon} className="w-6 h-6 text-muted" />
      </div>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-muted mt-1.5 leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-deep active:translate-y-px transition-colors"
        >
          <Icon name="plus" className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
