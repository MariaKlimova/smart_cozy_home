import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ISleepNightWindow, ISleepSensorSample } from '@/domain/sleepNight.typings';

import { computeMetricNormPercent } from './computeMetricNormPercent';

function buildWindow(): ISleepNightWindow {
  return {
    nightDate: '2026-07-01',
    weekdayId: 'wed',
    startAt: new Date('2026-07-01T23:00:00'),
    endAt: new Date('2026-07-02T08:00:00'),
    hasScenarioData: true,
  };
}

function sampleAt(iso: string, values: Partial<ISleepSensorSample>): ISleepSensorSample {
  return {
    timestamp: new Date(iso),
    ...values,
  };
}

describe('computeMetricNormPercent', () => {
  it('returns 100 when co2 stays in norm all night', () => {
    const samples = [
      sampleAt('2026-07-01T23:00:00', { co2Ppm: 650 }),
      sampleAt('2026-07-02T04:00:00', { co2Ppm: 700 }),
      sampleAt('2026-07-02T07:00:00', { co2Ppm: 720 }),
    ];

    const percent = computeMetricNormPercent(samples, buildWindow(), 'co2');
    assert.equal(percent, 100);
  });

  it('returns ~50 when co2 is above norm half the night', () => {
    const samples = [
      sampleAt('2026-07-01T23:00:00', { co2Ppm: 1100 }),
      sampleAt('2026-07-02T03:30:00', { co2Ppm: 650 }),
    ];

    const percent = computeMetricNormPercent(samples, buildWindow(), 'co2');
    assert.ok(percent !== null);
    assert.ok(percent >= 45 && percent <= 55);
  });

  it('returns null when metric has no samples', () => {
    const samples = [sampleAt('2026-07-02T01:00:00', { temperatureC: 18 })];

    const percent = computeMetricNormPercent(samples, buildWindow(), 'co2');
    assert.equal(percent, null);
  });

  it('returns 100 for comfortable temperature all night', () => {
    const samples = [
      sampleAt('2026-07-01T23:00:00', { temperatureC: 18 }),
      sampleAt('2026-07-02T04:00:00', { temperatureC: 19 }),
      sampleAt('2026-07-02T07:00:00', { temperatureC: 20 }),
    ];

    const percent = computeMetricNormPercent(samples, buildWindow(), 'temperature');
    assert.equal(percent, 100);
  });

  it('returns 100 for humidity above minimum all night', () => {
    const samples = [
      sampleAt('2026-07-01T23:00:00', { humidityPct: 45 }),
      sampleAt('2026-07-02T04:00:00', { humidityPct: 42 }),
    ];

    const percent = computeMetricNormPercent(samples, buildWindow(), 'humidity');
    assert.equal(percent, 100);
  });
});
