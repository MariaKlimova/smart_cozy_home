import type { ISleepWearableNightSummary, ISleepWearableSegment } from '@/health/healthKitSleep.typings';
import {
  resolveWearableSleepQuality,
  wearableSleepQualityTier,
} from '@/health/scoreWearableSleepQuality';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

function summary(partial: Partial<ISleepWearableNightSummary>): ISleepWearableNightSummary {
  return {
    totalSleepMinutes: 0,
    stageMinutes: {},
    ...partial,
  };
}

describe('scoreWearableSleepQuality', () => {
  it('maps tiers by score thresholds', () => {
    assert.equal(wearableSleepQualityTier(90), 'excellent');
    assert.equal(wearableSleepQualityTier(75), 'good');
    assert.equal(wearableSleepQualityTier(60), 'fair');
    assert.equal(wearableSleepQualityTier(40), 'poor');
  });

  it('returns empty result when tracker score is missing', () => {
    const segments: ISleepWearableSegment[] = [{
      startAt: new Date('2026-07-01T23:00:00'),
      endAt: new Date('2026-07-02T07:00:00'),
      stage: 'asleepCore',
      sourceName: 'Polar Flow',
      sourceBundleId: 'fi.polar.polarflow',
    }];

    const resolved = resolveWearableSleepQuality(segments, summary({
      totalSleepMinutes: 420,
      primarySourceBundleId: 'fi.polar.polarflow',
      stageMinutes: { asleepCore: 420 },
    }));

    assert.deepEqual(resolved, {});
  });

  it('prefers tracker score from primary source', () => {
    const segments: ISleepWearableSegment[] = [
      {
        startAt: new Date('2026-07-01T23:00:00'),
        endAt: new Date('2026-07-02T07:00:00'),
        stage: 'asleepCore',
        sourceName: 'Polar Flow',
        sourceBundleId: 'fi.polar.polarflow',
        trackerSleepScore: 84,
      },
      {
        startAt: new Date('2026-07-01T23:00:00'),
        endAt: new Date('2026-07-02T07:00:00'),
        stage: 'asleepCore',
        sourceName: 'Apple Watch',
        sourceBundleId: 'com.apple.health.watch',
        trackerSleepScore: 62,
      },
    ];

    const resolved = resolveWearableSleepQuality(segments, summary({
      totalSleepMinutes: 420,
      primarySourceBundleId: 'fi.polar.polarflow',
      stageMinutes: { asleepCore: 420 },
    }));

    assert.equal(resolved.sleepQualityScore, 84);
    assert.equal(resolved.sleepQualityTier, 'good');
  });
});
