import { useCallback, useState } from 'react';

import { runRitual } from '@/domain/ritualRunner';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';

/** Запуск ритуала через HA с индикацией активного id */
export function useRitualRunner() {
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const profile = useConnectionStore((s) => s.profile);
  const refresh = useHomeStore((s) => s.refresh);
  const [runningId, setRunningId] = useState<string>();

  const runRitualById = useCallback(
    async (ritualId: string) => {
      if (!baseUrl || !profile) return;
      setRunningId(ritualId);
      try {
        await runRitual(ritualId, baseUrl, profile.accessToken);
        await refresh();
      } catch {
        // script может отсутствовать в HA
      } finally {
        setRunningId(undefined);
      }
    },
    [baseUrl, profile, refresh],
  );

  return { runningId, runRitualById };
}
