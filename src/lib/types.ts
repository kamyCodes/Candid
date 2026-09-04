export type Stage = 'applied' | 'interview' | 'test' | 'offer' | 'accepted' | 'rejected';

export const STAGES: Stage[] = ['applied', 'interview', 'test', 'offer', 'accepted', 'rejected'];

export const STAGE_LABELS: Record<Stage, string> = {
  applied: 'Applied',
  interview: 'Interview',
  test: 'Test',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

// Muted, warm tints that sit quietly on paper-toned surfaces
export const STAGE_COLORS: Record<Stage, string> = {
  applied: 'chip-applied',
  interview: 'chip-interview',
  test: 'chip-test',
  offer: 'chip-offer',
  accepted: 'chip-accepted',
  rejected: 'chip-rejected',
};

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: string;
}

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level (0-2 yrs)' },
  { value: 'mid', label: 'Mid Level (3-5 yrs)' },
  { value: 'senior', label: 'Senior (6-10 yrs)' },
  { value: 'lead', label: 'Lead / Staff (10+ yrs)' },
  { value: 'executive', label: 'Executive (C-level, VP)' },
];

export type CandidateSource = 'referral' | 'linkedin' | 'job-board' | 'career-site' | 'agency' | 'cold-outreach' | 'other';

export const CANDIDATE_SOURCES: { value: CandidateSource; label: string }[] = [
  { value: 'referral', label: 'Employee Referral' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'job-board', label: 'Job Board (Indeed, etc.)' },
  { value: 'career-site', label: 'Company Career Site' },
  { value: 'agency', label: 'Recruiting Agency' },
  { value: 'cold-outreach', label: 'Cold Outreach' },
  { value: 'other', label: 'Other' },
];

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  stage: Stage;
  rating: number; // 1-5
  experienceLevel: ExperienceLevel | '';
  source: CandidateSource | '';
  linkedIn: string;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  candidateId: string;
  candidateName: string;
  action: string;
  details: string;
  timestamp: string;
}
