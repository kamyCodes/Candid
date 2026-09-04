'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Candidate, Stage, STAGES, STAGE_LABELS, STAGE_COLORS } from '@/lib/types';
import { filterCandidates } from '@/lib/candidates';
import Avatar from './Avatar';
import StarRating from './StarRating';
import Icon, { IconName } from './Icon';
import EmptyState from './EmptyState';

interface CandidateListProps {
  searchQuery: string;
  stageFilter: Stage | 'all';
  onSelectCandidate: (candidate: Candidate) => void;
  onEditCandidate: (candidate: Candidate) => void;
  onAddCandidate: () => void;
  onClearFilters: () => void;
}

type SortField = 'name' | 'rating' | 'date';
type SortDir = 'asc' | 'desc';

export default function CandidateList({
  searchQuery,
  stageFilter,
  onSelectCandidate,
  onEditCandidate,
  onAddCandidate,
  onClearFilters,
}: CandidateListProps) {
  const { candidates, deleteCandidate, moveCandidate, lastMove } = useApp();
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // One shot entrance only: rows stagger after first paint, not on every filter change.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const filteredCandidates = filterCandidates(candidates, searchQuery, stageFilter).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name) * dir;
      case 'rating':
        return (a.rating - b.rating) * dir;
      case 'date':
      default:
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
    }
  });

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  if (candidates.length === 0) {
    return (
      <div className="py-8 animate-fadeIn">
        <EmptyState
          icon="people"
          title="Build your pipeline"
          description="Add your first candidate and watch them move through each stage of the funnel."
          actionLabel="Add candidate"
          onAction={onAddCandidate}
        />
      </div>
    );
  }

  if (filteredCandidates.length === 0) {
    return (
      <div className="py-8 animate-fadeIn">
        <EmptyState
          icon="search"
          title="No results"
          description="Nothing matches the current search or stage filter."
          actionLabel="Clear filters"
          onAction={onClearFilters}
        />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-line rounded-lg overflow-x-auto shadow-sm">
      <table className="w-full min-w-[760px]">
        <thead className="bg-canvas">
          <tr>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-wider">
              <button onClick={() => toggleSort('name')} className="hover:text-ink">
                Candidate <SortIndicator active={sortBy === 'name'} asc={sortDir === 'asc'} />
              </button>
            </th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-wider">
              Role
            </th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-wider">
              Stage
            </th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-wider">
              <button onClick={() => toggleSort('rating')} className="hover:text-ink">
                Rating <SortIndicator active={sortBy === 'rating'} asc={sortDir === 'asc'} />
              </button>
            </th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-wider">
              <button onClick={() => toggleSort('date')} className="hover:text-ink">
                Added <SortIndicator active={sortBy === 'date'} asc={sortDir === 'asc'} />
              </button>
            </th>
            <th className="text-right px-5 py-3 text-[11px] font-semibold text-muted uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {filteredCandidates.map((candidate, index) => {
            const justMoved = lastMove?.id === candidate.id;
            return (
              <tr
                key={candidate.id}
                className={`cursor-pointer transition-colors duration-150 hover:bg-canvas/70 ${
                  justMoved ? 'animate-row-flash' : ''
                } ${entered ? 'animate-fadeIn' : ''}`}
                style={entered ? { animationDelay: `${Math.min(index * 20, 260)}ms` } : undefined}
                onClick={() => onSelectCandidate(candidate)}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={candidate.name} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{candidate.name}</p>
                      <p className="text-xs text-muted truncate">{candidate.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-ink/80 whitespace-nowrap">{candidate.position}</td>
                <td className="px-5 py-3">
                  <span key={candidate.stage} className="inline-block animate-badge-pop">
                    <select
                      value={candidate.stage}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        moveCandidate(candidate.id, e.target.value as Stage);
                      }}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer ${STAGE_COLORS[candidate.stage]}`}
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {STAGE_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </span>
                </td>
                <td className="px-5 py-3">
                  <StarRating rating={candidate.rating} size="sm" />
                </td>
                <td className="px-5 py-3 text-xs text-muted whitespace-nowrap">
                  {new Date(candidate.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditCandidate(candidate)}
                      className="p-1.5 text-muted hover:text-accent rounded-md hover:bg-accent-soft/60 transition-colors"
                      title="Edit"
                    >
                      <Icon name="edit" className="w-4 h-4" />
                    </button>
                    {confirmDelete === candidate.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            deleteCandidate(candidate.id);
                            setConfirmDelete(null);
                          }}
                          className="px-2 py-1.5 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2 py-1.5 text-muted bg-black/5 rounded-md hover:bg-black/10 transition-colors text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(candidate.id)}
                        className="p-1.5 text-muted hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SortIndicator({ active, asc }: { active: boolean; asc: boolean }) {
  const iconName: IconName = active && asc ? 'chevron-up' : 'chevron-down';
  return (
    <Icon
      name={iconName}
      className={`w-3.5 h-3.5 inline-block ml-1 align-[-1px] ${active ? 'text-accent' : 'text-muted/40'}`}
    />
  );
}
