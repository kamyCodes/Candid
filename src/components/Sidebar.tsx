'use client';

import { Candidate, STAGES, STAGE_LABELS, STAGE_COLORS } from '@/lib/types';
import Icon, { IconName } from './Icon';

interface SidebarProps {
  activeTab: 'dashboard' | 'activity';
  onTabChange: (tab: 'dashboard' | 'activity') => void;
  candidates: Candidate[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}

const NAV_ITEMS: { tab: 'dashboard' | 'activity'; label: string; icon: IconName }[] = [
  { tab: 'dashboard', label: 'Pipeline', icon: 'grid' },
  { tab: 'activity', label: 'Activity', icon: 'clock' },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  candidates,
  collapsed = false,
  onToggleCollapse,
  onClose,
}: SidebarProps) {
  const stageCounts = STAGES.reduce((acc, stage) => {
    acc[stage] = candidates.filter((c) => c.stage === stage).length;
    return acc;
  }, {} as Record<string, number>);

  const isRail = collapsed && !onClose;

  return (
    <aside
      className={`h-full flex flex-col bg-ink-deep text-stone-300 ${
        onClose
          ? 'h-full w-72 max-w-[85vw] animate-slideInLeft'
          : isRail
            ? 'w-[68px] shrink-0 transition-[width] duration-200'
            : 'w-64 shrink-0'
      }`}
    >
      {/* Brand */}
      <div className={`flex items-center h-16 border-b border-white/[0.07] ${isRail ? 'justify-center px-0' : 'gap-3 px-5'}`}>
        {isRail ? (
          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center shrink-0" title="Candid">
            <span className="text-white font-bold text-base leading-none">C</span>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-base leading-none">C</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold leading-tight tracking-tight">Candid</p>
              <p className="text-[11px] text-stone-400">Hiring pipeline</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Close menu"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="px-2.5 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ tab, label, icon }) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            title={isRail ? label : undefined}
            className={`flex items-center gap-3 rounded-md text-sm font-medium transition-colors ${
              isRail ? 'justify-center py-2.5' : 'px-3 py-2'
            } ${
              activeTab === tab
                ? 'bg-white/[0.08] text-white'
                : 'text-stone-400 hover:text-stone-100 hover:bg-white/[0.05]'
            }`}
          >
            <Icon name={icon} className="w-[18px] h-[18px] shrink-0" />
            {!isRail && label}
            {!isRail && activeTab === tab && (
              <span className="w-1 h-1 rounded-full bg-accent ml-auto" />
            )}
          </button>
        ))}
      </nav>

      {/* Pipeline overview */}
      {!isRail && (
        <div className="px-2.5 pt-4 pb-3 border-t border-white/[0.07]">
          <p className="px-3 pb-2 text-[11px] font-semibold text-stone-500 uppercase tracking-[0.12em]">
            Pipeline
          </p>
          <div className="space-y-px">
            {STAGES.map((stage) => (
              <div
                key={stage}
                className="flex items-center justify-between px-3 py-1.5 rounded-md text-sm"
              >
                <span className="text-stone-400">{STAGE_LABELS[stage]}</span>
                <span
                  className={`inline-flex items-center justify-center min-w-6 h-6 px-1 rounded-full text-xs font-medium border ${STAGE_COLORS[stage]}`}
                >
                  {stageCounts[stage] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto border-t border-white/[0.07]">
        {onToggleCollapse ? (
          <>
            <button
              onClick={onToggleCollapse}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={`w-full flex items-center gap-3 text-stone-400 hover:text-white hover:bg-white/[0.05] transition-colors ${
                isRail ? 'justify-center py-4' : 'px-5 py-3.5 text-xs font-medium'
              }`}
            >
              <Icon name={collapsed ? 'chevrons-right' : 'chevrons-left'} className="w-4 h-4 shrink-0" />
              {!isRail && 'Collapse'}
            </button>
            {!collapsed && (
              <p className="px-5 pb-4 pt-0.5 text-[11px] leading-snug text-stone-500">
                Saved locally in your browser
              </p>
            )}
          </>
        ) : (
          !isRail && (
            <p className="px-5 py-4 text-[11px] leading-snug text-stone-500">
              Saved locally in your browser
            </p>
          )
        )}
      </div>
    </aside>
  );
}
