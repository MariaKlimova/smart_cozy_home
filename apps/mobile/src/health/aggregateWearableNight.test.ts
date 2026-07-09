import { aggregateWearableNight } from '@/health/aggregateWearableNight';
import { dedupeSleepSegments } from '@/health/dedupeSleepSegments';
import type { ISleepWearableSegment } from '@/health/healthKitSleep.typings';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

function segment(
  startHour: number,
  durationMin: number,
  stage: ISleepWearableSegment['stage'],
): ISleepWearableSegment {
  const startAt = new Date(`2026-07-01T${String(startHour).padStart(2, '0')}:00:00`);
  return {
    startAt,
    endAt: new Date(startAt.getTime() + durationMin * 60_000),
    stage,
    sourceName: 'Polar Flow',
    sourceBundleId: 'fi.polar.polarflow',
  };
}

describe('aggregateWearableNight', () => {
  it('returns null for empty segments', () => {
    assert.equal(aggregateWearableNight([]), null);
  });

  it('sums asleep stage minutes', () => {
    const segments = dedupeSleepSegments([
      segment(23, 60, 'asleepCore'),
      segment(0, 45, 'asleepDeep'),
      segment(1, 30, 'asleepREM'),
    ]);

    const summary = aggregateWearableNight(segments);
    assert.ok(summary);
    assert.equal(summary?.totalSleepMinutes, 135);
    assert.ok(summary?.fellAsleepAt);
    assert.ok(summary?.wokeAt);
    assert.equal(summary?.primarySourceName, 'Polar Flow');
    assert.equal(summary?.sleepQualityScore, undefined);
    assert.equal(summary?.sleepQualityTier, undefined);
  });

  it('falls back to inBed when no asleep stages', () => {
    const nightStart = new Date('2026-07-01T22:00:00');
    const segments: ISleepWearableSegment[] = [{
      startAt: nightStart,
      endAt: new Date(nightStart.getTime() + 420 * 60_000),
      stage: 'inBed',
      sourceName: 'iPhone',
      sourceBundleId: 'com.apple.health',
    }];
    const summary = aggregateWearableNight(segments);

    assert.ok(summary);
    assert.equal(summary?.totalSleepMinutes, 420);
    assert.equal(summary?.stageMinutes.inBed, 420);
  });
});
