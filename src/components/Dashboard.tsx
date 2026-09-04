'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Candidate, Stage, STAGES, STAGE_LABELS } from '@/lib/types';
import Sidebar from './Sidebar';
import CandidateList from './CandidateList';
import PipelineView from './PipelineView';
import CandidateModal from './CandidateModal';
import CandidateDetail from './CandidateDetail';
import StatsBar from './StatsBar';
import Toast from './Toast';
import EmptyState from './EmptyState';
import Icon, { IconName } from './Icon';

export type ViewMode = 'pipeline' | 'list';
type Tab = 'dashboard' | 'activity';

export default function Dashboard() {
  const { candidates, isLoaded } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  };

  const openAddModal = () => setShowAddModal(true);
  const clearFilters = () => {
    setSearchQuery('');
    setStageFilter('all');
  };

  const isBoardView = activeTab === 'dashboard' && viewMode === 'pipeline';

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-dvh bg-canvas">
        <div className="text-sm text-muted">Loading</div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas text-ink">
      {/* Desktop sidebar (hidden below lg, where the drawer takes over) */}
      <div className="hidden lg:block h-full">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          candidates={candidates}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 animate-fade" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute inset-y-0 left-0">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} candidates={candidates} onClose={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-2 -ml-2 text-muted hover:text-ink hover:bg-black/5 rounded-md transition-colors"
                title="Open menu"
              >
                <Icon name="menu" className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-ink truncate">
                  {activeTab === 'dashboard' ? 'Pipeline' : 'Activity log'}
                </h1>
                <p className="text-xs sm:text-[13px] text-muted mt-0.5 truncate">
                  {activeTab === 'dashboard'
                    ? `${candidates.length} candidate${candidates.length !== 1 ? 's' : ''} in play`
                    : 'Recent moves, notes, and updates'}
                </p>
              </div>
            </div>

            {activeTab === 'dashboard' && (
              <button
                onClick={openAddModal}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent-deep active:translate-y-px transition-colors"
              >
                <Icon name="plus" className="w-4 h-4" />
                <span className="hidden min-[420px]:inline">Add candidate</span>
                <span className="min-[420px]:hidden">Add</span>
              </button>
            )}
          </div>

          {/* Filters */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-sm w-full">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search by name, email, or role"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-line rounded-lg text-sm placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/60 transition-shadow"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-2">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value as Stage | 'all')}
                  className="px-3 py-2 bg-white border border-line rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/60 cursor-pointer"
                >
                  <option value="all">All stages</option>
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {STAGE_LABELS[stage]}
                    </option>
                  ))}
                </select>

                <div className="flex bg-black/[0.06] rounded-lg p-0.5 ml-auto sm:ml-0">
                  <button
                    onClick={() => setViewMode('pipeline')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                      viewMode === 'pipeline'
                        ? 'bg-white text-ink shadow-sm font-medium'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    Kanban
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-ink shadow-sm font-medium'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Stats */}
        {activeTab === 'dashboard' && <StatsBar />}

        {/* Content */}
        {isBoardView ? (
          <main className="flex-1 min-h-0 overflow-hidden px-4 sm:px-6 lg:px-8">
            <div key={viewMode} className="h-full py-4 animate-fadeIn">
              <PipelineView
                searchQuery={searchQuery}
                stageFilter={stageFilter}
                onSelectCandidate={setSelectedCandidate}
                onEditCandidate={setEditingCandidate}
                onAddCandidate={openAddModal}
              />
            </div>
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
            <div key={`${activeTab}-${viewMode}`} className="animate-fadeIn">
              {activeTab === 'dashboard' ? (
                <CandidateList
                  searchQuery={searchQuery}
                  stageFilter={stageFilter}
                  onSelectCandidate={setSelectedCandidate}
                  onEditCandidate={setEditingCandidate}
                  onAddCandidate={openAddModal}
                  onClearFilters={clearFilters}
                />
              ) : (
                <ActivityLog />
              )}
            </div>
          </main>
        )}
      </div>

      {/* Add modal */}
      {showAddModal && (
        <CandidateModal onClose={() => setShowAddModal(false)} onSaved={() => setToastMessage('Candidate added')} />
      )}

      {/* Edit modal */}
      {editingCandidate && (
        <CandidateModal
          candidate={editingCandidate}
          onClose={() => setEditingCandidate(null)}
          onSaved={() => setToastMessage('Candidate updated')}
        />
      )}

      {/* Detail panel */}
      {selectedCandidate && (
        <CandidateDetail
          candidateId={selectedCandidate.id}
          onClose={() => setSelectedCandidate(null)}
          onEdit={(c) => {
            setSelectedCandidate(null);
            setEditingCandidate(c);
          }}
        />
      )}

      {/* Toast */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}

const ACTION_STYLES: Record<string, { icon: IconName; tint: string }> = {
  Created: { icon: 'plus', tint: 'bg-[#e9eef3] text-[#3d5a73]' },
  'Stage Changed': { icon: 'arrow-right', tint: 'bg-[#eceaf2] text-[#5a4d7d]' },
  'Note Added': { icon: 'note', tint: 'bg-[#f5efe0] text-[#77602a]' },
  'Rating Updated': { icon: 'star', tint: 'bg-[#f7ecd3] text-[#8a6116]' },
  Deleted: { icon: 'trash', tint: 'bg-[#f6e7e2] text-[#96382b]' },
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function ActivityLog() {
  const { activityLog } = useApp();

  if (activityLog.length === 0) {
    return (
      <div className="py-10 animate-fadeIn">
        <EmptyState
          icon="clock"
          title="Nothing logged yet"
          description="Moves, notes, and ratings will show up here as you manage candidates."
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-surface border border-line rounded-lg overflow-hidden">
      <div className="divide-y divide-line">
        {activityLog.map((entry, i) => {
          const style = ACTION_STYLES[entry.action] ?? { icon: 'clock' as IconName, tint: 'bg-[#e9ebee] text-[#5f6a76]' };
          return (
            <div
              key={entry.id}
              className="flex items-start gap-3 px-4 py-3.5 hover:bg-canvas/60 transition-colors duration-150 animate-fadeIn"
              style={{ animationDelay: `${Math.min(i * 40, 280)}ms` }}
            >
              <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${style.tint}`}>
                <Icon name={style.icon} className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{entry.candidateName}</p>
                <p className="text-[13px] text-muted truncate">{entry.details}</p>
              </div>
              <span className="text-xs text-muted/80 mt-1 whitespace-nowrap">{formatTime(entry.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
