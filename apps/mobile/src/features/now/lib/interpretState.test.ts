import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { copy } from '@/copy/ru';

import {
  formatBedroomMetrics,
  getBedroomStateTone,
  interpretBedroomState,
} from '@/features/now/lib/interpretState';

describe('interpretBedroomState', () => {
  it('uses day thresholds by default', () => {
    const phrase = interpretBedroomState({ co2Ppm: 900 });
    assert.equal(phrase, copy.now.phrases.slightlyStuffy);
  });

  it('does not use sleep phrasing for warm temperature by day', () => {
    const phrase = interpretBedroomState({ temperatureC: 24 }, { isNight: false });
    assert.equal(phrase, copy.now.phrases.warmBedroom);
  });

  it('uses warm for sleep phrasing only at night', () => {
    const phrase = interpretBedroomState({ temperatureC: 24 }, { isNight: true });
    assert.equal(phrase, copy.now.phrases.warmForSleep);
  });

  it('prefers temperature over co2 at night', () => {
    const phrase = interpretBedroomState(
      { co2Ppm: 1050, temperatureC: 24, humidityPct: 40 },
      { isNight: true },
    );
    assert.equal(phrase, copy.now.phrases.warmForSleep);
  });

  it('uses sleep norms at night when temperature is ok', () => {
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

  it('syncs tone with night temperature priority', () => {
    const tone = getBedroomStateTone({ co2Ppm: 850, temperatureC: 24 }, { isNight: true });
    assert.equal(tone, 'warm');
  });
});

describe('formatBedroomMetrics', () => {
  it('returns four metrics in 2×2 order including pressure', () => {
    const metrics = formatBedroomMetrics({
      temperatureC: 20.4,
      humidityPct: 41.2,
      co2Ppm: 820.6,
      pressureMmhg: 748.2,
    });

    assert.deepEqual(
      metrics.map((m) => m.id),
      ['temperature', 'humidity', 'co2', 'pressure'],
    );
    assert.equal(metrics[0]?.value, '20°');
    assert.equal(metrics[1]?.value, '41%');
    assert.equal(metrics[2]?.value, '821');
    assert.equal(metrics[2]?.showPpmUnit, true);
    assert.equal(metrics[3]?.value, '748');
    assert.equal(metrics[3]?.showMmhgUnit, true);
    assert.equal(metrics[3]?.label, copy.now.metrics.pressure);
  });

  it('uses dash when pressure is missing', () => {
    const metrics = formatBedroomMetrics({ temperatureC: 20 });
    const pressure = metrics.find((m) => m.id === 'pressure');
    assert.equal(pressure?.value, copy.now.metricsUnavailable);
    assert.equal(pressure?.showMmhgUnit, true);
  });
});
