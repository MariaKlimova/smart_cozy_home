import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  parseWeatherConditionFromHaState,
  weatherConditionIcon,
} from '@/features/now/lib/parseWeatherCondition';

describe('parseWeatherConditionFromHaState', () => {
  it('parses known weather states', () => {
    assert.equal(
      parseWeatherConditionFromHaState({
        entityId: 'weather.forecast_home_assistant',
        state: 'rainy',
        attributes: {},
      }),
      'rainy',
    );
  });

  it('ignores unavailable and unknown states', () => {
    assert.equal(
      parseWeatherConditionFromHaState({
        entityId: 'weather.forecast_home_assistant',
        state: 'unavailable',
        attributes: {},
      }),
      undefined,
    );
  });

  it('ignores non-standard states', () => {
    assert.equal(
      parseWeatherConditionFromHaState({
        entityId: 'weather.forecast_home_assistant',
        state: 'alien-storm',
        attributes: {},
      }),
      undefined,
    );
  });
});

describe('weatherConditionIcon', () => {
  it('maps rainy to rain emoji and falls back when missing', () => {
    assert.equal(weatherConditionIcon('rainy'), '🌧');
    assert.equal(weatherConditionIcon(undefined), '🌤');
  });
});
