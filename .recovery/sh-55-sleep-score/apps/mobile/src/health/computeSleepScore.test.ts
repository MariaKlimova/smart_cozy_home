import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { computeDurationScore, clinicalDurationScore } from '@/health/computeDurationScore';
import { computeEfficiencyScore } from '@/health/computeEfficiencyScore';
import { computeContinuityScore } from '@/health/computeContinuityScore';
import { computeConsistencyScore } from '@/health/computeConsistencyScore';
import { computeSleepScore } from '@/health/computeSleepScore';
import { aggregateSleepScoreTrend } from '@/health/aggregateSleepScoreTrend';
import type { ISleepScoreNightInput } from '@/health/sleepScore.typings';

function night(
  nightDate: string,
  totalSleepMinutes: number,
  extras: Partial<ISleepScoreNightInput> = {},
): ISleepScoreNightInput {
  return {
    nightDate,
    totalSleepMinutes,
    timeInBedMinutes: totalSleepMinutes + 20,
    wasoMinutes: 10,
    awakeningCount: 1,
    continuityHasSignal: true,
    fellAsleepAt: new Date(`${nightDate}T23:00:00`),
    wokeAt: new Date(`${nightDate}T07:00:00`),
    ...extras,
  };
}

describe('clinicalDurationScore adult', () => {
  it('returns 0 below 4h', () => {
    assert.equal(clinicalDurationScore(200, 'adult'), 0);
  });

  it('interpolates 4–6h to 0–60', () => {
    assert.equal(clinicalDurationScore(240, 'adult'), 0);
    assert.equal(clinicalDurationScore(360, 'adult'), 60);
  });

  it('interpolates 6–7h to 60–100', () => {
    assert.equal(clinicalDurationScore(420, 'adult'), 100);
  });

  it('full score 7–9h', () => {
    assert.equal(clinicalDurationScore(480, 'adult'), 100);
    assert.equal(clinicalDurationScore(540, 'adult'), 100);
  });

  it('soft penalty above 9h with floor 30', () => {
    assert.equal(clinicalDurationScore(600, 'adult'), 85);
    assert.equal(clinicalDurationScore(720, 'adult'), 30);
    assert.equal(clinicalDurationScore(800, 'adult'), 30);
  });
});

describe('computeDurationScore baseline', () => {
  it('adds +10 when close to baseline', () => {
    const score = computeDurationScore({
      tstMinutes: 360,
      baselineMinutes: 360,
      applyBaselineModifier: true,
    });
    assert.equal(score, 70);
  });

  it('does not apply baseline in cold start', () => {
    const score = computeDurationScore({
      tstMinutes: 360,
      baselineMinutes: 360,
      applyBaselineModifier: false,
    });
    assert.equal(score, 60);
  });

  it('clamps at 100 with baseline bonus', () => {
    const score = computeDurationScore({
      tstMinutes: 480,
      baselineMinutes: 480,
      applyBaselineModifier: true,
    });
    assert.equal(score, 100);
  });
});

describe('computeEfficiencyScore', () => {
  it('returns null without time in bed', () => {
    assert.equal(computeEfficiencyScore(400, undefined), null);
  });

  it('returns 0 below 70%', () => {
    assert.equal(computeEfficiencyScore(60, 100), 0);
  });

  it('returns 100 at 95%+', () => {
    assert.equal(computeEfficiencyScore(95, 100), 100);
  });

  it('interpolates 70–95%', () => {
    const mid = computeEfficiencyScore(82.5, 100);
    assert.equal(mid, 50);
  });
});

describe('computeContinuityScore', () => {
  it('returns 100 for good WASO and awakenings', () => {
    assert.equal(computeContinuityScore(10, 1), 100);
  });

  it('returns 0 for poor WASO or awakenings', () => {
    assert.equal(computeContinuityScore(40, 1), 0);
    assert.equal(computeContinuityScore(10, 4), 0);
  });
});

describe('computeConsistencyScore', () => {
  it('returns null with fewer than 2 nights', () => {
    assert.equal(
      computeConsistencyScore([new Date('2026-07-01T23:00:00')], [new Date('2026-07-02T07:00:00')]),
      null,
    );
  });

  it('returns 100 for stable schedule', () => {
    const beds = [
      new Date('2026-07-01T23:00:00'),
      new Date('2026-07-02T23:05:00'),
      new Date('2026-07-03T22:55:00'),
    ];
    const wakes = [
      new Date('2026-07-02T07:00:00'),
      new Date('2026-07-03T07:05:00'),
      new Date('2026-07-04T06:55:00'),
    ];
    const score = computeConsistencyScore(beds, wakes);
    assert.ok(score !== null);
    assert.ok((score as number) >= 90);
  });
});

describe('computeSleepScore', () => {
  it('uses cold start without consistency for fewer than 7 nights', () => {
    const nights = Array.from({ length: 3 }, (_, index) =>
      night(`2026-07-0${index + 1}`, 480),
    );
    const result = computeSleepScore({ nights, nightIndex: 2 });
    assert.equal(result.isColdStart, true);
    assert.equal(result.components.consistency, null);
    assert.equal(result.belowRecommendedNorm, false);
  });

  it('flags below recommended norm', () => {
    const nights = [night('2026-07-01', 360)];
    const result = computeSleepScore({ nights, nightIndex: 0 });
    assert.equal(result.belowRecommendedNorm, true);
  });

  it('skips efficiency and continuity without signal', () => {
    const nights = [
      night('2026-07-01', 400, {
        timeInBedMinutes: undefined,
        wasoMinutes: 0,
        awakeningCount: 0,
        continuityHasSignal: false,
      }),
    ];
    const result = computeSleepScore({ nights, nightIndex: 0 });
    assert.equal(result.components.efficiency, null);
    assert.equal(result.components.continuity, null);
  });

  it('applies consistency after 7 nights', () => {
    const nights = Array.from({ length: 7 }, (_, index) => {
      const day = String(index + 1).padStart(2, '0');
      return night(`2026-07-${day}`, 480);
    });
    const result = computeSleepScore({ nights, nightIndex: 6 });
    assert.equal(result.isColdStart, false);
    assert.ok(result.components.consistency !== null);
  });
});

describe('aggregateSleepScoreTrend', () => {
  it('averages last N night scores', () => {
    const nights = Array.from({ length: 10 }, (_, index) => {
      const day = String(index + 1).padStart(2, '0');
      return night(`2026-07-${day}`, 480);
    });
    const scores = nights.map((_, nightIndex) =>
      computeSleepScore({ nights, nightIndex }),
    );
    const trend7 = aggregateSleepScoreTrend(scores, 7);
    assert.ok(trend7);
    assert.equal(trend7?.nightCount, 7);
    assert.equal(trend7?.trendDays, 7);
  });
});
