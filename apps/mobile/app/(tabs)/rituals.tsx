import { useState } from 'react';

import { copy } from '@/copy/ru';
import { runRitual } from '@/domain/ritualRunner';
import { RitualGrid } from '@/features/rituals/ui/RitualGrid';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';
import { ScreenLayout } from '@/ui/ScreenLayout';

export default function RitualsScreen() {
  const rituals = useHomeStore((s) => s.rituals);
  const refresh = useHomeStore((s) => s.refresh);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const profile = useConnectionStore((s) => s.profile);
  const [runningId, setRunningId] = useState<string>();

  async function handleRitual(ritualId: string) {
    if (!baseUrl || !profile) return;
    setRunningId(ritualId);
    try {
      await runRitual(ritualId, baseUrl, profile.accessToken);
      await refresh();
    } finally {
      setRunningId(undefined);
    }
  }

  return (
    <ScreenLayout title={copy.rituals.sectionTitle}>
      <RitualGrid rituals={rituals} runningId={runningId} onRitualPress={handleRitual} />
    </ScreenLayout>
  );
}
