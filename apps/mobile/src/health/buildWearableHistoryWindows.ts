import type { ISleepNightWindow } from '@/domain/sleepNight.typings';
import type { INightSchedule } from '@/domain/nightSchedule.typings';
import { DEFAULT_NIGHT_SCHEDULE, parseTimeParts } from '@/domain/nightSchedule';
import { startOfLocalDay } from '@/domain/sleepNightWindows';
import type { TWeekdayId } from '@/domain/scenarioWeeklySchedule.typings';
import { WEARABLE_SLEEP_HISTORY_NIGHTS } from '@/health/sleepScore.const';

function jsDayToWeekdayId(day: number): TWeekdayId {
  const map: TWeekdayId[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[day] ?? 'mon';
}

function formatNightDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function buildFallbackWindow(
  eveningDate: Date,
  schedule: INightSchedule,
): { startAt: Date; endAt: Date } {
  const bedtime = parseTimeParts(schedule.bedtime);
  const wake = parseTimeParts(schedule.wakeTime);

  const startAt = new Date(eveningDate);
  startAt.setHours(bedtime.hours, bedtime.minutes, 0, 0);

  const endAt = addDays(eveningDate, 1);
  endAt.setHours(wake.hours, wake.minutes, 0, 0);

  return { startAt, endAt };
}

/** Строит N ночных окон по schedule; nightDate — дата пробуждения */
export function buildWearableHistoryWindows(
  historyEnd: Date = new Date(),
  schedule: INightSchedule = DEFAULT_NIGHT_SCHEDULE,
  nightCount: number = WEARABLE_SLEEP_HISTORY_NIGHTS,
): ISleepNightWindow[] {
  const anchor = startOfLocalDay(historyEnd);
  const firstWakeDate = addDays(anchor, -(nightCount - 1));
  const windows: ISleepNightWindow[] = [];

  for (let index = 0; index < nightCount; index += 1) {
    const wakeDate = addDays(firstWakeDate, index);
    const eveningDate = addDays(wakeDate, -1);
    const fallback = buildFallbackWindow(eveningDate, schedule);

    windows.push({
      nightDate: formatNightDate(wakeDate),
      weekdayId: jsDayToWeekdayId(wakeDate.getDay()),
      startAt: fallback.startAt,
      endAt: fallback.endAt,
      hasScenarioData: false,
    });
  }

  return windows;
}
