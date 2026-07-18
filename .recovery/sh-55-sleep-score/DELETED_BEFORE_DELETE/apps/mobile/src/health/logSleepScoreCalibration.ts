import type { IWearableHistoryNight } from '@/health/bucketWearableSegmentsByNight';
import type { ISleepScoreResult } from '@/health/sleepScore.typings';
import {
  SLEEP_SCORE_AWAKENINGS_GOOD_MAX,
  SLEEP_SCORE_AWAKENINGS_POOR_MIN,
  SLEEP_SCORE_EFFICIENCY_CEILING,
  SLEEP_SCORE_EFFICIENCY_FLOOR,
  SLEEP_SCORE_WASO_GOOD_MAX,
  SLEEP_SCORE_WASO_POOR_MIN,
} from '@/health/sleepScore.const';

/** Строка калибровки efficiency / continuity для одной ночи */
export interface ISleepScoreCalibrationRow {
  /** Дата пробуждения */
  nightDate: string;
  /** TST, мин */
  tst: number;
  /** Time in bed, мин */
  inBed: number | undefined;
  /** Сырая efficiency 0–1 */
  efficiencyRaw: number | null;
  /** Efficiency score 0–100 */
  efficiencyScore: number | null;
  /** WASO, мин */
  waso: number;
  /** Число пробуждений */
  awakenings: number;
  /** Continuity score 0–100 */
  continuityScore: number | null;
  /** Минуты inBed из стадий */
  stageInBed: number;
  /** Минуты awake из стадий */
  stageAwake: number;
  /** Минуты asleep* из стадий */
  stageAsleep: number;
}

function buildCalibrationRows(
  nights: IWearableHistoryNight[],
  scores: ISleepScoreResult[],
): ISleepScoreCalibrationRow[] {
  return nights.map((night, index) => {
    const input = night.scoreInput;
    const score = scores[index];
    const inBed = input.timeInBedMinutes;
    let efficiencyRaw: number | null = null;
    if (inBed !== undefined && inBed > 0 && input.totalSleepMinutes > 0) {
      efficiencyRaw = Math.min(1, input.totalSleepMinutes / inBed);
    }

    const stageMinutes = night.summary.stageMinutes;
    const stageAsleep =
      (stageMinutes.asleepCore ?? 0) +
      (stageMinutes.asleepDeep ?? 0) +
      (stageMinutes.asleepREM ?? 0) +
      (stageMinutes.asleepUnspecified ?? 0);

    return {
      nightDate: night.nightDate,
      tst: input.totalSleepMinutes,
      inBed,
      efficiencyRaw,
      efficiencyScore: score?.components.efficiency ?? null,
      waso: input.wasoMinutes,
      awakenings: input.awakeningCount,
      continuityScore: score?.components.continuity ?? null,
      stageInBed: stageMinutes.inBed ?? 0,
      stageAwake: stageMinutes.awake ?? 0,
      stageAsleep: Math.round(stageAsleep),
    };
  });
}

/** Лог сырых данных efficiency/continuity для калибровки (только __DEV__) */
export function logSleepScoreCalibration(
  nights: IWearableHistoryNight[],
  scores: ISleepScoreResult[],
): void {
  if (!__DEV__ || nights.length === 0) {
    return;
  }

  const rows = buildCalibrationRows(nights, scores);
  const thresholds = {
    efficiencyFloor: SLEEP_SCORE_EFFICIENCY_FLOOR,
    efficiencyCeiling: SLEEP_SCORE_EFFICIENCY_CEILING,
    wasoGoodMax: SLEEP_SCORE_WASO_GOOD_MAX,
    wasoPoorMin: SLEEP_SCORE_WASO_POOR_MIN,
    awakeningsGoodMax: SLEEP_SCORE_AWAKENINGS_GOOD_MAX,
    awakeningsPoorMin: SLEEP_SCORE_AWAKENINGS_POOR_MIN,
  };

  // eslint-disable-next-line no-console -- temporary calibration aid for SH-55
  console.log('[SleepScore:calibrate] thresholds', thresholds);
  // eslint-disable-next-line no-console -- temporary calibration aid for SH-55
  console.log(
    '[SleepScore:calibrate] nights (copy this table)',
    rows.map((row) => ({
      ...row,
      efficiencyPct:
        row.efficiencyRaw === null ? null : Math.round(row.efficiencyRaw * 1000) / 10,
      note:
        row.stageInBed === 0 && row.stageAwake === 0
          ? 'no_inBed_no_awake'
          : undefined,
    })),
  );
}
