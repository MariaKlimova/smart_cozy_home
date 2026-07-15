import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  findNearestHaLightColorPreset,
  normalizeHaLightFavoriteColors,
} from '@/ha/entityRegistry';

describe('entityRegistry', () => {
  it('normalizes supported HA favorite color payloads', () => {
    const presets = normalizeHaLightFavoriteColors([
      { rgb_color: [242, 145, 61] },
      { hs_color: [240, 100] },
      { color_temp_kelvin: 2700 },
      { rgbw_color: [10, 20, 30, 40] },
      { rgbww_color: [10, 20, 30, 40, 50] },
    ]);

    assert.equal(presets.length, 5);
    assert.deepEqual(presets[0]?.rgb, [242, 145, 61]);
    assert.deepEqual(presets[1]?.rgb, [0, 0, 255]);
  });

  it('finds the preset nearest to the current light color', () => {
    const presets = normalizeHaLightFavoriteColors([
      { rgb_color: [242, 145, 61] },
      { rgb_color: [134, 168, 249] },
    ]);

    const nearest = findNearestHaLightColorPreset(
      {
        entityId: 'light.bedroom_nightlight',
        state: 'on',
        attributes: { rgb_color: [240, 150, 70] },
      },
      presets,
    );

    assert.deepEqual(nearest?.payload, { rgb_color: [242, 145, 61] });
  });
});
