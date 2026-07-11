import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DEFAULT_NIGHT_SCHEDULE } from '@/domain/nightSchedule';
import { resolveNowSuggestion } from '@/domain/nowSuggestion';

const baseInput = {
  now: new Date(2026, 6, 9, 23, 30),
  nightSchedule: DEFAULT_NIGHT_SCHEDULE,
  activeScenarioId: 'none' as string | null,
  preparedScenarioId: null as string | null,
  bedroomReadings: {},
  bedroomDevices: [],
  gentleNotifications: [],
  dismissedGentleNotificationIds: [] as string[],
};

describe('resolveNowSuggestion', () => {
  it('prefers device action over scenario', () => {
    const suggestion = resolveNowSuggestion({
      ...baseInput,
      bedroomReadings: { co2Ppm: 1100 },
      bedroomDevices: [
        {
          id: 'window',
          isAvailable: true,
          control: 'segmented',
          activeOptionId: 'closed',
        },
      ],
    });

    assert.equal(suggestion.kind, 'device');
    if (suggestion.kind === 'device') {
      assert.equal(suggestion.actionId, 'bedroom:window:open');
    }
  });

  it('suggests sleep scenario at night when no device action', () => {
    const suggestion = resolveNowSuggestion({
      ...baseInput,
      activeScenarioId: 'none',
    });

    assert.equal(suggestion.kind, 'scenario');
    if (suggestion.kind === 'scenario') {
      assert.equal(suggestion.scenarioId, 'sleep');
    }
  });

  it('suggests morning scenario in morning window', () => {
    const suggestion = resolveNowSuggestion({
      ...baseInput,
      now: new Date(2026, 6, 10, 9, 0),
      activeScenarioId: 'none',
    });

    assert.equal(suggestion.kind, 'scenario');
    if (suggestion.kind === 'scenario') {
      assert.equal(suggestion.scenarioId, 'morning');
    }
  });

  it('returns none during day without device triggers', () => {
    const suggestion = resolveNowSuggestion({
      ...baseInput,
      now: new Date(2026, 6, 10, 14, 0),
      activeScenarioId: 'none',
    });

    assert.equal(suggestion.kind, 'none');
  });

  it('suggests humidifier when air is dry', () => {
    const suggestion = resolveNowSuggestion({
      ...baseInput,
      now: new Date(2026, 6, 10, 14, 0),
      bedroomReadings: { humidityPct: 25 },
      bedroomDevices: [
        {
          id: 'humidifier',
          isAvailable: true,
          control: 'toggle',
          isOn: false,
        },
      ],
    });

    assert.equal(suggestion.kind, 'device');
    if (suggestion.kind === 'device') {
      assert.equal(suggestion.actionId, 'bedroom:humidifier:on');
    }
  });

  it('skips sleep scenario when coming home is prepared', () => {
    const suggestion = resolveNowSuggestion({
      ...baseInput,
      activeScenarioId: 'none',
      preparedScenarioId: 'coming_home',
    });

    assert.equal(suggestion.kind, 'none');
  });

  it('skips scenario suggestion when it is already prepared', () => {
    const suggestion = resolveNowSuggestion({
      ...baseInput,
      activeScenarioId: 'none',
      preparedScenarioId: 'sleep',
    });

    assert.equal(suggestion.kind, 'none');
  });
});
