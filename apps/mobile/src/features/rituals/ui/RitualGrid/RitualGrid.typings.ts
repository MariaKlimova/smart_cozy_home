import type { IRitual } from '@/domain/types';

export interface IRitualGridProps {
  /** Список ритуалов */
  rituals: IRitual[];
  /** id ритуала в процессе запуска */
  runningId?: string;
  /** Нажатие на ритуал */
  onRitualPress: (ritualId: string) => void;
}
