import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ISleepNightWindow, ISleepSensorSample } from '@/domain/sleepNight.typings';

import { scoreSleepNight } from './scoreSleepNight';

function buildWindow(overrides?: Partial<ISleepNightWindow>): ISleepNightWindow {
  return {
    nightDate: '2026-07-01',
    weekdayId: 'wed',
    startAt: new Date('2026-07-01T23:00:00'),
    endAt: new Date('2026-07-02T08:00:00'),
    hasScenarioData: true,
    ...overrides,
  };
}

function sampleAt(iso: string, values: Partial<ISleepSensorSample>): ISleepSensorSample {
  return {
    timestamp: new Date(iso),
    ...values,
  };
}

describe('scoreSleepNight', () => {
  it('returns no_data when scenario did not run', () => {
    const result = scoreSleepNight(
      buildWindow({ hasScenarioData: false }),
      [sampleAt('2026-07-02T01:00:00', { co2Ppm: 700 })],
    );
    assert.equal(result.score, 'no_data');
    assert.equal(result.hasData, false);
  });

  it('returns no_data when there are no sensor samples', () => {
    const result = scoreSleepNight(buildWindow(), []);
    assert.equal(result.score, 'no_data');
    assert.equal(result.hasData, false);
  });

  it('scores good night with comfortable readings', () => {
    const samples = [
      sampleAt('2026-07-02T00:00:00', { co2Ppm: 650, temperatureC: 18, humidityPct: 50 }),
      sampleAt('2026-07-02T03:00:00', { co2Ppm: 700, temperatureC: 19, humidityPct: 48 }),
      sampleAt('2026-07-02T06:00:00', { co2Ppm: 720, temperatureC: 18.5, humidityPct: 52 }),
    ];

    const result = scoreSleepNight(buildWindow(), samples);
    assert.equal(result.score, 'good');
    assert.equal(result.co2MinPpm, 650);
    assert.equal(result.co2MaxPpm, 720);
    assert.equal(result.tempAvgC, 18.5);
    assert.equal(result.humidityAvgPct, 50);
    assert.deepEqual(result.issues, []);
  });

  it('flags co2 spike longer than 30 minutes as fair', () => {
    const samples = [
      sampleAt('2026-07-02T01:00:00', { co2Ppm: 1100, temperatureC: 18, humidityPct: 50 }),
      sampleAt('2026-07-02T02:00:00', { co2Ppm: 1150, temperatureC: 18, humidityPct: 50 }),
    ];

    const result = scoreSleepNight(buildWindow(), samples);
    assert.equal(result.score, 'fair');
    assert.deepEqual(result.issues, ['co2High']);
  });

  it('flags cold temperature as fair', () => {
    const samples = [
      sampleAt('2026-07-02T02:00:00', { co2Ppm: 700, temperatureC: 15, humidityPct: 50 }),
    ];

    const result = scoreSleepNight(buildWindow(), samples);
    assert.equal(result.score, 'fair');
    assert.deepEqual(result.issues, ['tempLow']);
  });

  it('flags dry air longer than one hour as fair', () => {
    const samples = [
      sampleAt('2026-07-02T00:30:00', { co2Ppm: 700, temperatureC: 18, humidityPct: 25 }),
      sampleAt('2026-07-02T02:30:00', { co2Ppm: 700, temperatureC: 18, humidityPct: 24 }),
    ];

    const result = scoreSleepNight(buildWindow(), samples);
    assert.equal(result.score, 'fair');
    assert.deepEqual(result.issues, ['humidityLow']);
  });

  it('scores poor when multiple deviations exist', () => {
    const samples = [
      sampleAt('2026-07-02T01:00:00', { co2Ppm: 1200, temperatureC: 23, humidityPct: 50 }),
      sampleAt('2026-07-02T02:30:00', { co2Ppm: 1250, temperatureC: 23.5, humidityPct: 50 }),
    ];

    const result = scoreSleepNight(buildWindow(), samples);
    assert.equal(result.score, 'poor');
    assert.equal(result.issues.length, 2);
    assert.ok(result.issues.includes('co2High'));
    assert.ok(result.issues.includes('tempHigh'));
  });
});
