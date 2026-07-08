import type { ISleepLogbookEntry, ISleepNightWindow } from '@/domain/sleepNight.typings';
import type { TWeekdayId } from '@/domain/scenarioWeeklySchedule.typings';

const NIGHTS_PER_WEEK = 7;
const FALLBACK_EVENING_HOUR = 23;
const FALLBACK_EVENING_MINUTE = 0;
const FALLBACK_MORNING_HOUR = 8;
const FALLBACK_MORNING_MINUTE = 0;

function jsDayToWeekdayId(day: number): TWeekdayId {
  const map: TWeekdayId[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[day] ?? 'mon';
}

export function startOfLocalDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
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

function buildFallbackWindow(eveningDate: Date): { startAt: Date; endAt: Date } {
  const startAt = new Date(eveningDate);
  startAt.setHours(FALLBACK_EVENING_HOUR, FALLBACK_EVENING_MINUTE, 0, 0);

  const endAt = addDays(eveningDate, 1);
  endAt.setHours(FALLBACK_MORNING_HOUR, FALLBACK_MORNING_MINUTE, 0, 0);

  return { startAt, endAt };
}

function findEveningRun(
  entries: ISleepLogbookEntry[],
  eveningDate: Date,
  eveningEntityId: string,
): Date | undefined {
  const dayStart = startOfLocalDay(eveningDate);
  const nextDay = addDays(dayStart, 1);

  const runs = entries
    .filter((entry) => entry.scriptId === eveningEntityId)
    .map((entry) => new Date(entry.when))
    .filter((when) => when.getTime() >= dayStart.getTime() && when.getTime() < nextDay.getTime())
    .sort((a, b) => a.getTime() - b.getTime());

  return runs[0];
}

function findMorningRun(
  entries: ISleepLogbookEntry[],
  eveningDate: Date,
  morningEntityId: string,
): Date | undefined {
  const morningDate = addDays(eveningDate, 1);
  const dayStart = startOfLocalDay(morningDate);
  const nextDay = addDays(dayStart, 1);

  const runs = entries
    .filter((entry) => entry.scriptId === morningEntityId)
    .map((entry) => new Date(entry.when))
    .filter((when) => when.getTime() >= dayStart.getTime() && when.getTime() < nextDay.getTime())
    .sort((a, b) => a.getTime() - b.getTime());

  return runs[0];
}

export interface IResolveNightWindowsParams {
  /** Конец недели (день последней ночи, обычно сегодня) */
  weekEnd: Date;
  /** Записи logbook за период */
  logbookEntries: ISleepLogbookEntry[];
  /** entity_id вечернего сценария */
  eveningEntityId: string;
  /** entity_id утреннего сценария */
  morningEntityId: string;
}

/** Строит 7 ночных окон, заканчивающихся на weekEnd */
export function resolveNightWindows(params: IResolveNightWindowsParams): ISleepNightWindow[] {
  const { weekEnd, logbookEntries, eveningEntityId, morningEntityId } = params;
  const anchor = startOfLocalDay(weekEnd);
  const firstEveningDate = addDays(anchor, -(NIGHTS_PER_WEEK - 1));

  const windows: ISleepNightWindow[] = [];

  for (let index = 0; index < NIGHTS_PER_WEEK; index += 1) {
    const eveningDate = addDays(firstEveningDate, index);
    const fallback = buildFallbackWindow(eveningDate);
    const eveningRun = findEveningRun(logbookEntries, eveningDate, eveningEntityId);
    const morningRun = findMorningRun(logbookEntries, eveningDate, morningEntityId);

    const startAt = eveningRun ?? fallback.startAt;
    let endAt = morningRun ?? fallback.endAt;
    if (endAt.getTime() <= startAt.getTime()) {
      endAt = fallback.endAt;
    }

    windows.push({
      nightDate: formatNightDate(eveningDate),
      weekdayId: jsDayToWeekdayId(eveningDate.getDay()),
      startAt,
      endAt,
      hasScenarioData: eveningRun !== undefined,
    });
  }

  return windows;
}

/** Диапазон дат для logbook: weekEnd минус 8 дней … weekEnd плюс 1 день */
export function getSleepLogbookRange(weekEnd: Date): { start: Date; end: Date } {
  const end = addDays(startOfLocalDay(weekEnd), 1);
  end.setHours(23, 59, 59, 999);
  const start = addDays(startOfLocalDay(weekEnd), -(NIGHTS_PER_WEEK + 1));
  return { start, end };
}

/** weekEnd для смещения недели (0 = текущая) */
export function getWeekEndForOffset(weekOffset: number, now: Date = new Date()): Date {
  return addDays(startOfLocalDay(now), -weekOffset * NIGHTS_PER_WEEK);
}
