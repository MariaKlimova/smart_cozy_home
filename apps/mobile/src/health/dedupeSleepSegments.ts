import type { ISleepWearableSegment } from '@/health/healthKitSleep.typings';
import {
  WEARABLE_STAGE_DETAIL_RANK,
  getWearableSourcePriority,
} from '@/health/wearableSleep.const';

function compareSegments(a: ISleepWearableSegment, b: ISleepWearableSegment): number {
  const stageDiff = WEARABLE_STAGE_DETAIL_RANK[a.stage] - WEARABLE_STAGE_DETAIL_RANK[b.stage];
  if (stageDiff !== 0) {
    return stageDiff;
  }

  return getWearableSourcePriority(a.sourceBundleId, a.sourceName)
    - getWearableSourcePriority(b.sourceBundleId, b.sourceName);
}

function pickWinnerSegment(candidates: ISleepWearableSegment[]): ISleepWearableSegment {
  return candidates.reduce((best, current) => {
    if (compareSegments(current, best) > 0) {
      return current;
    }
    return best;
  });
}

function collectBoundaries(segments: ISleepWearableSegment[]): number[] {
  const points = new Set<number>();

  for (const segment of segments) {
    points.add(segment.startAt.getTime());
    points.add(segment.endAt.getTime());
  }

  return [...points].sort((a, b) => a - b);
}

function segmentsCovering(
  segments: ISleepWearableSegment[],
  startMs: number,
  endMs: number,
): ISleepWearableSegment[] {
  return segments.filter(
    (segment) => segment.startAt.getTime() <= startMs && segment.endAt.getTime() >= endMs,
  );
}

function mergeAdjacent(segments: ISleepWearableSegment[]): ISleepWearableSegment[] {
  if (segments.length === 0) {
    return [];
  }

  const merged: ISleepWearableSegment[] = [];
  let current = { ...segments[0] };

  for (let index = 1; index < segments.length; index += 1) {
    const next = segments[index];
    const sameStage = current.stage === next.stage;
    const sameSource = current.sourceBundleId === next.sourceBundleId
      && current.sourceName === next.sourceName;
    const touches = current.endAt.getTime() === next.startAt.getTime();

    if (sameStage && sameSource && touches) {
      current = {
        ...current,
        endAt: next.endAt,
        trackerSleepScore: current.trackerSleepScore ?? next.trackerSleepScore,
      };
      continue;
    }

    merged.push(current);
    current = { ...next };
  }

  merged.push(current);
  return merged;
}

/** Дедупликация пересекающихся сегментов из разных источников */
export function dedupeSleepSegments(segments: ISleepWearableSegment[]): ISleepWearableSegment[] {
  if (segments.length <= 1) {
    return segments.map((segment) => ({ ...segment }));
  }

  const boundaries = collectBoundaries(segments);
  const slices: ISleepWearableSegment[] = [];

  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const startMs = boundaries[index];
    const endMs = boundaries[index + 1];
    if (endMs <= startMs) {
      continue;
    }

    const covering = segmentsCovering(segments, startMs, endMs);
    if (covering.length === 0) {
      continue;
    }

    const winner = pickWinnerSegment(covering);
    slices.push({
      startAt: new Date(startMs),
      endAt: new Date(endMs),
      stage: winner.stage,
      sourceName: winner.sourceName,
      sourceBundleId: winner.sourceBundleId,
      ...(winner.trackerSleepScore !== undefined ? { trackerSleepScore: winner.trackerSleepScore } : {}),
    });
  }

  return mergeAdjacent(slices);
}
