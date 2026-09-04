'use client';

import { AppProvider } from '@/lib/AppContext';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
