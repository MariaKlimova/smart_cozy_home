import { copy } from '@/copy/ru';
import type { IScenarioDefinition } from '@/config/scenarios.typings';
import { weekdayLabel } from '@/config/weekdayLabel';
import type { IScenarioScheduleState } from '@/domain/scenarioSettings.typings';
import { findNextScheduleRun } from '@/domain/scenarioWeeklySchedule';

function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isTomorrow(from: Date, target: Date): boolean {
  const tomorrow = new Date(from);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameCalendarDay(tomorrow, target);
}

/**
 * Подпись расписания для карточки сценария.
 * Учитывает дни недели и ближайший запуск.
 */
export function formatScenarioSchedule(
  definition: Pick<IScenarioDefinition, 'hasSchedule' | 'defaultScheduleTime'>,
  schedule: IScenarioScheduleState | undefined,
  now: Date = new Date(),
): string {
  if (!definition.hasSchedule || !schedule?.enabled) {
    return '';
  }

  const nextRun = findNextScheduleRun(
    { enabled: schedule.enabled, weekdays: schedule.weekdays },
    now,
  );
  if (!nextRun) {
    return '';
  }

  const timeLabel = formatTime(nextRun.runAt.getHours(), nextRun.runAt.getMinutes());

  if (isSameCalendarDay(now, nextRun.runAt)) {
    return copy.scenarios.scheduleToday.replace('{time}', timeLabel);
  }

  if (isTomorrow(now, nextRun.runAt)) {
    return copy.scenarios.scheduleTomorrow.replace('{time}', timeLabel);
  }

  return copy.scenarios.scheduleWeekday
    .replace('{weekday}', weekdayLabel(nextRun.weekdayId))
    .replace('{time}', timeLabel);
}
