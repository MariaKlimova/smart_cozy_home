import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { MockHaRuntime } from '@/ha/MockHaRuntime';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => queryClient);
  return (
    <QueryClientProvider client={client}>
      <MockHaRuntime />
      {children}
    </QueryClientProvider>
  );
}
