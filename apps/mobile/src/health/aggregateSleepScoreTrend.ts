import { wearableSleepQualityTier } from '@/health/scoreWearableSleepQuality';
import { SLEEP_SCORE_BASELINE_NIGHTS } from '@/health/sleepScore.const';
import type {
  ISleepScoreComponents,
  ISleepScoreResult,
  ISleepScoreTrend,
  TSleepScoreTrendDays,
} from '@/health/sleepScore.typings';

function averageNullable(values: (number | null)[]): number | null {
  const present = values.filter((value): value is number => value !== null);
  if (present.length === 0) {
    return null;
  }
  return present.reduce((sum, value) => sum + value, 0) / present.length;
}

/** Усредняет scores за последние `trendDays` ночей с данными */
export function aggregateSleepScoreTrend(
  nightScores: ISleepScoreResult[],
  trendDays: TSleepScoreTrendDays,
): ISleepScoreTrend | null {
  if (nightScores.length === 0) {
    return null;
  }

  const window = nightScores.slice(-trendDays);
  const scoreSum = window.reduce((sum, night) => sum + night.score, 0);
  const score = Math.round(scoreSum / window.length);

  const components: ISleepScoreComponents = {
    duration: averageNullable(window.map((night) => night.components.duration)),
    efficiency: averageNullable(window.map((night) => night.components.efficiency)),
    continuity: averageNullable(window.map((night) => night.components.continuity)),
    consistency: averageNullable(window.map((night) => night.components.consistency)),
  };

  if (components.duration !== null) {
    components.duration = Math.round(components.duration);
  }
  if (components.efficiency !== null) {
    components.efficiency = Math.round(components.efficiency);
  }
  if (components.continuity !== null) {
    components.continuity = Math.round(components.continuity);
  }
  if (components.consistency !== null) {
    components.consistency = Math.round(components.consistency);
  }

  const last = window[window.length - 1];
  const isColdStart = nightScores.length < SLEEP_SCORE_BASELINE_NIGHTS;

  return {
    score,
    components,
    tier: wearableSleepQualityTier(score),
    isColdStart,
    belowRecommendedNorm: last.belowRecommendedNorm,
    nightCount: window.length,
    trendDays,
  };
}
