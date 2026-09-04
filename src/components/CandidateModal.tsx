'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/AppContext';
import {
  Candidate,
  Stage,
  STAGES,
  STAGE_LABELS,
  ExperienceLevel,
  EXPERIENCE_LEVELS,
  CandidateSource,
  CANDIDATE_SOURCES,
} from '@/lib/types';
import { sanitizeInput, validateAllFields, CandidateFormErrors } from '@/lib/validation';
import FormField from './FormField';
import StarRating from './StarRating';
import Icon from './Icon';

interface CandidateModalProps {
  candidate?: Candidate;
  onClose: () => void;
  onSaved?: () => void;
}

type TextField = 'name' | 'email' | 'phone' | 'position' | 'linkedIn';

const FIELD_LABELS: Record<TextField, string> = {
  name: 'Full Name',
  email: 'Email Address',
  phone: 'Phone Number',
  position: 'Position',
  linkedIn: 'LinkedIn Profile',
};

export default function CandidateModal({ candidate, onClose, onSaved }: CandidateModalProps) {
  const { addCandidate, updateCandidate, candidates } = useApp();
  const isEditing = !!candidate;

  // Form state
  const [name, setName] = useState(candidate?.name || '');
  const [email, setEmail] = useState(candidate?.email || '');
  const [phone, setPhone] = useState(candidate?.phone || '');
  const [position, setPosition] = useState(candidate?.position || '');
  const [stage, setStage] = useState<Stage>(candidate?.stage || 'applied');
  const [rating, setRating] = useState(candidate?.rating || 0);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>(candidate?.experienceLevel || '');
  const [source, setSource] = useState<CandidateSource | ''>(candidate?.source || '');
  const [linkedIn, setLinkedIn] = useState(candidate?.linkedIn || '');

  // Validation state
  const [errors, setErrors] = useState<CandidateFormErrors>({
    name: null,
    email: null,
    phone: null,
    position: null,
    linkedIn: null,
  });
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);

  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(onClose, 150); // let the exit animation play
  };

  const existingEmails = candidates
    .filter((c) => c.id !== candidate?.id)
    .map((c) => c.email);

  const validateField = (field: TextField) => {
    const result = validateAllFields({ name, email, phone, position, linkedIn }, existingEmails, candidate?.id);
    setErrors((prev) => ({ ...prev, [field]: result.errors[field] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitAttempted(true);

    const result = validateAllFields({ name, email, phone, position, linkedIn }, existingEmails, candidate?.id);
    setErrors(result.errors);
    if (!result.isValid) return;

    const data = {
      name: sanitizeInput(name),
      email: sanitizeInput(email).toLowerCase(),
      phone: phone.trim(),
      position: sanitizeInput(position),
      stage,
      rating,
      experienceLevel: (experienceLevel || '') as ExperienceLevel | '',
      source: (source || '') as CandidateSource | '',
      linkedIn: linkedIn.trim(),
    };

    if (isEditing && candidate) {
      updateCandidate(candidate.id, data);
    } else {
      addCandidate(data);
    }
    onSaved?.();
    requestClose();
  };

  const hasErrors = Object.values(errors).some((e) => e !== null);

  // Escape closes the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 ${
        closing ? 'pointer-events-none' : ''
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/40 ${closing ? 'animate-fade-out' : 'animate-fade'}`}
        onClick={requestClose}
      />

      <div
        className={`relative bg-surface rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-xl max-h-[92vh] sm:max-h-[90vh] flex flex-col ${
          closing ? 'animate-modal-out' : 'animate-modal-in'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-ink tracking-tight">
              {isEditing ? 'Edit candidate' : 'New candidate'}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Fields marked with <span className="text-red-600">*</span> are required
            </p>
          </div>
          <button
            onClick={requestClose}
            className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-black/5 transition-colors"
            title="Close"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-semibold text-muted uppercase tracking-[0.14em] mb-3">
              Contact
            </h3>
            <div className="space-y-4">
              <FormField
                label={FIELD_LABELS.name}
                required
                error={errors.name}
                maxLength={100}
                showCharCount
              >
                {(field) => (
                  <input
                    type="text"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => { validateField('name'); field.onBlur(); }}
                    className={field.className}
                    placeholder="Jane Smith"
                    maxLength={field.maxLength}
                  />
                )}
              </FormField>

              <FormField label={FIELD_LABELS.email} required error={errors.email} hint="Duplicates are caught automatically">
                {(field) => (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => { validateField('email'); field.onBlur(); }}
                    className={field.className}
                    placeholder="jane@company.com"
                    maxLength={field.maxLength}
                  />
                )}
              </FormField>

              <FormField label={FIELD_LABELS.phone} error={errors.phone} hint="Optional. Include a country code for international numbers">
                {(field) => (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => { validateField('phone'); field.onBlur(); }}
                    className={field.className}
                    placeholder="+1 (555) 123-4567"
                    maxLength={field.maxLength}
                  />
                )}
              </FormField>

              <FormField label={FIELD_LABELS.linkedIn} error={errors.linkedIn} hint="Optional. Paste the full profile URL" maxLength={200}>
                {(field) => (
                  <input
                    type="url"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    onBlur={() => { validateField('linkedIn'); field.onBlur(); }}
                    className={field.className}
                    placeholder="https://linkedin.com/in/janesmith"
                    maxLength={field.maxLength}
                  />
                )}
              </FormField>
            </div>
          </div>

          {/* Role */}
          <div>
            <h3 className="text-[11px] font-semibold text-muted uppercase tracking-[0.14em] mb-3">
              Role
            </h3>
            <div className="space-y-4">
              <FormField label={FIELD_LABELS.position} required error={errors.position} maxLength={100} showCharCount>
                {(field) => (
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    onBlur={() => { validateField('position'); field.onBlur(); }}
                    className={field.className}
                    placeholder="Senior Frontend Engineer"
                    maxLength={field.maxLength}
                  />
                )}
              </FormField>

              <FormField label="Experience Level">
                {(field) => (
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel | '')}
                    className={field.className}
                  >
                    <option value="">Select a level</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>

              <FormField label="How did you find them?">
                {(field) => (
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as CandidateSource | '')}
                    className={field.className}
                  >
                    <option value="">Select a source</option>
                    {CANDIDATE_SOURCES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>

              <FormField label="Pipeline stage">
                {(field) => (
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as Stage)}
                    className={field.className}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-[11px] font-semibold text-muted uppercase tracking-[0.14em] mb-3">
              First impression
            </h3>
            <div className="flex items-center gap-3">
              <StarRating rating={rating} size="lg" onChange={setRating} />
              {rating > 0 && <span className="text-sm text-muted">{rating}/5</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-5 border-t border-line">
            {isSubmitAttempted && hasErrors && (
              <p className="text-xs text-red-600 flex items-center gap-1.5 mr-auto">
                <Icon name="alert" className="w-4 h-4" />
                Check the highlighted fields
              </p>
            )}
            <button
              type="button"
              onClick={requestClose}
              className="px-4 py-2 text-sm font-medium text-ink bg-black/5 rounded-md hover:bg-black/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-deep transition-colors"
            >
              {isEditing ? 'Save changes' : 'Add candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
