import { copy } from '@/copy/ru';
import type {
  ISleepWearableNightSummary,
  TWearableSleepQualityTier,
} from '@/health/healthKitSleep.typings';
import { WEARABLE_SLEEP_NORM_MAX_MINUTES, findWearableSourceHintPattern } from '@/health/wearableSleep.const';

function padTimePart(value: number): string {
  return String(value).padStart(2, '0');
}

/** Форматирует время сна для UI */
export function formatWearableClockTime(date: Date): string {
  return `${padTimePart(date.getHours())}:${padTimePart(date.getMinutes())}`;
}

/** Форматирует длительность сна */
export function formatWearableSleepDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return copy.sleep.wearableDurationHoursMinutes
      .replace('{hours}', String(hours))
      .replace('{minutes}', String(minutes));
  }

  if (hours > 0) {
    return copy.sleep.wearableDurationHoursOnly.replace('{hours}', String(hours));
  }

  return copy.sleep.wearableDurationMinutesOnly.replace('{minutes}', String(minutes));
}

/** Диапазон засыпания и подъёма */
export function formatWearableBedtimeRange(summary: ISleepWearableNightSummary): string | null {
  if (!summary.fellAsleepAt || !summary.wokeAt) {
    return null;
  }

  return `${formatWearableClockTime(summary.fellAsleepAt)}${copy.sleep.wearableBedtimeSeparator}${formatWearableClockTime(summary.wokeAt)}`;
}

/** Доля заполнения полоски относительно верхней границы нормы */
export function computeWearableSleepNormProgress(totalMinutes: number): number {
  if (totalMinutes <= 0) {
    return 0;
  }

  return Math.min(1, totalMinutes / WEARABLE_SLEEP_NORM_MAX_MINUTES);
}

/** Человекочитаемое имя источника сна */
export function formatWearableSourceName(
  sourceName?: string,
  sourceBundleId?: string,
): string {
  const haystack = `${sourceName ?? ''} ${sourceBundleId ?? ''}`;
  const hintPattern = findWearableSourceHintPattern(haystack);

  if (hintPattern === 'polar') {
    return 'Polar';
  }
  if (hintPattern === 'oura') {
    return 'Oura';
  }
  if (hintPattern === 'garmin') {
    return 'Garmin';
  }
  if (hintPattern === 'whoop') {
    return 'Whoop';
  }
  if (hintPattern === 'watch' || hintPattern === 'apple') {
    return 'Apple Watch';
  }

  if (sourceName && sourceName !== 'SourceProxy') {
    return sourceName;
  }

  return copy.sleep.wearableSectionTitle;
}

/** Человекочитаемый уровень качества сна */
export function wearableSleepQualityLabel(tier: TWearableSleepQualityTier): string {
  if (tier === 'excellent') {
    return copy.sleep.wearableQualityExcellent;
  }
  if (tier === 'good') {
    return copy.sleep.wearableQualityGood;
  }
  if (tier === 'fair') {
    return copy.sleep.wearableQualityFair;
  }
  return copy.sleep.wearableQualityPoor;
}

/** Строка score · label */
export function formatSleepScoreValue(
  score: number,
  tier: TWearableSleepQualityTier,
): string {
  return copy.sleep.wearableQualityValue
    .replace('{score}', String(score))
    .replace('{label}', wearableSleepQualityLabel(tier));
}
