'use client';

import { useApp } from '@/lib/AppContext';
import { STAGES, STAGE_LABELS } from '@/lib/types';

export default function StatsBar() {
  const { candidates } = useApp();

  const total = candidates.length;
  const active = candidates.filter((c) => !['accepted', 'rejected'].includes(c.stage)).length;
  const avgRating = total > 0 ? (candidates.reduce((sum, c) => sum + c.rating, 0) / total).toFixed(1) : '0.0';

  const topStage = STAGES.reduce(
    (max, stage) => {
      const count = candidates.filter((c) => c.stage === stage).length;
      return count > max.count ? { stage, count } : max;
    },
    { stage: 'applied' as string, count: 0 }
  );

  const stats = [
    { label: 'Total', value: String(total) },
    { label: 'In play', value: String(active) },
    { label: 'Avg rating', value: avgRating },
    {
      label: 'Busiest stage',
      value: topStage.count > 0 ? `${STAGE_LABELS[topStage.stage as keyof typeof STAGE_LABELS]} (${topStage.count})` : 'None yet',
    },
  ];

  return (
    <div className="bg-surface border-y border-line overflow-x-auto">
      <div className="flex min-w-max divide-x divide-line">
        {stats.map(({ label, value }) => (
          <div key={label} className="px-5 sm:px-8 py-3">
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted whitespace-nowrap">{label}</p>
            <p className="text-sm font-semibold text-ink mt-0.5 whitespace-nowrap tabular-nums">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
