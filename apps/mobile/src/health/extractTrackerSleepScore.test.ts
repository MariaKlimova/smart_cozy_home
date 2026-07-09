import { extractTrackerSleepScoreFromMetadata } from '@/health/extractTrackerSleepScore';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('extractTrackerSleepScoreFromMetadata', () => {
  it('reads known sleep score keys', () => {
    assert.equal(extractTrackerSleepScoreFromMetadata({ SleepScore: 82 }), 82);
    assert.equal(extractTrackerSleepScoreFromMetadata({ sleep_score: '76' }), 76);
  });

  it('reads keys containing score or quality', () => {
    assert.equal(extractTrackerSleepScoreFromMetadata({ polar_sleep_quality: 71 }), 71);
  });

  it('normalizes 0-10 scale for sleep-specific keys', () => {
    assert.equal(extractTrackerSleepScoreFromMetadata({ sleep_score: 8.2 }), 82);
    assert.equal(extractTrackerSleepScoreFromMetadata({ polar_sleep_quality: 6.6 }), 66);
  });

  it('ignores unrelated score metadata keys', () => {
    assert.equal(extractTrackerSleepScoreFromMetadata({ score: 8.2 }), undefined);
    assert.equal(extractTrackerSleepScoreFromMetadata({ quality: 66 }), undefined);
  });

  it('returns undefined for unrelated metadata', () => {
    assert.equal(extractTrackerSleepScoreFromMetadata({ foo: 'bar' }), undefined);
    assert.equal(extractTrackerSleepScoreFromMetadata(undefined), undefined);
  });
});
