'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Candidate, Note, Stage, ActivityLogEntry } from './types';
import { useLocalStorage } from './useLocalStorage';
import { uid } from './candidates';
import { createDemoData } from './demoData';

export interface StageMove {
  id: string;
  at: number;
}

interface AppContextType {
  candidates: Candidate[];
  activityLog: ActivityLogEntry[];
  isLoaded: boolean;
  /** Id of the candidate whose stage most recently changed, used for one-shot animations. */
  lastMove: StageMove | null;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  moveCandidate: (id: string, newStage: Stage) => void;
  addNote: (candidateId: string, content: string, author: string) => void;
  updateRating: (candidateId: string, rating: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates, isLoaded] = useLocalStorage<Candidate[]>('hiring-tracker-candidates', []);
  const [activityLog, setActivityLog] = useLocalStorage<ActivityLogEntry[]>('hiring-tracker-activity', []);
  const [lastMove, setLastMove] = useState<StageMove | null>(null);

  // Let the one-shot "just moved" animation finish, then clear the signal.
  useEffect(() => {
    if (!lastMove) return;
    const timer = setTimeout(() => setLastMove(null), 700);
    return () => clearTimeout(timer);
  }, [lastMove]);

  // Visiting the app with ?seed loads the demo dataset once, then tidies the URL.
  const seededRef = useRef(false);
  useEffect(() => {
    if (!isLoaded || seededRef.current) return;
    seededRef.current = true;
    if (!window.location.search.includes('seed')) return;
    const demo = createDemoData();
    setCandidates(demo.candidates);
    setActivityLog(demo.activityLog);
    window.history.replaceState(null, '', window.location.pathname);
  }, [isLoaded, setCandidates, setActivityLog]);

  const addLogEntry = useCallback(
    (candidateId: string, candidateName: string, action: string, details: string) => {
      const entry: ActivityLogEntry = {
        id: uid(),
        candidateId,
        candidateName,
        action,
        details,
        timestamp: new Date().toISOString(),
      };
      setActivityLog((prev) => [entry, ...prev].slice(0, 50)); // Keep last 50 entries
    },
    [setActivityLog]
  );

  const addCandidate = useCallback(
    (candidateData: Omit<Candidate, 'id' | 'notes' | 'createdAt' | 'updatedAt'>) => {
      const newCandidate: Candidate = {
        ...candidateData,
        id: uid(),
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCandidates((prev) => [...prev, newCandidate]);
      addLogEntry(newCandidate.id, newCandidate.name, 'Created', `Added to pipeline as ${newCandidate.stage}`);
    },
    [setCandidates, addLogEntry]
  );

  const updateCandidate = useCallback(
    (id: string, updates: Partial<Candidate>) => {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
      );
    },
    [setCandidates]
  );

  const deleteCandidate = useCallback(
    (id: string) => {
      const candidate = candidates.find((c) => c.id === id);
      if (candidate) {
        setCandidates((prev) => prev.filter((c) => c.id !== id));
        addLogEntry(id, candidate.name, 'Deleted', 'Removed from pipeline');
      }
    },
    [candidates, setCandidates, addLogEntry]
  );

  const moveCandidate = useCallback(
    (id: string, newStage: Stage) => {
      const candidate = candidates.find((c) => c.id === id);
      if (candidate && candidate.stage !== newStage) {
        setCandidates((prev) =>
          prev.map((c) => (c.id === id ? { ...c, stage: newStage, updatedAt: new Date().toISOString() } : c))
        );
        setLastMove({ id, at: Date.now() });
        addLogEntry(id, candidate.name, 'Stage Changed', `Moved from ${candidate.stage} to ${newStage}`);
      }
    },
    [candidates, setCandidates, addLogEntry]
  );

  const addNote = useCallback(
    (candidateId: string, content: string, author: string) => {
      const candidate = candidates.find((c) => c.id === candidateId);
      if (candidate) {
        const newNote: Note = {
          id: uid(),
          content,
          createdAt: new Date().toISOString(),
          author,
        };
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId
              ? { ...c, notes: [...c.notes, newNote], updatedAt: new Date().toISOString() }
              : c
          )
        );
        addLogEntry(candidateId, candidate.name, 'Note Added', `New note by ${author}`);
      }
    },
    [candidates, setCandidates, addLogEntry]
  );

  const updateRating = useCallback(
    (candidateId: string, rating: number) => {
      const candidate = candidates.find((c) => c.id === candidateId);
      if (candidate) {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId ? { ...c, rating, updatedAt: new Date().toISOString() } : c
          )
        );
        addLogEntry(candidateId, candidate.name, 'Rating Updated', `Rating set to ${rating}/5`);
      }
    },
    [candidates, setCandidates, addLogEntry]
  );

  return (
    <AppContext.Provider
      value={{
        candidates,
        activityLog,
        isLoaded,
        lastMove,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        moveCandidate,
        addNote,
        updateRating,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
