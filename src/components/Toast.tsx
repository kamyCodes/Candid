'use client';

import { useEffect } from 'react';
import Icon from './Icon';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2800);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[100] toast-animate">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-surface text-ink border border-line text-sm font-medium rounded-lg shadow-lg">
        <Icon name="check" className="w-4 h-4 text-accent shrink-0" />
        {message}
      </div>
    </div>
  );
}
