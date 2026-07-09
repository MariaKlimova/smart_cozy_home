import type { ISleepWearableSegment } from '@/health/healthKitSleep.typings';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { dedupeSleepSegments } from '@/health/dedupeSleepSegments';

function segment(
  hour: number,
  durationMin: number,
  stage: ISleepWearableSegment['stage'],
  sourceName: string,
  sourceBundleId: string,
): ISleepWearableSegment {
  const startAt = new Date(`2026-07-01T${String(hour).padStart(2, '0')}:00:00`);
  return {
    startAt,
    endAt: new Date(startAt.getTime() + durationMin * 60_000),
    stage,
    sourceName,
    sourceBundleId,
  };
}

describe('dedupeSleepSegments', () => {
  it('returns empty array for empty input', () => {
    assert.deepEqual(dedupeSleepSegments([]), []);
  });

  it('prefers detailed sleep stage over coarse source on overlap', () => {
    const polar = segment(23, 240, 'asleepUnspecified', 'Polar Flow', 'fi.polar.polarflow');
    const watch = segment(23, 240, 'asleepDeep', 'Apple Watch', 'com.apple.health.watch');

    const result = dedupeSleepSegments([watch, polar]);
    assert.equal(result.length, 1);
    assert.equal(result[0]?.stage, 'asleepDeep');
    assert.equal(result[0]?.sourceName, 'Apple Watch');
  });

  it('prefers polar over apple watch on full overlap', () => {
    const polar = segment(23, 240, 'asleepDeep', 'Polar Flow', 'fi.polar.polarflow');
    const watch = segment(23, 240, 'asleepUnspecified', 'Apple Watch', 'com.apple.health.watch');

    const result = dedupeSleepSegments([watch, polar]);
    assert.equal(result.length, 1);
    assert.equal(result[0]?.stage, 'asleepDeep');
    assert.equal(result[0]?.sourceName, 'Polar Flow');
  });

  it('keeps fragmented awake segments from one source', () => {
    const fragmented = [
      segment(23, 40, 'asleepCore', 'Polar Flow', 'fi.polar.polarflow'),
      segment(23, 48, 'awake', 'Polar Flow', 'fi.polar.polarflow'),
      segment(0, 35, 'asleepDeep', 'Polar Flow', 'fi.polar.polarflow'),
    ];
    fragmented[1] = {
      ...fragmented[1],
      startAt: new Date(fragmented[0].endAt),
      endAt: new Date(fragmented[0].endAt.getTime() + 8 * 60_000),
    };
    fragmented[2] = {
      ...fragmented[2],
      startAt: new Date(fragmented[1].endAt),
      endAt: new Date(fragmented[1].endAt.getTime() + 35 * 60_000),
    };

    const result = dedupeSleepSegments(fragmented);
    const awakeCount = result.filter((item) => item.stage === 'awake').length;
    assert.ok(awakeCount >= 1);
    assert.equal(result.every((item) => item.sourceName === 'Polar Flow'), true);
  });

  it('passes through single source unchanged length after merge', () => {
    const nightStart = new Date('2026-07-01T23:00:00');
    const endAt = new Date(nightStart.getTime() + 420 * 60_000);
    const segments: ISleepWearableSegment[] = [{
      startAt: nightStart,
      endAt,
      stage: 'inBed',
      sourceName: 'iPhone',
      sourceBundleId: 'com.apple.health',
    }];
    const result = dedupeSleepSegments(segments);
    assert.equal(result.length, 1);
    assert.equal(result[0]?.stage, 'inBed');
  });
});
