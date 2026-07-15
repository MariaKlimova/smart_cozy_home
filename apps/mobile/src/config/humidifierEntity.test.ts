import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getHumidifierEntityCandidates,
  pickHumidifierEntityId,
} from './humidifierEntity';

describe('humidifierEntity', () => {
  it('returns primary and fallback without override', () => {
    assert.deepEqual(getHumidifierEntityCandidates(null), [
      'humidifier.bedroom',
      'switch.bedroom_humidifier',
    ]);
  });

  it('returns only override when slot is customized', () => {
    assert.deepEqual(
      getHumidifierEntityCandidates({
        entities: { humidifier: 'switch.other_humidifier' },
        hiddenSlots: [],
      }),
      ['switch.other_humidifier'],
    );
  });

  it('prefers primary when both available', () => {
    const picked = pickHumidifierEntityId(
      ['humidifier.bedroom', 'switch.bedroom_humidifier'],
      (id) => (id === 'humidifier.bedroom' ? 'off' : 'on'),
    );
    assert.equal(picked, 'humidifier.bedroom');
  });

  it('falls back when primary unavailable', () => {
    const picked = pickHumidifierEntityId(
      ['humidifier.bedroom', 'switch.bedroom_humidifier'],
      (id) => (id === 'humidifier.bedroom' ? 'unavailable' : 'on'),
    );
    assert.equal(picked, 'switch.bedroom_humidifier');
  });

  it('returns primary when nobody available', () => {
    const picked = pickHumidifierEntityId(
      ['humidifier.bedroom', 'switch.bedroom_humidifier'],
      () => undefined,
    );
    assert.equal(picked, 'humidifier.bedroom');
  });
});
