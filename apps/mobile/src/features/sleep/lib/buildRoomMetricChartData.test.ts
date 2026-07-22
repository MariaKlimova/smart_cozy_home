import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildRoomMetricYDomain } from './buildRoomMetricChartData';

describe('buildRoomMetricYDomain', () => {
  it('uses default co2 scale when all points are within 300–1200', () => {
    const domain = buildRoomMetricYDomain(
      [
        { x: 0, y: 650 },
        { x: 0.5, y: 1100 },
        { x: 1, y: 720 },
      ],
      'co2',
    );

    assert.deepEqual(domain, { min: 300, max: 1200 });
  });

  it('keeps co2 min at 300 and expands max when data exceeds 1200', () => {
    const domain = buildRoomMetricYDomain(
      [
        { x: 0, y: 1100 },
        { x: 1, y: 1300 },
      ],
      'co2',
    );

    assert.deepEqual(domain, { min: 300, max: 1350 });
  });

  it('expands co2 max with 50 padding for a single high point', () => {
    const domain = buildRoomMetricYDomain([{ x: 0, y: 1250 }], 'co2');

    assert.deepEqual(domain, { min: 300, max: 1300 });
  });

  it('expands co2 min below 300 when data is very low', () => {
    const domain = buildRoomMetricYDomain([{ x: 0, y: 280 }], 'co2');

    assert.deepEqual(domain, { min: 230, max: 1200 });
  });

  it('uses default temperature scale when all points are within 14–26', () => {
    const domain = buildRoomMetricYDomain(
      [
        { x: 0, y: 17 },
        { x: 1, y: 20 },
      ],
      'temperature',
    );

    assert.deepEqual(domain, { min: 14, max: 26 });
  });

  it('keeps temperature min at 14 and expands max when data exceeds 26', () => {
    const domain = buildRoomMetricYDomain([{ x: 0, y: 28 }], 'temperature');

    assert.deepEqual(domain, { min: 14, max: 29 });
  });

  it('uses default humidity scale when all points are within 20–70', () => {
    const domain = buildRoomMetricYDomain([{ x: 0, y: 45 }], 'humidity');

    assert.deepEqual(domain, { min: 20, max: 70 });
  });

  it('keeps humidity min at 20 and expands max when data exceeds 70', () => {
    const domain = buildRoomMetricYDomain([{ x: 0, y: 75 }], 'humidity');

    assert.deepEqual(domain, { min: 20, max: 80 });
  });
});
