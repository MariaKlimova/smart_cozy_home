import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { measureSleepContinuity, resolveTimeInBedMinutes } from '@/health/sleepScoreFromSegments';
import type { ISleepWearableNightSummary, ISleepWearableSegment } from '@/health/healthKitSleep.typings';

describe('resolveTimeInBedMinutes', () => {
  it('uses inBed stage minutes only', () => {
    const summary: ISleepWearableNightSummary = {
      totalSleepMinutes: 400,
      stageMinutes: { inBed: 450, asleepCore: 400 },
    };
    assert.equal(resolveTimeInBedMinutes(summary, []), 450);
  });

  it('returns undefined without inBed stage', () => {
    const start = new Date('2026-07-01T23:00:00');
    const segs: ISleepWearableSegment[] = [
      {
        startAt: start,
        endAt: new Date(start.getTime() + 200 * 60_000),
        stage: 'asleepCore',
        sourceName: 'Polar',
        sourceBundleId: 'fi.polar',
      },
    ];
    const summary: ISleepWearableNightSummary = {
      totalSleepMinutes: 200,
      stageMinutes: { asleepCore: 200 },
    };
    assert.equal(resolveTimeInBedMinutes(summary, segs), undefined);
  });
});

describe('measureSleepContinuity', () => {
  it('counts WASO and awakenings from awake segments', () => {
    const start = new Date('2026-07-01T23:00:00');
    const segments: ISleepWearableSegment[] = [
      {
        startAt: start,
        endAt: new Date(start.getTime() + 60 * 60_000),
        stage: 'asleepCore',
        sourceName: 'Polar',
        sourceBundleId: 'fi.polar',
      },
      {
        startAt: new Date(start.getTime() + 60 * 60_000),
        endAt: new Date(start.getTime() + 80 * 60_000),
        stage: 'awake',
        sourceName: 'Polar',
        sourceBundleId: 'fi.polar',
      },
      {
        startAt: new Date(start.getTime() + 80 * 60_000),
        endAt: new Date(start.getTime() + 200 * 60_000),
        stage: 'asleepCore',
        sourceName: 'Polar',
        sourceBundleId: 'fi.polar',
      },
    ];

    const result = measureSleepContinuity(segments);
    assert.equal(result.wasoMinutes, 20);
    assert.equal(result.awakeningCount, 1);
    assert.equal(result.hasSignal, true);
  });

  it('counts gaps between asleep as signal', () => {
    const start = new Date('2026-07-01T23:00:00');
    const segments: ISleepWearableSegment[] = [
      {
        startAt: start,
        endAt: new Date(start.getTime() + 60 * 60_000),
        stage: 'asleepCore',
        sourceName: 'Polar',
        sourceBundleId: 'fi.polar',
      },
      {
        startAt: new Date(start.getTime() + 75 * 60_000),
        endAt: new Date(start.getTime() + 180 * 60_000),
        stage: 'asleepCore',
        sourceName: 'Polar',
        sourceBundleId: 'fi.polar',
      },
    ];

    const result = measureSleepContinuity(segments);
    assert.equal(result.wasoMinutes, 15);
    assert.equal(result.awakeningCount, 1);
    assert.equal(result.hasSignal, true);
  });

  it('has no signal for single continuous asleep block', () => {
    const start = new Date('2026-07-01T23:00:00');
    const segments: ISleepWearableSegment[] = [
      {
        startAt: start,
        endAt: new Date(start.getTime() + 400 * 60_000),
        stage: 'asleepCore',
        sourceName: 'Polar',
        sourceBundleId: 'fi.polar',
      },
    ];

    const result = measureSleepContinuity(segments);
    assert.equal(result.hasSignal, false);
    assert.equal(result.wasoMinutes, 0);
    assert.equal(result.awakeningCount, 0);
  });
});
