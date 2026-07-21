import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { MockHaRuntime } from '@/ha/MockHaRuntime';
import { ConnectionLifecycle } from './ConnectionLifecycle';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => queryClient);
  return (
    <KeyboardProvider>
      <QueryClientProvider client={client}>
        <MockHaRuntime />
        <ConnectionLifecycle />
        {children}
      </QueryClientProvider>
    </KeyboardProvider>
  );
}
