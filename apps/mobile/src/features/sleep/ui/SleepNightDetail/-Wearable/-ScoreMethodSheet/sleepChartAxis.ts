import { parseTimeParts } from '@/domain/nightSchedule';
import type { ISleepScoreConsistencyNightRow } from '@/health/sleepScore.typings';

import { SLEEP_CHART_PADDING_MINUTES } from './SleepNightDetail-ScoreMethodSheet.const';

/** Ось графика ночей: минуты от локального полудня */
export interface ISleepChartAxis {
  /** Начало оси, мин от полудня */
  start: number;
  /** Конец оси, мин от полудня */
  end: number;
  /** Подпись начала */
  startLabel: string;
  /** Подпись конца */
  endLabel: string;
}

/** Минуты от локального полудня (вечер и утро на одной шкале) */
export function overnightFromNoon(hours: number, minutes: number): number {
  const total = hours * 60 + minutes;
  const noon = 12 * 60;
  if (total >= noon) {
    return total - noon;
  }
  return total + (24 * 60 - noon);
}

export function dateOvernightFromNoon(date: Date): number {
  return overnightFromNoon(date.getHours(), date.getMinutes());
}

function formatClockFromOvernight(overnightMinutes: number): string {
  const clock = (12 * 60 + Math.round(overnightMinutes)) % (24 * 60);
  const hours = Math.floor(clock / 60);
  const minutes = clock % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function roundDownToHour(overnightMinutes: number): number {
  return Math.floor(overnightMinutes / 60) * 60;
}

function roundUpToHour(overnightMinutes: number): number {
  return Math.ceil(overnightMinutes / 60) * 60;
}

export function buildSleepChartAxis(
  nights: ISleepScoreConsistencyNightRow[],
  bedtime: string,
  wakeTime: string,
): ISleepChartAxis {
  const bed = parseTimeParts(bedtime);
  const wake = parseTimeParts(wakeTime);
  let start = overnightFromNoon(bed.hours, bed.minutes) - SLEEP_CHART_PADDING_MINUTES;
  let end = overnightFromNoon(wake.hours, wake.minutes) + SLEEP_CHART_PADDING_MINUTES;

  for (const night of nights) {
    if (!night.fellAsleepAt || !night.wokeAt) {
      continue;
    }
    const fell = dateOvernightFromNoon(night.fellAsleepAt);
    const woke = dateOvernightFromNoon(night.wokeAt);
    start = Math.min(start, fell - SLEEP_CHART_PADDING_MINUTES);
    end = Math.max(end, woke + SLEEP_CHART_PADDING_MINUTES);
  }

  if (end <= start) {
    end = start + 8 * 60;
  }

  start = roundDownToHour(Math.max(0, start));
  end = roundUpToHour(end);

  return {
    start,
    end,
    startLabel: formatClockFromOvernight(start),
    endLabel: formatClockFromOvernight(end),
  };
}

export function formatNightDateShort(nightDate: string): string {
  const [year, month, day] = nightDate.split('-').map(Number);
  if (!year || !month || !day) {
    return nightDate;
  }
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function pct(ratio: number): `${number}%` {
  return `${Math.round(ratio * 1000) / 10}%`;
}
