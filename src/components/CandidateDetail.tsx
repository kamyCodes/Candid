'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import {
  Candidate,
  Stage,
  STAGES,
  STAGE_LABELS,
  STAGE_COLORS,
  EXPERIENCE_LEVELS,
  CANDIDATE_SOURCES,
} from '@/lib/types';
import Avatar from './Avatar';
import StarRating from './StarRating';
import Icon, { IconName } from './Icon';

interface CandidateDetailProps {
  candidateId: string;
  onClose: () => void;
  onEdit: (candidate: Candidate) => void;
}

export default function CandidateDetail({ candidateId, onClose, onEdit }: CandidateDetailProps) {
  const { candidates, moveCandidate, addNote, updateRating, deleteCandidate } = useApp();
  const candidate = candidates.find((c) => c.id === candidateId);

  const [noteContent, setNoteContent] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);
  const [tab, setTab] = useState<'notes' | 'info'>('notes');

  if (!candidate) return null;

  const handleAddNote = () => {
    const content = noteContent.trim();
    if (!content || content.length < 5) {
      setNoteError('Notes need at least 5 characters');
      return;
    }
    setNoteError(null);
    addNote(candidate.id, content, noteAuthor.trim() || 'Anonymous');
    setNoteContent('');
    setNoteAuthor('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAddNote();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40 animate-fade" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={candidate.name} size="lg" />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-ink tracking-tight truncate">{candidate.name}</h2>
                <p className="text-sm text-muted truncate">{candidate.position}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted hover:text-ink rounded-md hover:bg-black/5 transition-colors"
              title="Close"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-5 py-3 border-b border-line flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(candidate)}
              className="px-3 py-1.5 text-xs font-medium text-ink border border-line rounded-md hover:bg-canvas transition-colors"
            >
              Edit
            </button>
            <span key={candidate.stage} className="inline-block animate-badge-pop">
              <select
                value={candidate.stage}
                onChange={(e) => moveCandidate(candidate.id, e.target.value as Stage)}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-full border cursor-pointer ${STAGE_COLORS[candidate.stage]}`}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </span>
          </div>
          <button
            onClick={() => {
              if (confirm('Remove this candidate from the pipeline?')) {
                deleteCandidate(candidate.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>

        {/* Rating */}
        <div className="px-5 py-3.5 border-b border-line flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.1em] text-muted font-semibold">Rating</span>
          <StarRating
            rating={candidate.rating}
            size="md"
            onChange={(rating) => updateRating(candidate.id, rating)}
          />
        </div>

        {/* Tabs */}
        <div className="flex px-4 border-b border-line">
          {(['notes', 'info'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? 'text-accent border-accent'
                  : 'text-muted border-transparent hover:text-ink'
              }`}
            >
              {t === 'notes' ? `Notes (${candidate.notes.length})` : 'Details'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'notes' ? (
            <div className="p-5 space-y-4">
              {/* Add note */}
              <div className="bg-canvas border border-line rounded-lg p-3.5 space-y-2.5">
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 text-sm bg-white border border-line rounded-md placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/60"
                />
                <div className="relative">
                  <textarea
                    placeholder="Add a note. Cmd/Ctrl + Enter to save"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={3}
                    maxLength={2000}
                    className="w-full px-3 py-2 pr-14 text-sm bg-white border border-line rounded-md placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/60 resize-none"
                  />
                  <span className="absolute bottom-2.5 right-3 text-xs text-muted">
                    {noteContent.length}/2000
                  </span>
                </div>
                {noteError && <p className="text-xs text-red-600">{noteError}</p>}
                <div className="flex items-center justify-end">
                  <button
                    onClick={handleAddNote}
                    disabled={!noteContent.trim()}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-deep disabled:bg-muted/30 disabled:cursor-not-allowed transition-colors"
                  >
                    Save note
                  </button>
                </div>
              </div>

              {/* Note list */}
              {candidate.notes.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-11 h-11 rounded-lg bg-canvas border border-line flex items-center justify-center mx-auto mb-3">
                    <Icon name="note" className="w-5 h-5 text-muted" />
                  </div>
                  <p className="text-sm text-muted">No notes yet. First impressions, call summaries, red flags. Anything worth remembering.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...candidate.notes].reverse().map((note) => (
                    <div key={note.id} className="bg-white border border-line rounded-lg p-3.5 animate-rise">
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <span className="text-xs font-semibold text-ink truncate">{note.author}</span>
                        <span className="text-[11px] text-muted whitespace-nowrap">
                          {new Date(note.createdAt).toLocaleDateString()}{' '}
                          {new Date(note.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-ink/80 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <InfoRow icon="email" label="Email" value={candidate.email} />
              <InfoRow icon="phone" label="Phone" value={candidate.phone || 'Not shared'} />
              <InfoRow
                icon="linkedin"
                label="LinkedIn"
                value={candidate.linkedIn || 'Not shared'}
                link={!!candidate.linkedIn}
              />
              <InfoRow icon="briefcase" label="Role" value={candidate.position} />
              <InfoRow
                icon="chart"
                label="Experience"
                value={EXPERIENCE_LEVELS.find((l) => l.value === candidate.experienceLevel)?.label || 'Not specified'}
              />
              <InfoRow
                icon="globe"
                label="Found via"
                value={CANDIDATE_SOURCES.find((s) => s.value === candidate.source)?.label || 'Not specified'}
              />
              <InfoRow icon="arrow-right" label="Stage" value={STAGE_LABELS[candidate.stage]} />
              <InfoRow icon="calendar" label="Added" value={new Date(candidate.createdAt).toLocaleDateString()} />
              <InfoRow icon="clock" label="Last touch" value={new Date(candidate.updatedAt).toLocaleDateString()} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function InfoRow({
  label,
  value,
  icon,
  link = false,
}: {
  label: string;
  value: string;
  icon: IconName;
  link?: boolean;
}) {
  const isPlaceholder = value === 'Not shared' || value === 'Not specified';

  return (
    <div className="flex items-center gap-3.5">
      <div className="w-9 h-9 rounded-lg bg-canvas border border-line flex items-center justify-center shrink-0">
        <Icon name={icon} className="w-4 h-4 text-muted" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted">{label}</p>
        {link && !isPlaceholder ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-accent hover:text-accent-deep underline decoration-accent/30 underline-offset-2 truncate block"
          >
            {value}
          </a>
        ) : (
          <p className={`text-sm truncate ${isPlaceholder ? 'text-muted/70 italic' : 'font-medium text-ink'}`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
