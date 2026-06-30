import type { IHaEntityState } from '@/ha/types';

/** Ближайшее солнечное событие из sun.sun */
export interface ISunEventReading {
  /** Закат (день) или восход (ночь) */
  kind: 'sunset' | 'sunrise';
  /** Время HH:MM в локальной зоне устройства */
  time: string;
}

interface ISunEventCandidate {
  /** Закат или восход */
  kind: 'sunset' | 'sunrise';
  /** Момент события */
  at: Date;
}

function parseHaDatetime(isoString: string): Date | undefined {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function formatLocalTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function readFutureSunEvent(
  attributes: Record<string, unknown> | undefined,
  attributeKey: 'next_rising' | 'next_setting',
  kind: 'sunrise' | 'sunset',
  nowMs: number,
): ISunEventCandidate | undefined {
  const raw = attributes?.[attributeKey];
  if (typeof raw !== 'string' || raw.length === 0) return undefined;

  const at = parseHaDatetime(raw);
  if (!at || at.getTime() <= nowMs) return undefined;

  return { kind, at };
}

function pickNearestFutureEvent(
  attributes: Record<string, unknown> | undefined,
  now: Date,
): ISunEventCandidate | undefined {
  const nowMs = now.getTime();
  const candidates = [
    readFutureSunEvent(attributes, 'next_rising', 'sunrise', nowMs),
    readFutureSunEvent(attributes, 'next_setting', 'sunset', nowMs),
  ].filter((item): item is ISunEventCandidate => item !== undefined);

  if (candidates.length === 0) return undefined;

  candidates.sort((left, right) => left.at.getTime() - right.at.getTime());
  return candidates[0];
}

/** Парсит ближайший закат или восход из sun.sun */
export function parseSunEventFromHaState(
  state: IHaEntityState | undefined,
  now: Date = new Date(),
): ISunEventReading | undefined {
  if (!state || state.state === 'unavailable' || state.state === 'unknown') {
    return undefined;
  }

  const nearest = pickNearestFutureEvent(state.attributes, now);
  if (!nearest) return undefined;

  return {
    kind: nearest.kind,
    time: formatLocalTime(nearest.at),
  };
}
