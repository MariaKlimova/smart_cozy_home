import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { copy } from '@/copy/ru';

import { getBedroomStateTone, interpretBedroomState } from '@/features/now/lib/interpretState';

describe('interpretBedroomState', () => {
  it('uses day thresholds by default', () => {
    const phrase = interpretBedroomState({ co2Ppm: 900 });
    assert.equal(phrase, copy.now.phrases.slightlyStuffy);
  });

  it('uses sleep norms at night', () => {
    const phrase = interpretBedroomState(
      { co2Ppm: 1050, temperatureC: 20, humidityPct: 40 },
      { isNight: true },
    );
    assert.equal(phrase, copy.now.phrases.stuffyForSleep);
  });

  it('reports comfortable sleep conditions at night', () => {
    const phrase = interpretBedroomState(
      { co2Ppm: 750, temperatureC: 19, humidityPct: 45 },
      { isNight: true },
    );
    assert.equal(phrase, copy.now.phrases.comfortableForSleep);
  });

  it('syncs tone with night co2 priority', () => {
    const tone = getBedroomStateTone({ co2Ppm: 850, temperatureC: 24 }, { isNight: true });
    assert.equal(tone, 'air');
  });
});
