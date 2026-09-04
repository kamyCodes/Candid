import { Candidate, Stage } from './types';

/** Compact unique id for candidates, notes, and activity entries. */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/** True when the candidate matches the free text query across searchable fields. */
export function candidateMatchesQuery(candidate: Candidate, query: string): boolean {
  const q = query.toLowerCase();
  return (
    candidate.name.toLowerCase().includes(q) ||
    candidate.email.toLowerCase().includes(q) ||
    candidate.position.toLowerCase().includes(q) ||
    candidate.phone.includes(query)
  );
}

/**
 * Single source of truth for view filtering.
 * Applies the free text search first, then the stage filter.
 */
export function filterCandidates(
  candidates: Candidate[],
  query: string,
  stage: Stage | 'all'
): Candidate[] {
  const searched = query ? candidates.filter((c) => candidateMatchesQuery(c, query)) : candidates;
  return stage === 'all' ? searched : searched.filter((c) => c.stage === stage);
}
