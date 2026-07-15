import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
    extractDisplayRgbFromLightAttributes,
    getDefaultHaLightColorPresets,
    lightSupportsColorModes,
    normalizeHaLightFavoriteColors,
} from '@/ha/entityRegistry';
import {
    domainColorToHaPayload,
    haPayloadToDomainColor,
    mapHaLightPresetsToDomain,
} from '@/ha/mappers/lightColorMapper';

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

  it('builds HA-like default favorites for color+temp lights', () => {
    const presets = getDefaultHaLightColorPresets({
      supported_color_modes: ['hs', 'color_temp'],
      min_color_temp_kelvin: 2000,
      max_color_temp_kelvin: 6500,
    });

    // 4 color_temp + 4 rgb, как computeDefaultFavoriteColors в HA UI
    assert.equal(presets.length, 8);
    assert.ok(presets[0] && 'color_temp_kelvin' in presets[0].payload);
    assert.ok(presets[4] && 'rgb_color' in presets[4].payload);
  });

  it('extracts display RGB from light attributes including hs', () => {
    assert.deepEqual(
      extractDisplayRgbFromLightAttributes({ rgb_color: [10, 20, 30] }),
      [10, 20, 30],
    );
    assert.deepEqual(extractDisplayRgbFromLightAttributes({ hs_color: [240, 100] }), [0, 0, 255]);
  });

  it('detects color-capable lights from supported_color_modes', () => {
    assert.equal(lightSupportsColorModes({ supported_color_modes: ['brightness'] }), false);
    assert.equal(lightSupportsColorModes({ supported_color_modes: ['rgb'] }), true);
    assert.equal(lightSupportsColorModes(undefined), true);
  });
});

describe('lightColorMapper', () => {
  it('round-trips domain color ↔ HA payload', () => {
    const domain = haPayloadToDomainColor({ hs_color: [120, 50] });
    assert.deepEqual(domain, { kind: 'hs', hue: 120, saturation: 50 });
    assert.deepEqual(domainColorToHaPayload(domain), { hs_color: [120, 50] });
  });

  it('maps HA presets to domain with stable ids', () => {
    const presets = mapHaLightPresetsToDomain([
      { rgb: [242, 145, 61], payload: { rgb_color: [242, 145, 61] } },
      { rgb: [134, 168, 249], payload: { rgb_color: [134, 168, 249] } },
    ]);

    assert.equal(presets[0].id, 'color-0');
    assert.equal(presets[1].id, 'color-1');
    assert.deepEqual(presets[0].displayRgb, [242, 145, 61]);
    assert.deepEqual(presets[0].color, { kind: 'rgb', rgb: [242, 145, 61] });
  });
});
