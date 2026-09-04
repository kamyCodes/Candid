'use client';

import { useState } from 'react';
import { ValidationError } from '@/lib/validation';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: ValidationError;
  hint?: string;
  maxLength?: number;
  showCharCount?: boolean;
  children: (props: {
    className: string;
    onBlur: () => void;
    maxLength?: number;
  }) => React.ReactNode;
}

export default function FormField({
  label,
  required = false,
  error,
  hint,
  maxLength,
  showCharCount = false,
  children,
}: FormFieldProps) {
  const [isTouched, setIsTouched] = useState(false);

  const showError = isTouched && error;
  const showSuccess = isTouched && !error;

  const baseInputClass =
    'w-full px-3 py-2 border rounded-md text-sm bg-white placeholder:text-muted/60 transition-all outline-none';

  const stateClass = showError
    ? 'border-red-400 focus:ring-2 focus:ring-red-200/60 focus:border-red-400'
    : showSuccess
      ? 'border-accent/50 focus:ring-2 focus:ring-accent/25 focus:border-accent/60'
      : 'border-line focus:ring-2 focus:ring-accent/25 focus:border-accent/60';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-ink/85">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {showCharCount && maxLength && (
          <span className="text-xs text-muted/70">{maxLength} chars max</span>
        )}
      </div>

      <div className="relative">
        {children({
          className: `${baseInputClass} ${stateClass}`,
          onBlur: () => setIsTouched(true),
          maxLength,
        })}

        {/* Validation indicator icon */}
        {isTouched && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {showError && (
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {showSuccess && (
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {showError && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">{error}</p>
      )}

      {/* Hint text */}
      {!showError && hint && (
        <p className="mt-1 text-xs text-muted/80">{hint}</p>
      )}
    </div>
  );
}
