import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CONTEXTUAL_SCENARIO_DAY_START_HOUR,
  CONTEXTUAL_SCENARIO_SLEEP_START_HOUR,
  getContextualScenarioId,
} from './getContextualScenarioId';

describe('getContextualScenarioId', () => {
  it('до 11:00 возвращает morning', () => {
    const id = getContextualScenarioId(new Date(2026, 5, 26, 10, 30));
    assert.equal(id, 'morning');
  });

  it('с 11:00 до 21:00 не предлагает сценарий', () => {
    const dayStart = getContextualScenarioId(
      new Date(2026, 5, 26, CONTEXTUAL_SCENARIO_DAY_START_HOUR, 0),
    );
    const beforeSleep = getContextualScenarioId(
      new Date(2026, 5, 26, CONTEXTUAL_SCENARIO_SLEEP_START_HOUR - 1, 59),
    );
    assert.equal(dayStart, null);
    assert.equal(beforeSleep, null);
  });

  it('с 21:00 возвращает sleep', () => {
    const id = getContextualScenarioId(
      new Date(2026, 5, 26, CONTEXTUAL_SCENARIO_SLEEP_START_HOUR, 0),
    );
    assert.equal(id, 'sleep');
  });
});
