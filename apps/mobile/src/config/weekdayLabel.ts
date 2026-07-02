import { copy } from '@/copy/ru';
import type { TWeekdayId } from '@/domain/scenarioWeeklySchedule.typings';

/** Короткая подпись дня недели для UI */
export function weekdayLabel(weekdayId: TWeekdayId): string {
  const labels = copy.scenarios.weekdays as Record<TWeekdayId, string>;
  return labels[weekdayId] ?? weekdayId;
}
