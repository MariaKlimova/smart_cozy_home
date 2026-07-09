import type {
  ISleepWearableNightSummary,
  ISleepWearableSegment,
  TWearableSleepQualityTier,
} from '@/health/healthKitSleep.typings';
import {
  WEARABLE_SLEEP_QUALITY_TIER_FAIR_MIN,
  WEARABLE_SLEEP_QUALITY_TIER_GOOD_MIN,
  WEARABLE_SLEEP_QUALITY_TIER_EXCELLENT_MIN,
} from '@/health/wearableSleep.const';

/** Уровень качества по числовой оценке трекера */
export function wearableSleepQualityTier(score: number): TWearableSleepQualityTier {
  if (score >= WEARABLE_SLEEP_QUALITY_TIER_EXCELLENT_MIN) {
    return 'excellent';
  }
  if (score >= WEARABLE_SLEEP_QUALITY_TIER_GOOD_MIN) {
    return 'good';
  }
  if (score >= WEARABLE_SLEEP_QUALITY_TIER_FAIR_MIN) {
    return 'fair';
  }
  return 'poor';
}

function pickTrackerSleepScore(
  segments: ISleepWearableSegment[],
  primarySourceBundleId?: string,
): number | undefined {
  const scoredSegments = segments.filter((segment) => segment.trackerSleepScore !== undefined);
  if (scoredSegments.length === 0) {
    return undefined;
  }

  if (primarySourceBundleId) {
    const primaryScores = scoredSegments
      .filter((segment) => segment.sourceBundleId === primarySourceBundleId)
      .map((segment) => segment.trackerSleepScore as number);

    if (primaryScores.length > 0) {
      const uniquePrimaryScores = [...new Set(primaryScores)];
      if (uniquePrimaryScores.length === 1) {
        return uniquePrimaryScores[0];
      }
      return Math.max(...uniquePrimaryScores);
    }
  }

  const uniqueScores = [...new Set(scoredSegments.map((segment) => segment.trackerSleepScore as number))];
  if (uniqueScores.length === 1) {
    return uniqueScores[0];
  }

  return Math.max(...uniqueScores);
}

/** Берёт оценку качества только из метаданных трекера в HealthKit */
export function resolveWearableSleepQuality(
  scoreSourceSegments: ISleepWearableSegment[],
  summary: ISleepWearableNightSummary,
): Pick<ISleepWearableNightSummary, 'sleepQualityScore' | 'sleepQualityTier'> {
  const trackerScore = pickTrackerSleepScore(scoreSourceSegments, summary.primarySourceBundleId);
  if (trackerScore === undefined) {
    return {};
  }

  return {
    sleepQualityScore: trackerScore,
    sleepQualityTier: wearableSleepQualityTier(trackerScore),
  };
}
