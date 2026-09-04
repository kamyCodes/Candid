'use client';

import { Candidate, Stage, STAGES } from '@/lib/types';
import Avatar from './Avatar';
import StarRating from './StarRating';
import Icon from './Icon';

interface CandidateCardProps {
  candidate: Candidate;
  isDragging: boolean;
  /** True right after this candidate moved to a new stage, to flash the card. */
  flash?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onClick: () => void;
  onEdit: () => void;
  onMoveToStage: (stage: Stage) => void;
}

export default function CandidateCard({
  candidate,
  isDragging,
  flash = false,
  onDragStart,
  onDragEnd,
  onClick,
  onEdit,
  onMoveToStage,
}: CandidateCardProps) {
  const currentStageIndex = STAGES.indexOf(candidate.stage);
  const canGoBack = currentStageIndex > 0;
  const canGoForward = currentStageIndex < STAGES.length - 1;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group bg-surface rounded-lg border border-line p-3 cursor-pointer transition-[transform,box-shadow,border-color] duration-150 ease-out hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-[0_10px_20px_-8px_rgba(23,26,31,0.25)] ${
        isDragging ? 'opacity-50 shadow-lg rotate-1' : ''
      } ${flash ? 'animate-card-flash' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={candidate.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{candidate.name}</p>
            <p className="text-xs text-muted truncate">{candidate.position}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 text-muted hover:text-ink rounded opacity-0 group-hover:opacity-100 hover:bg-black/5 transition-all"
          title="Edit candidate"
        >
          <Icon name="more" className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <StarRating rating={candidate.rating} size="xs" />
        <div className="flex items-center gap-1.5">
          {candidate.notes.length > 0 && (
            <span className="text-xs text-muted flex items-center gap-1">
              <Icon name="note" className="w-3 h-3" />
              {candidate.notes.length}
            </span>
          )}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canGoBack) onMoveToStage(STAGES[currentStageIndex - 1]);
              }}
              disabled={!canGoBack}
              className="p-1 text-muted hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
              title="Move back a stage"
            >
              <Icon name="chevron-left" className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canGoForward) onMoveToStage(STAGES[currentStageIndex + 1]);
              }}
              disabled={!canGoForward}
              className="p-1 text-muted hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
              title="Move forward a stage"
            >
              <Icon name="chevron-right" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
