import {
  baselineDurationModifier,
  clinicalDurationScore,
} from '@/health/computeDurationScore';
import {
  bedtimeAnchorMinutes,
  clockMinutesFromMidnight,
} from '@/health/computeConsistencyScore';
import {
  SLEEP_SCORE_BASELINE_NIGHTS,
  sleepScoreAgeBand,
} from '@/health/sleepScore.const';
import type {
  ISleepScoreConsistencyMethod,
  ISleepScoreDurationMethod,
  ISleepScoreMethodDetails,
  ISleepScoreNightInput,
  ISleepScoreResult,
} from '@/health/sleepScore.typings';
import { median, sampleStdDev } from '@/health/sleepScoreMath';

function rollingWindowNights(
  nights: ISleepScoreNightInput[],
  endIndex: number,
  windowSize: number,
): ISleepScoreNightInput[] {
  const start = Math.max(0, endIndex - windowSize + 1);
  return nights.slice(start, endIndex + 1);
}

/** Детали методики duration + consistency для выбранной ночи */
export function buildSleepScoreMethodDetails(
  nights: ISleepScoreNightInput[],
  nightIndex: number,
  scoreResult: ISleepScoreResult,
  ageYears?: number,
): ISleepScoreMethodDetails | null {
  const night = nights[nightIndex];
  if (!night) {
    return null;
  }

  const ageBand = sleepScoreAgeBand(ageYears);
  const clinicalScore = Math.round(clinicalDurationScore(night.totalSleepMinutes, ageBand));
  const window = rollingWindowNights(nights, nightIndex, SLEEP_SCORE_BASELINE_NIGHTS);
  const baselineReady = window.length >= SLEEP_SCORE_BASELINE_NIGHTS;
  const baselineMinutes = baselineReady
    ? median(window.map((entry) => entry.totalSleepMinutes))
    : undefined;
  const appliedBaseline = !scoreResult.isColdStart && baselineMinutes !== undefined;
  const baselineModifier = appliedBaseline
    ? baselineDurationModifier(night.totalSleepMinutes, baselineMinutes)
    : 0;

  const duration: ISleepScoreDurationMethod = {
    tstMinutes: night.totalSleepMinutes,
    clinicalScore,
    baselineMinutes,
    baselineModifier,
    appliedBaseline,
    durationScore: scoreResult.components.duration ?? 0,
  };

  const consistencyNights = window.map((entry) => ({
    nightDate: entry.nightDate,
    fellAsleepAt: entry.fellAsleepAt,
    wokeAt: entry.wokeAt,
  }));

  let consistency: ISleepScoreConsistencyMethod = {
    isCollecting: scoreResult.isColdStart || scoreResult.components.consistency === null,
    nightCount: window.length,
    consistencyScore: scoreResult.components.consistency,
    nights: consistencyNights,
  };

  if (!consistency.isCollecting) {
    const fellAsleepAts = window
      .map((entry) => entry.fellAsleepAt)
      .filter((value): value is Date => value !== undefined);
    const wokeAts = window
      .map((entry) => entry.wokeAt)
      .filter((value): value is Date => value !== undefined);

    if (fellAsleepAts.length >= 2 && wokeAts.length >= 2) {
      const bedtimeStdMinutes = sampleStdDev(fellAsleepAts.map(bedtimeAnchorMinutes));
      const wakeStdMinutes = sampleStdDev(wokeAts.map(clockMinutesFromMidnight));
      consistency = {
        ...consistency,
        bedtimeStdMinutes: Math.round(bedtimeStdMinutes),
        wakeStdMinutes: Math.round(wakeStdMinutes),
        avgStdMinutes: Math.round((bedtimeStdMinutes + wakeStdMinutes) / 2),
      };
    }
  }

  return { duration, consistency };
}
