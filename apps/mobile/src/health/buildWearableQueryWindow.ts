import type { ISleepNightWindow } from '@/domain/sleepNight.typings';
import { DEFAULT_NIGHT_SCHEDULE, parseTimeParts } from '@/domain/nightSchedule';
import type { INightSchedule } from '@/domain/nightSchedule.typings';
import { parseLocalNightDate } from '@/domain/parseLocalNightDate';

/** Запас до bedtime для запроса HealthKit, ч */
const WEARABLE_QUERY_BEDTIME_PADDING_HOURS = 1;

/** Запас после wakeTime для запроса HealthKit, ч */
const WEARABLE_QUERY_WAKE_PADDING_HOURS = 6;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Широкое календарное окно для запроса HealthKit.
 * nightDate — дата пробуждения; окно от bedtime−1ч накануне до wakeTime+6ч.
 */
export function buildWearableQueryWindow(
  nightWindow: ISleepNightWindow,
  schedule: INightSchedule = DEFAULT_NIGHT_SCHEDULE,
): {
  startAt: Date;
  endAt: Date;
} {
  const wakeDay = parseLocalNightDate(nightWindow.nightDate);
  const bedtime = parseTimeParts(schedule.bedtime);
  const wake = parseTimeParts(schedule.wakeTime);

  const startAt = addDays(wakeDay, -1);
  startAt.setHours(bedtime.hours, bedtime.minutes, 0, 0);
  startAt.setHours(startAt.getHours() - WEARABLE_QUERY_BEDTIME_PADDING_HOURS);

  const endAt = new Date(wakeDay);
  endAt.setHours(wake.hours, wake.minutes, 0, 0);
  endAt.setHours(endAt.getHours() + WEARABLE_QUERY_WAKE_PADDING_HOURS);

  return { startAt, endAt };
}
