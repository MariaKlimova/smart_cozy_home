import { computeConsistencyScore } from '@/health/computeConsistencyScore';
import { computeContinuityScore } from '@/health/computeContinuityScore';
import { computeDurationScore } from '@/health/computeDurationScore';
import { computeEfficiencyScore } from '@/health/computeEfficiencyScore';
import { wearableSleepQualityTier } from '@/health/scoreWearableSleepQuality';
import {
  SLEEP_SCORE_BASELINE_NIGHTS,
  SLEEP_SCORE_RECOMMENDED_TST_MINUTES,
  SLEEP_SCORE_WEIGHT_CONSISTENCY,
  SLEEP_SCORE_WEIGHT_CONTINUITY,
  SLEEP_SCORE_WEIGHT_DURATION,
  SLEEP_SCORE_WEIGHT_EFFICIENCY,
} from '@/health/sleepScore.const';
import type {
  ISleepScoreComponents,
  ISleepScoreNightInput,
  ISleepScoreResult,
} from '@/health/sleepScore.typings';
import {
  resolveBaselineMinutes,
  rollingAverageTst,
  rollingWindowNights,
} from '@/health/sleepScoreWindow';

function weightedAverage(
  parts: { score: number; weight: number }[],
): number {
  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  if (totalWeight <= 0) {
    return 0;
  }
  const sum = parts.reduce((acc, part) => acc + part.score * part.weight, 0);
  return sum / totalWeight;
}

export interface IComputeSleepScoreParams {
  /** Ночи по возрастанию nightDate */
  nights: ISleepScoreNightInput[];
  /** Индекс ночи для score */
  nightIndex: number;
  /** Возраст, лет */
  ageYears?: number;
}

/** Собирает weighted sleep score для одной ночи */
export function computeSleepScore(params: IComputeSleepScoreParams): ISleepScoreResult {
  const { nights, nightIndex, ageYears } = params;
  const night = nights[nightIndex];
  const nightsWithData = nights.length;
  const isColdStart = nightsWithData < SLEEP_SCORE_BASELINE_NIGHTS;

  const baselineMinutes = resolveBaselineMinutes(nights, nightIndex);
  const duration = computeDurationScore({
    tstMinutes: night.totalSleepMinutes,
    baselineMinutes,
    applyBaselineModifier: !isColdStart && baselineMinutes !== undefined,
    ageYears,
  });

  const efficiency = computeEfficiencyScore(
    night.totalSleepMinutes,
    night.timeInBedMinutes,
  );

  let continuity: number | null = null;
  if (night.continuityHasSignal) {
    continuity = computeContinuityScore(night.wasoMinutes, night.awakeningCount);
  }

  const consistencyWindow = rollingWindowNights(
    nights,
    nightIndex,
    SLEEP_SCORE_BASELINE_NIGHTS,
  );
  let consistency: number | null = null;
  if (!isColdStart && consistencyWindow.length >= SLEEP_SCORE_BASELINE_NIGHTS) {
    const fellAsleepAts = consistencyWindow
      .map((entry) => entry.fellAsleepAt)
      .filter((value): value is Date => value !== undefined);
    const wokeAts = consistencyWindow
      .map((entry) => entry.wokeAt)
      .filter((value): value is Date => value !== undefined);
    consistency = computeConsistencyScore(fellAsleepAts, wokeAts);
  }

  const components: ISleepScoreComponents = {
    duration,
    efficiency,
    continuity,
    consistency,
  };

  const parts: { score: number; weight: number }[] = [
    { score: duration, weight: SLEEP_SCORE_WEIGHT_DURATION },
  ];
  if (efficiency !== null) {
    parts.push({ score: efficiency, weight: SLEEP_SCORE_WEIGHT_EFFICIENCY });
  }
  if (continuity !== null) {
    parts.push({ score: continuity, weight: SLEEP_SCORE_WEIGHT_CONTINUITY });
  }
  if (consistency !== null) {
    parts.push({ score: consistency, weight: SLEEP_SCORE_WEIGHT_CONSISTENCY });
  }

  const score = Math.round(weightedAverage(parts));

  const avg7 = rollingAverageTst(nights, nightIndex);
  const belowRecommendedNorm =
    night.totalSleepMinutes < SLEEP_SCORE_RECOMMENDED_TST_MINUTES ||
    (avg7 !== undefined && avg7 < SLEEP_SCORE_RECOMMENDED_TST_MINUTES);

  return {
    score,
    components,
    isColdStart,
    belowRecommendedNorm,
    tier: wearableSleepQualityTier(score),
  };
}

/** Считает score для каждой ночи в истории */
export function computeSleepScoresForHistory(
  nights: ISleepScoreNightInput[],
  ageYears?: number,
): ISleepScoreResult[] {
  return nights.map((_, nightIndex) =>
    computeSleepScore({ nights, nightIndex, ageYears }),
  );
}
