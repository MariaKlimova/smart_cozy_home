import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { TLightColorValue } from '@/domain/lightColor.typings';
import {
  DEFAULT_SLEEP_NIGHTLIGHT_COLOR,
  parseScenarioLightColor,
  serializeScenarioLightColor,
} from '@/ha/mappers/scenarioLightColor';

describe('scenarioLightColor', () => {
  it('round-trips rgb color', () => {
    const color: TLightColorValue = { kind: 'rgb', rgb: [134, 168, 249] };
    const parsed = parseScenarioLightColor(serializeScenarioLightColor(color));
    assert.ok(parsed);
    assert.deepEqual(parsed.color, color);
    assert.deepEqual(parsed.displayRgb, [134, 168, 249]);
  });

  it('parses color_temp_kelvin payload', () => {
    const parsed = parseScenarioLightColor('{"color_temp_kelvin":2700}');
    assert.ok(parsed);
    assert.equal(parsed.color.kind, 'color_temp_kelvin');
    if (parsed.color.kind === 'color_temp_kelvin') {
      assert.equal(parsed.color.kelvin, 2700);
    }
  });

  it('returns null for empty or placeholder states', () => {
    assert.equal(parseScenarioLightColor(''), null);
    assert.equal(parseScenarioLightColor('   '), null);
    assert.equal(parseScenarioLightColor('unknown'), null);
    assert.equal(parseScenarioLightColor('{}'), null);
  });

  it('returns null for invalid json', () => {
    assert.equal(parseScenarioLightColor('not-json'), null);
    assert.equal(parseScenarioLightColor('{"foo":1}'), null);
  });

  it('serializes default sleep color as rgb payload', () => {
    assert.equal(
      serializeScenarioLightColor(DEFAULT_SLEEP_NIGHTLIGHT_COLOR),
      '{"rgb_color":[242,145,61]}',
    );
  });
});
