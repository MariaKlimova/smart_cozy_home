import type { INightSchedule } from '@/domain/nightSchedule.typings';

/** Дефолтные границы ночи (совпадает с fallback в sleepNightWindows) */
export const DEFAULT_NIGHT_SCHEDULE: INightSchedule = {
  bedtime: '23:00',
  wakeTime: '08:00',
};

/** Длительность «утра» после пробуждения, ч */
export const MORNING_WINDOW_HOURS = 3;

/** За сколько часов до bedtime начинается «вечер», ч */
export const EVENING_WINDOW_HOURS = 3;

/** Часы и минуты из строки HH:mm */
export function parseTimeParts(time: string): { hours: number; minutes: number } {
  const [hoursRaw, minutesRaw] = time.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return { hours: 0, minutes: 0 };
  }
  return { hours, minutes };
}

function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function timeToMinutes(time: string): number {
  const { hours, minutes } = parseTimeParts(time);
  return hours * 60 + minutes;
}

function addMinutesToTime(time: string, deltaMinutes: number): number {
  const total = timeToMinutes(time) + deltaMinutes;
  return ((total % (24 * 60)) + 24 * 60) % (24 * 60);
}

function isMinuteInRange(
  minute: number,
  startMinute: number,
  endMinute: number,
): boolean {
  if (startMinute === endMinute) {
    return false;
  }
  if (startMinute < endMinute) {
    return minute >= startMinute && minute < endMinute;
  }
  return minute >= startMinute || minute < endMinute;
}

/** Сейчас ночь по расписанию (bedtime → wakeTime, через полночь) */
export function isNightTime(now: Date, schedule: INightSchedule = DEFAULT_NIGHT_SCHEDULE): boolean {
  const minute = minutesSinceMidnight(now);
  const bedtimeMinute = timeToMinutes(schedule.bedtime);
  const wakeMinute = timeToMinutes(schedule.wakeTime);
  return isMinuteInRange(minute, bedtimeMinute, wakeMinute);
}

/** Утро: от wakeTime до wakeTime + MORNING_WINDOW_HOURS (или до начала дня) */
export function isMorningTime(
  now: Date,
  schedule: INightSchedule = DEFAULT_NIGHT_SCHEDULE,
): boolean {
  if (isNightTime(now, schedule)) {
    return false;
  }

  const minute = minutesSinceMidnight(now);
  const wakeMinute = timeToMinutes(schedule.wakeTime);
  const morningEndMinute = addMinutesToTime(schedule.wakeTime, MORNING_WINDOW_HOURS * 60);
  return isMinuteInRange(minute, wakeMinute, morningEndMinute);
}

/** Вечер: за EVENING_WINDOW_HOURS до bedtime до bedtime */
export function isEveningTime(
  now: Date,
  schedule: INightSchedule = DEFAULT_NIGHT_SCHEDULE,
): boolean {
  if (isNightTime(now, schedule)) {
    return false;
  }

  const minute = minutesSinceMidnight(now);
  const bedtimeMinute = timeToMinutes(schedule.bedtime);
  const eveningStartMinute = addMinutesToTime(
    schedule.bedtime,
    -EVENING_WINDOW_HOURS * 60,
  );
  return isMinuteInRange(minute, eveningStartMinute, bedtimeMinute);
}
