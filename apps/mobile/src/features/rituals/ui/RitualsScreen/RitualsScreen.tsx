import { copy } from '@/copy/ru';
import { RitualGrid } from '@/features/rituals/ui/RitualGrid';
import { ScreenLayout } from '@/ui/ScreenLayout';

import type { IRitualsScreenProps } from './RitualsScreen.typings';

export function RitualsScreen({ rituals, runningId, onRitualPress }: IRitualsScreenProps) {
  return (
    <ScreenLayout title={copy.rituals.sectionTitle}>
      <RitualGrid rituals={rituals} runningId={runningId} onRitualPress={onRitualPress} />
    </ScreenLayout>
  );
}
