import type { ISleepNightSummary } from '@/domain/sleepNight.typings';

/** Последняя (самая новая) ночь в недельной сетке */
export function pickDefaultNight(nights: ISleepNightSummary[]): ISleepNightSummary | null {
  if (nights.length === 0) {
    return null;
  }

  return nights.at(-1) ?? null;
}
