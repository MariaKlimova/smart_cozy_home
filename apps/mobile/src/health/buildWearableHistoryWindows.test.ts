import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DEFAULT_NIGHT_SCHEDULE } from '@/domain/nightSchedule';
import { buildWearableHistoryWindows } from '@/health/buildWearableHistoryWindows';
import { bucketWearableSegmentsByNight } from '@/health/bucketWearableSegmentsByNight';
import type { ISleepWearableSegment } from '@/health/healthKitSleep.typings';
import { WEARABLE_SLEEP_HISTORY_NIGHTS } from '@/health/sleepScore.const';

describe('buildWearableHistoryWindows', () => {
  it('builds 31 nights ending at historyEnd wake date', () => {
    const windows = buildWearableHistoryWindows(
      new Date(2026, 6, 18),
      DEFAULT_NIGHT_SCHEDULE,
    );
    assert.equal(windows.length, WEARABLE_SLEEP_HISTORY_NIGHTS);
    assert.equal(windows[windows.length - 1].nightDate, '2026-07-18');
    assert.equal(windows[0].nightDate, '2026-06-18');
  });
});

describe('bucketWearableSegmentsByNight', () => {
  it('assigns overlapping segments to nights', () => {
    const windows = buildWearableHistoryWindows(
      new Date(2026, 6, 3),
      DEFAULT_NIGHT_SCHEDULE,
      3,
    );
    const segments: ISleepWearableSegment[] = [
      {
        startAt: new Date(2026, 6, 1, 23, 30),
        endAt: new Date(2026, 6, 2, 6, 30),
        stage: 'asleepCore',
        sourceName: 'Polar',
        sourceBundleId: 'fi.polar',
      },
      {
        startAt: new Date(2026, 6, 2, 23, 30),
        endAt: new Date(2026, 6, 3, 6, 30),
        stage: 'asleepCore',
        sourceName: 'Polar',
        sourceBundleId: 'fi.polar',
      },
    ];

    const nights = bucketWearableSegmentsByNight(segments, windows, DEFAULT_NIGHT_SCHEDULE);
    assert.equal(nights.length, 2);
    assert.equal(nights[0].nightDate, '2026-07-02');
    assert.equal(nights[1].nightDate, '2026-07-03');
  });
});
