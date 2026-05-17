import type { IRitual } from '@/domain/types';

export interface IHomeRitualsSectionProps {
  /** Ритуалы для отображения на главной */
  rituals: IRitual[];
  /** id ритуала в процессе запуска */
  runningId?: string;
  /** Нажатие на ритуал */
  onRitualPress: (ritualId: string) => void;
}
