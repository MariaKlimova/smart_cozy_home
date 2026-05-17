import { RitualsScreen } from '@/features/rituals/ui/RitualsScreen';
import { useRitualRunner } from '@/hooks/useRitualRunner';
import { useHomeStore } from '@/store/homeStore';

export default function RitualsTab() {
  const rituals = useHomeStore((s) => s.rituals);
  const { runningId, runRitualById } = useRitualRunner();

  return (
    <RitualsScreen rituals={rituals} runningId={runningId} onRitualPress={runRitualById} />
  );
}
