import type { ISleepWearableNightSummary, ISleepWearableSegment } from '@/health/healthKitSleep.typings';
import { resolveWearableSleepQuality } from '@/health/scoreWearableSleepQuality';
import { ASLEEP_WEARABLE_STAGES } from '@/health/wearableSleep.const';

function durationMinutes(startAt: Date, endAt: Date): number {
  return Math.max(0, (endAt.getTime() - startAt.getTime()) / 60_000);
}

function isAsleepStage(stage: ISleepWearableSegment['stage']): boolean {
  return ASLEEP_WEARABLE_STAGES.includes(stage);
}

function accumulateStageMinutes(
  segments: ISleepWearableSegment[],
): Partial<Record<ISleepWearableSegment['stage'], number>> {
  const stageMinutes: Partial<Record<ISleepWearableSegment['stage'], number>> = {};

  for (const segment of segments) {
    const minutes = durationMinutes(segment.startAt, segment.endAt);
    stageMinutes[segment.stage] = (stageMinutes[segment.stage] ?? 0) + minutes;
  }

  return stageMinutes;
}

function pickPrimarySource(segments: ISleepWearableSegment[]): {
  name?: string;
  bundleId?: string;
} {
  const totals = new Map<string, { name: string; bundleId: string; minutes: number }>();

  for (const segment of segments) {
    if (!isAsleepStage(segment.stage)) {
      continue;
    }
    const minutes = durationMinutes(segment.startAt, segment.endAt);
    const existing = totals.get(segment.sourceBundleId);
    if (existing) {
      existing.minutes += minutes;
      continue;
    }
    totals.set(segment.sourceBundleId, {
      name: segment.sourceName,
      bundleId: segment.sourceBundleId,
      minutes,
    });
  }

  let best: { name: string; bundleId: string; minutes: number } | undefined;

  for (const entry of totals.values()) {
    if (!best || entry.minutes > best.minutes) {
      best = entry;
    }
  }

  if (!best) {
    return {};
  }

  return {
    name: best.name,
    bundleId: best.bundleId,
  };
}

/** Агрегирует дедуплицированные сегменты в сводку за ночь */
export function aggregateWearableNight(
  segments: ISleepWearableSegment[],
  scoreSourceSegments: ISleepWearableSegment[] = segments,
): ISleepWearableNightSummary | null {
  if (segments.length === 0) {
    return null;
  }

  const stageMinutes = accumulateStageMinutes(segments);
  const asleepSegments = segments.filter((segment) => isAsleepStage(segment.stage));

  let fellAsleepAt: Date | undefined;
  let wokeAt: Date | undefined;
  let totalSleepMinutes = 0;

  if (asleepSegments.length > 0) {
    fellAsleepAt = asleepSegments.reduce(
      (earliest, segment) => (segment.startAt < earliest ? segment.startAt : earliest),
      asleepSegments[0].startAt,
    );
    wokeAt = asleepSegments.reduce(
      (latest, segment) => (segment.endAt > latest ? segment.endAt : latest),
      asleepSegments[0].endAt,
    );
    totalSleepMinutes = asleepSegments.reduce(
      (sum, segment) => sum + durationMinutes(segment.startAt, segment.endAt),
      0,
    );
  } else {
    const inBedSegments = segments.filter((segment) => segment.stage === 'inBed');
    if (inBedSegments.length > 0) {
      fellAsleepAt = inBedSegments[0].startAt;
      wokeAt = inBedSegments[inBedSegments.length - 1].endAt;
      totalSleepMinutes = inBedSegments.reduce(
        (sum, segment) => sum + durationMinutes(segment.startAt, segment.endAt),
        0,
      );
    }
  }

  if (totalSleepMinutes <= 0) {
    return null;
  }

  const primarySource = pickPrimarySource(segments);
  const baseSummary: ISleepWearableNightSummary = {
    fellAsleepAt,
    wokeAt,
    totalSleepMinutes: Math.round(totalSleepMinutes),
    stageMinutes,
    primarySourceName: primarySource.name,
    primarySourceBundleId: primarySource.bundleId,
  };

  return {
    ...baseSummary,
    ...resolveWearableSleepQuality(scoreSourceSegments, baseSummary),
  };
}
