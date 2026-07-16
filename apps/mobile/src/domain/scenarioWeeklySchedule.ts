import type {
  INextScheduleRun,
  IScenarioWeeklyScheduleData,
  TWeekdayId,
  IWeekdayScheduleEntry,
} from './scenarioWeeklySchedule.typings';

/** Порядок дней для UI (с понедельника) */
export const WEEKDAY_IDS: TWeekdayId[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/**
 * Компактная запись дня в JSON v1: [enabled, "HH:mm"].
 * Нужна, чтобы весь JSON вмещался в лимит HA input_text (max 255).
 */
export type TWeekdayScheduleCompactEntry = [boolean, string];

/** Значение дня в JSON: объект (legacy) или компактный массив */
export type TWeekdayScheduleJsonEntry = IWeekdayScheduleEntry | TWeekdayScheduleCompactEntry;

/** JSON-версия схемы расписания */
export interface IScenarioWeeklyScheduleJson {
  /** v1 */
  version: 1;
  /** Мастер-переключатель */
  enabled: boolean;
  /** Дни недели (компактный или legacy-формат) */
  weekdays: Partial<Record<TWeekdayId, TWeekdayScheduleJsonEntry>>;
}

function parseWeekdayEntry(
  entry: TWeekdayScheduleJsonEntry | undefined,
  defaultTime: string,
): IWeekdayScheduleEntry {
  if (Array.isArray(entry)) {
    return {
      enabled: Boolean(entry[0]),
      time: normalizeTime(typeof entry[1] === 'string' ? entry[1] : defaultTime, defaultTime),
    };
  }

  return {
    enabled: entry?.enabled ?? false,
    time: normalizeTime(entry?.time ?? defaultTime, defaultTime),
  };
}

function jsDayToWeekdayId(day: number): TWeekdayId {
  const map: TWeekdayId[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[day] ?? 'mon';
}

function normalizeTime(time: string, fallback: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return fallback;
  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return fallback;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Дефолтное расписание: все дни выкл, одно время */
export function createDefaultWeeklySchedule(defaultTime: string): IScenarioWeeklyScheduleData {
  const time = normalizeTime(defaultTime, '07:00');
  const weekdays = {} as Record<TWeekdayId, IWeekdayScheduleEntry>;
  for (const id of WEEKDAY_IDS) {
    weekdays[id] = { enabled: false, time };
  }
  return { enabled: false, weekdays };
}

/** Расписание с одинаковым временем на все дни (моки и тесты) */
export function createUniformWeeklySchedule(
  enabled: boolean,
  time: string,
  defaultTime: string,
): IScenarioWeeklyScheduleData {
  const normalized = normalizeTime(time, defaultTime);
  const weekdays = {} as Record<TWeekdayId, IWeekdayScheduleEntry>;
  for (const id of WEEKDAY_IDS) {
    weekdays[id] = { enabled, time: normalized };
  }
  return { enabled, weekdays };
}

/** Парсинг JSON из input_text */
export function parseWeeklyScheduleJson(
  raw: string | undefined,
  defaultTime: string,
): IScenarioWeeklyScheduleData | null {
  if (!raw || raw === 'unknown' || raw === 'unavailable') {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<IScenarioWeeklyScheduleJson>;
    if (parsed.version !== 1 || !parsed.weekdays) {
      return null;
    }

    const weekdays = {} as Record<TWeekdayId, IWeekdayScheduleEntry>;

    for (const id of WEEKDAY_IDS) {
      weekdays[id] = parseWeekdayEntry(parsed.weekdays[id], defaultTime);
    }

    return {
      enabled: parsed.enabled ?? false,
      weekdays,
    };
  } catch {
    return null;
  }
}

/** Сериализация в компактный JSON для input_text (лимит HA 255) */
export function serializeWeeklyScheduleJson(
  schedule: IScenarioWeeklyScheduleData,
): string {
  const weekdays = {} as Record<TWeekdayId, TWeekdayScheduleCompactEntry>;
  for (const id of WEEKDAY_IDS) {
    const entry = schedule.weekdays[id];
    weekdays[id] = [entry.enabled, entry.time];
  }
  const payload: IScenarioWeeklyScheduleJson = {
    version: 1,
    enabled: schedule.enabled,
    weekdays,
  };
  return JSON.stringify(payload);
}

/** Ближайший запуск в пределах 14 дней */
export function findNextScheduleRun(
  schedule: IScenarioWeeklyScheduleData,
  now: Date = new Date(),
): INextScheduleRun | null {
  if (!schedule.enabled) {
    return null;
  }

  for (let offset = 0; offset < 14; offset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    const weekdayId = jsDayToWeekdayId(date.getDay());
    const entry = schedule.weekdays[weekdayId];
    if (!entry.enabled) {
      continue;
    }

    const [hours, minutes] = entry.time.split(':').map(Number);
    const runAt = new Date(date);
    runAt.setHours(hours, minutes, 0, 0);

    if (runAt.getTime() > now.getTime()) {
      return { runAt, weekdayId };
    }
  }

  return null;
}

/** Обновить один день в копии расписания */
export function patchWeekdaySchedule(
  schedule: IScenarioWeeklyScheduleData,
  weekdayId: TWeekdayId,
  patch: Partial<IWeekdayScheduleEntry>,
): IScenarioWeeklyScheduleData {
  return {
    ...schedule,
    weekdays: {
      ...schedule.weekdays,
      [weekdayId]: {
        ...schedule.weekdays[weekdayId],
        ...patch,
      },
    },
  };
}
