import type { ISleepNightWindow } from '@/domain/sleepNight.typings';
import { parseLocalNightDate } from '@/domain/parseLocalNightDate';

/** Час начала календарного окна для HealthKit (вечер накануне) */
const WEARABLE_QUERY_EVENING_HOUR = 18;

/** Час конца календарного окна для HealthKit (утро дня пробуждения) */
const WEARABLE_QUERY_MORNING_HOUR = 14;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Широкое календарное окно для запроса HealthKit.
 * nightDate — дата пробуждения; запрос с вечера предыдущего дня до полудня.
 */
export function buildWearableQueryWindow(nightWindow: ISleepNightWindow): {
  startAt: Date;
  endAt: Date;
} {
  const wakeDay = parseLocalNightDate(nightWindow.nightDate);

  const startAt = addDays(wakeDay, -1);
  startAt.setHours(WEARABLE_QUERY_EVENING_HOUR, 0, 0, 0);

  const endAt = new Date(wakeDay);
  endAt.setHours(WEARABLE_QUERY_MORNING_HOUR, 0, 0, 0);

  return { startAt, endAt };
}
