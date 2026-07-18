import type { ISleepNightWindow } from '@/domain/sleepNight.typings';
import type { INightSchedule } from '@/domain/nightSchedule.typings';
import { DEFAULT_NIGHT_SCHEDULE } from '@/domain/nightSchedule';
import { aggregateWearableNight } from '@/health/aggregateWearableNight';
import { buildWearableQueryWindow } from '@/health/buildWearableQueryWindow';
import type {
  ISleepWearableNightSummary,
  ISleepWearableSegment,
  TWearableSleepStatus,
} from '@/health/healthKitSleep.typings';
import type { ISleepScoreNightInput } from '@/health/sleepScore.typings';
import {
  measureSleepContinuity,
  resolveTimeInBedMinutes,
} from '@/health/sleepScoreFromSegments';

/** Ночь истории: сводка + вход для формулы */
export interface IWearableHistoryNight {
  /** Дата пробуждения */
  nightDate: string;
  /** Окно ночи */
  window: ISleepNightWindow;
  /** Агрегированная сводка */
  summary: ISleepWearableNightSummary;
  /** Сегменты после дедупа в query-окне */
  segments: ISleepWearableSegment[];
  /** Вход для computeSleepScore */
  scoreInput: ISleepScoreNightInput;
}

/** Результат batch-загрузки истории сна */
export interface IWearableSleepHistoryResult {
  /** Статус доступа / данных */
  status: TWearableSleepStatus;
  /** Ночи с данными, по возрастанию даты */
  nights: IWearableHistoryNight[];
}

function segmentOverlapsRange(
  segment: ISleepWearableSegment,
  startAt: Date,
  endAt: Date,
): boolean {
  return segment.startAt < endAt && segment.endAt > startAt;
}

/** Раскладывает сегменты по ночным окнам и строит score inputs */
export function bucketWearableSegmentsByNight(
  segments: ISleepWearableSegment[],
  windows: ISleepNightWindow[],
  schedule: INightSchedule = DEFAULT_NIGHT_SCHEDULE,
): IWearableHistoryNight[] {
  const nights: IWearableHistoryNight[] = [];

  for (const window of windows) {
    const queryWindow = buildWearableQueryWindow(window, schedule);
    const nightSegments = segments.filter((segment) =>
      segmentOverlapsRange(segment, queryWindow.startAt, queryWindow.endAt),
    );
    if (nightSegments.length === 0) {
      continue;
    }

    const summary = aggregateWearableNight(nightSegments);
    if (summary === null || summary.totalSleepMinutes === undefined) {
      continue;
    }

    const continuity = measureSleepContinuity(nightSegments);
    const timeInBedMinutes = resolveTimeInBedMinutes(summary, nightSegments);

    nights.push({
      nightDate: window.nightDate,
      window,
      summary,
      segments: nightSegments,
      scoreInput: {
        nightDate: window.nightDate,
        totalSleepMinutes: summary.totalSleepMinutes,
        timeInBedMinutes,
        fellAsleepAt: summary.fellAsleepAt,
        wokeAt: summary.wokeAt,
        wasoMinutes: continuity.wasoMinutes,
        awakeningCount: continuity.awakeningCount,
        continuityHasSignal: continuity.hasSignal,
      },
    });
  }

  return nights;
}
