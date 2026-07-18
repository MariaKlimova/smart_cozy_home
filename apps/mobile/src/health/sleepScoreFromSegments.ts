import type {
  ISleepWearableNightSummary,
  ISleepWearableSegment,
} from '@/health/healthKitSleep.typings';
import { ASLEEP_WEARABLE_STAGES } from '@/health/wearableSleep.const';

/** Минимальный разрыв между asleep, мин — считаем пробуждением */
const ASLEEP_GAP_AWAKENING_MIN_MINUTES = 1;

function durationMinutes(startAt: Date, endAt: Date): number {
  return Math.max(0, (endAt.getTime() - startAt.getTime()) / 60_000);
}

function isAsleepStage(stage: ISleepWearableSegment['stage']): boolean {
  return ASLEEP_WEARABLE_STAGES.includes(stage);
}

/**
 * Минуты в кровати только из стадии inBed.
 * Fallback asleep+awake даёт efficiency=100 при отсутствии awake — сигнал бесполезен.
 */
export function resolveTimeInBedMinutes(
  summary: ISleepWearableNightSummary,
  _segments: ISleepWearableSegment[],
): number | undefined {
  void _segments;
  const inBed = summary.stageMinutes.inBed ?? 0;
  if (inBed <= 0) {
    return undefined;
  }
  return Math.round(inBed);
}

/** WASO и пробуждения: явный awake + разрывы между asleep */
export function measureSleepContinuity(segments: ISleepWearableSegment[]): {
  wasoMinutes: number;
  awakeningCount: number;
  /** Есть awake или разрывы — иначе continuity не считаем */
  hasSignal: boolean;
} {
  const relevant = segments
    .filter((segment) => segment.stage === 'awake' || isAsleepStage(segment.stage))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  const asleep = relevant.filter((segment) => isAsleepStage(segment.stage));
  if (asleep.length === 0) {
    return { wasoMinutes: 0, awakeningCount: 0, hasSignal: false };
  }

  const firstAsleepStart = asleep.reduce(
    (earliest, segment) => (segment.startAt < earliest ? segment.startAt : earliest),
    asleep[0].startAt,
  );
  const lastAsleepEnd = asleep.reduce(
    (latest, segment) => (segment.endAt > latest ? segment.endAt : latest),
    asleep[0].endAt,
  );

  let wasoMinutes = 0;
  let awakeningCount = 0;
  let hasAwake = false;

  for (const segment of relevant) {
    if (segment.stage !== 'awake') {
      continue;
    }
    hasAwake = true;
    if (segment.endAt <= firstAsleepStart || segment.startAt >= lastAsleepEnd) {
      continue;
    }
    const clippedStart = segment.startAt < firstAsleepStart ? firstAsleepStart : segment.startAt;
    const clippedEnd = segment.endAt > lastAsleepEnd ? lastAsleepEnd : segment.endAt;
    wasoMinutes += durationMinutes(clippedStart, clippedEnd);
  }

  for (let index = 1; index < relevant.length; index += 1) {
    const prev = relevant[index - 1];
    const current = relevant[index];
    if (isAsleepStage(prev.stage) && current.stage === 'awake') {
      if (current.startAt >= firstAsleepStart && current.startAt < lastAsleepEnd) {
        awakeningCount += 1;
      }
    }
  }

  let hasGaps = false;
  const asleepSorted = [...asleep].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  for (let index = 1; index < asleepSorted.length; index += 1) {
    const prev = asleepSorted[index - 1];
    const current = asleepSorted[index];
    const gap = durationMinutes(prev.endAt, current.startAt);
    if (gap < ASLEEP_GAP_AWAKENING_MIN_MINUTES) {
      continue;
    }

    const gapCoveredByAwake = relevant.some(
      (segment) =>
        segment.stage === 'awake' &&
        segment.startAt < current.startAt &&
        segment.endAt > prev.endAt,
    );
    if (gapCoveredByAwake) {
      continue;
    }

    hasGaps = true;
    wasoMinutes += gap;
    awakeningCount += 1;
  }

  const hasSignal = hasAwake || hasGaps;

  return {
    wasoMinutes: Math.round(wasoMinutes),
    awakeningCount,
    hasSignal,
  };
}
