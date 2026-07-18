import {
  SLEEP_SCORE_BASELINE_BONUS_CLOSE,
  SLEEP_SCORE_BASELINE_BONUS_NEAR,
  SLEEP_SCORE_BASELINE_DEV_CLOSE,
  SLEEP_SCORE_BASELINE_DEV_NEAR,
  sleepScoreAgeBand,
} from '@/health/sleepScore.const';
import type { TSleepScoreAgeBand } from '@/health/sleepScore.typings';
import { clampScore, lerpClamped } from '@/health/sleepScoreMath';

/** Клинический duration score для взрослых 18–64 */
function clinicalDurationAdult(tstMinutes: number): number {
  if (tstMinutes < 240) {
    return 0;
  }
  if (tstMinutes < 360) {
    return lerpClamped(tstMinutes, 240, 360, 0, 60);
  }
  if (tstMinutes < 420) {
    return lerpClamped(tstMinutes, 360, 420, 60, 100);
  }
  if (tstMinutes <= 540) {
    return 100;
  }
  if (tstMinutes < 600) {
    return lerpClamped(tstMinutes, 540, 600, 100, 85);
  }
  if (tstMinutes < 720) {
    return lerpClamped(tstMinutes, 600, 720, 85, 45);
  }
  return 30;
}

/** Клинический duration score для 65+ */
function clinicalDurationOlder(tstMinutes: number): number {
  if (tstMinutes < 240) {
    return 0;
  }
  if (tstMinutes < 360) {
    return lerpClamped(tstMinutes, 240, 360, 0, 60);
  }
  if (tstMinutes < 420) {
    return lerpClamped(tstMinutes, 360, 420, 60, 100);
  }
  if (tstMinutes <= 480) {
    return 100;
  }
  if (tstMinutes < 540) {
    return lerpClamped(tstMinutes, 480, 540, 100, 90);
  }
  if (tstMinutes < 600) {
    return lerpClamped(tstMinutes, 540, 600, 90, 85);
  }
  if (tstMinutes < 720) {
    return lerpClamped(tstMinutes, 600, 720, 85, 45);
  }
  return 30;
}

/** Клинический скор по TST и возрастной группе */
export function clinicalDurationScore(
  tstMinutes: number,
  ageBand: TSleepScoreAgeBand,
): number {
  if (ageBand === 'older') {
    return clinicalDurationOlder(tstMinutes);
  }
  return clinicalDurationAdult(tstMinutes);
}

/** Модификатор baseline по |TST − median|, 0 / 5 / 10 */
export function baselineDurationModifier(
  tstMinutes: number,
  baselineMinutes: number | undefined,
): number {
  if (baselineMinutes === undefined) {
    return 0;
  }
  const deviation = Math.abs(tstMinutes - baselineMinutes);
  if (deviation <= SLEEP_SCORE_BASELINE_DEV_CLOSE) {
    return SLEEP_SCORE_BASELINE_BONUS_CLOSE;
  }
  if (deviation <= SLEEP_SCORE_BASELINE_DEV_NEAR) {
    return SLEEP_SCORE_BASELINE_BONUS_NEAR;
  }
  return 0;
}

export interface IComputeDurationScoreParams {
  /** TST сегодня, минуты */
  tstMinutes: number;
  /** Медиана TST за rolling 7 ночей; undefined в cold start */
  baselineMinutes?: number;
  /** Применять baseline modifier */
  applyBaselineModifier: boolean;
  /** Возраст пользователя, лет */
  ageYears?: number;
}

/** Duration score 0–100 */
export function computeDurationScore(params: IComputeDurationScoreParams): number {
  const ageBand = sleepScoreAgeBand(params.ageYears);
  const clinical = clinicalDurationScore(params.tstMinutes, ageBand);

  if (!params.applyBaselineModifier) {
    return clampScore(clinical);
  }

  const modifier = baselineDurationModifier(params.tstMinutes, params.baselineMinutes);
  return clampScore(clinical + modifier);
}
