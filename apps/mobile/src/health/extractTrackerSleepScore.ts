import type { AnyMap } from 'react-native-nitro-modules';

const TRACKER_SLEEP_SCORE_METADATA_KEYS = [
  'SleepScore',
  'sleep_score',
  'sleepScore',
  'Sleep Score',
  'polar_sleep_score',
  'PolarSleepScore',
  'sleep_quality',
  'SleepQuality',
  'PolarSleepQuality',
  'polar_sleep_quality',
] as const;

function parseSleepScoreValue(value: unknown): number | undefined {
  let parsed = Number.NaN;

  if (typeof value === 'number') {
    parsed = value;
  } else if (typeof value === 'string') {
    parsed = Number.parseFloat(value);
  }

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  if (parsed > 0 && parsed <= 10) {
    return Math.round(parsed * 10);
  }

  if (parsed >= 0 && parsed <= 100) {
    return Math.round(parsed);
  }

  return undefined;
}

function isSleepScoreMetadataKey(key: string): boolean {
  if (TRACKER_SLEEP_SCORE_METADATA_KEYS.includes(key as (typeof TRACKER_SLEEP_SCORE_METADATA_KEYS)[number])) {
    return true;
  }

  const normalizedKey = key.toLowerCase();
  return normalizedKey.includes('sleep') && (normalizedKey.includes('score') || normalizedKey.includes('quality'));
}

function scoreFromMetadataKey(key: string, value: unknown): number | undefined {
  if (!isSleepScoreMetadataKey(key)) {
    return undefined;
  }

  return parseSleepScoreValue(value);
}

/** Пытается извлечь оценку сна из метаданных HealthKit-сэмпла */
export function extractTrackerSleepScoreFromMetadata(metadata: AnyMap | undefined): number | undefined {
  if (!metadata) {
    return undefined;
  }

  for (const key of TRACKER_SLEEP_SCORE_METADATA_KEYS) {
    const score = scoreFromMetadataKey(key, metadata[key]);
    if (score !== undefined) {
      return score;
    }
  }

  for (const [key, value] of Object.entries(metadata)) {
    const score = scoreFromMetadataKey(key, value);
    if (score !== undefined) {
      return score;
    }
  }

  return undefined;
}
