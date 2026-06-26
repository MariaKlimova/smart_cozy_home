import { copy } from '@/copy/ru';

import type { IScenarioDefinition } from '../config/scenarios.typings';

function parseScheduleTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
}

function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Подпись расписания для карточки сценария.
 * До SH-15 использует defaultScheduleTime из конфига.
 */
export function formatScenarioSchedule(
  definition: Pick<IScenarioDefinition, 'hasSchedule' | 'defaultScheduleTime'>,
  now: Date = new Date(),
): string {
  if (!definition.hasSchedule) {
    return copy.scenarios.manualOnly;
  }

  const scheduleTime = definition.defaultScheduleTime ?? '22:00';
  const { hours, minutes } = parseScheduleTime(scheduleTime);
  const scheduledAt = new Date(now);
  scheduledAt.setHours(hours, minutes, 0, 0);

  const timeLabel = formatTime(hours, minutes);

  if (scheduledAt.getTime() > now.getTime()) {
    return copy.scenarios.scheduleToday.replace('{time}', timeLabel);
  }

  return copy.scenarios.scheduleTomorrow.replace('{time}', timeLabel);
}
