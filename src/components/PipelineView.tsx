'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Candidate, Stage, STAGES, STAGE_LABELS, STAGE_COLORS } from '@/lib/types';
import { filterCandidates } from '@/lib/candidates';
import CandidateCard from './CandidateCard';
import EmptyState from './EmptyState';

interface PipelineViewProps {
  searchQuery: string;
  stageFilter: Stage | 'all';
  onSelectCandidate: (candidate: Candidate) => void;
  onEditCandidate: (candidate: Candidate) => void;
  onAddCandidate: () => void;
}

export default function PipelineView({
  searchQuery,
  stageFilter,
  onSelectCandidate,
  onEditCandidate,
  onAddCandidate,
}: PipelineViewProps) {
  const { candidates, moveCandidate, lastMove } = useApp();
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);

  // One shot entrance only: the flag flips after first paint, so filtering later
  // never replays the stagger.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const filteredCandidates = filterCandidates(candidates, searchQuery, stageFilter);

  if (candidates.length === 0) {
    return (
      <div className="h-full flex items-center justify-center animate-fadeIn">
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

  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', candidate.id);
  };

  const handleDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    if (draggedCandidate && draggedCandidate.stage !== stage) {
      moveCandidate(draggedCandidate.id, stage);
    }
    setDraggedCandidate(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedCandidate(null);
    setDragOverStage(null);
  };

  const visibleStages = stageFilter === 'all' ? STAGES : [stageFilter];

  return (
    <div className="flex gap-3 h-full pb-4 overflow-x-auto">
      {visibleStages.map((stage, index) => {
        const stageCandidates = filteredCandidates.filter((c) => c.stage === stage);
        const isDragOver = dragOverStage === stage;

        return (
          <div
            key={stage}
            className={`flex-1 min-w-[240px] flex flex-col rounded-lg border transition-colors duration-150 ${
              isDragOver ? 'border-accent bg-accent-soft/50' : 'border-transparent bg-[#eceef1]'
            } ${entered ? 'animate-rise' : ''}`}
            style={entered ? { animationDelay: `${index * 50}ms` } : undefined}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage)}
          >
            {/* Column header */}
            <div className="px-3.5 py-3 border-b border-black/[0.04]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[13px] font-semibold text-ink-soft tracking-tight truncate">
                  {STAGE_LABELS[stage]}
                </h3>
                <span
                  className={`inline-flex items-center justify-center min-w-6 h-6 px-1 rounded-full text-xs font-medium border shrink-0 ${STAGE_COLORS[stage]}`}
                >
                  {stageCandidates.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto px-2.5 pb-2.5 space-y-2.5 min-h-[200px]">
              {stageCandidates.length === 0 ? (
                <div
                  className={`text-center py-8 text-sm rounded-lg border-2 border-dashed ${
                    isDragOver
                      ? 'text-accent border-accent/40 bg-accent-soft/40'
                      : 'text-muted/50 border-line'
                  }`}
                >
                  {isDragOver ? 'Drop it here' : 'Empty'}
                </div>
              ) : (
                stageCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isDragging={draggedCandidate?.id === candidate.id}
                    flash={lastMove?.id === candidate.id}
                    onDragStart={(e) => handleDragStart(e, candidate)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelectCandidate(candidate)}
                    onEdit={() => onEditCandidate(candidate)}
                    onMoveToStage={(stage) => moveCandidate(candidate.id, stage)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
