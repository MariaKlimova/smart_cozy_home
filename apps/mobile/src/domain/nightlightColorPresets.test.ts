import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  findNearestNightlightPresetId,
  toNightlightColorPresets,
} from './nightlightColorPresets';

describe('nightlightColorPresets', () => {
  it('assigns stable ids from HA presets', () => {
    const presets = toNightlightColorPresets([
      { rgb: [242, 145, 61], payload: { rgb_color: [242, 145, 61] } },
      { rgb: [134, 168, 249], payload: { rgb_color: [134, 168, 249] } },
    ]);

    assert.equal(presets[0].id, 'color-0');
    assert.equal(presets[1].id, 'color-1');
    assert.deepEqual(presets[0].displayRgb, [242, 145, 61]);
  });

  it('finds nearest preset by rgb distance', () => {
    const presets = toNightlightColorPresets([
      { rgb: [242, 145, 61], payload: { rgb_color: [242, 145, 61] } },
      { rgb: [134, 168, 249], payload: { rgb_color: [134, 168, 249] } },
    ]);

    assert.equal(findNearestNightlightPresetId([240, 140, 60], presets), 'color-0');
    assert.equal(findNearestNightlightPresetId([130, 170, 250], presets), 'color-1');
  });
});
