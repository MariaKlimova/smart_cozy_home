import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { INightlightColorPreset } from './bedroomDevice.typings';
import { findNearestNightlightPresetId } from './nightlightColorPresets';

const PRESETS: INightlightColorPreset[] = [
  {
    id: 'color-0',
    displayRgb: [242, 145, 61],
    color: { kind: 'rgb', rgb: [242, 145, 61] },
  },
  {
    id: 'color-1',
    displayRgb: [134, 168, 249],
    color: { kind: 'rgb', rgb: [134, 168, 249] },
  },
];

describe('nightlightColorPresets', () => {
  it('finds nearest preset by rgb distance', () => {
    assert.equal(findNearestNightlightPresetId([240, 140, 60], PRESETS), 'color-0');
    assert.equal(findNearestNightlightPresetId([130, 170, 250], PRESETS), 'color-1');
  });

  it('returns undefined without rgb or presets', () => {
    assert.equal(findNearestNightlightPresetId(undefined, PRESETS), undefined);
    assert.equal(findNearestNightlightPresetId([1, 2, 3], []), undefined);
  });
});
