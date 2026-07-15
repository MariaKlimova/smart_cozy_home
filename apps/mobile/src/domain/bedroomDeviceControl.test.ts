import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveBedroomDeviceServiceCall } from './bedroomDeviceControl';

describe('resolveBedroomDeviceServiceCall', () => {
  it('maps light brightness to turn_on with brightness', () => {
    const call = resolveBedroomDeviceServiceCall('light', { kind: 'slider', value: 50 });

    assert.equal(call.domain, 'light');
    assert.equal(call.service, 'turn_on');
    assert.equal(call.data.entity_id, 'light.bedroom');
    assert.equal(call.data.brightness, 128);
  });

  it('maps light 0% to turn_off', () => {
    const call = resolveBedroomDeviceServiceCall('light', { kind: 'slider', value: 0 });

    assert.equal(call.domain, 'light');
    assert.equal(call.service, 'turn_off');
    assert.equal(call.data.entity_id, 'light.bedroom');
    assert.equal(call.data.brightness, undefined);
  });

  it('maps air conditioner to set_temperature', () => {
    const call = resolveBedroomDeviceServiceCall('air_conditioner', { kind: 'slider', value: 22 });

    assert.equal(call.domain, 'climate');
    assert.equal(call.service, 'set_temperature');
    assert.equal(call.data.entity_id, 'climate.bedroom_ac');
    assert.equal(call.data.temperature, 22);
  });

  it('maps radiator to set_temperature', () => {
    const call = resolveBedroomDeviceServiceCall('radiator', { kind: 'slider', value: 21 });

    assert.equal(call.domain, 'climate');
    assert.equal(call.service, 'set_temperature');
    assert.equal(call.data.entity_id, 'climate.bedroom_radiator');
    assert.equal(call.data.temperature, 21);
  });

  it('maps curtains segment to cover position', () => {
    const call = resolveBedroomDeviceServiceCall('curtains', {
      kind: 'segment',
      optionId: 'half',
    });

    assert.equal(call.domain, 'cover');
    assert.equal(call.service, 'set_cover_position');
    assert.equal(call.data.entity_id, 'cover.bedroom_curtains');
    assert.equal(call.data.position, 50);
  });

  it('maps humidifier toggle on', () => {
    const call = resolveBedroomDeviceServiceCall('humidifier', { kind: 'toggle', isOn: true });

    assert.equal(call.domain, 'humidifier');
    assert.equal(call.service, 'turn_on');
    assert.equal(call.data.entity_id, 'humidifier.bedroom');
  });

  it('maps switch humidifier toggle using entity domain', () => {
    const overrides = { entities: { humidifier: 'switch.bedroom_humidifier' }, hiddenSlots: [] };
    const call = resolveBedroomDeviceServiceCall(
      'humidifier',
      { kind: 'toggle', isOn: false },
      overrides,
    );

    assert.equal(call.domain, 'switch');
    assert.equal(call.service, 'turn_off');
    assert.equal(call.data.entity_id, 'switch.bedroom_humidifier');
  });

  it('falls back to switch humidifier when smart humidifier unavailable', () => {
    const call = resolveBedroomDeviceServiceCall(
      'humidifier',
      { kind: 'toggle', isOn: false },
      null,
      {
        states: [
          { entityId: 'humidifier.bedroom', state: 'unavailable', attributes: {} },
          { entityId: 'switch.bedroom_humidifier', state: 'on', attributes: {} },
        ],
      },
    );

    assert.equal(call.domain, 'switch');
    assert.equal(call.service, 'turn_off');
    assert.equal(call.data.entity_id, 'switch.bedroom_humidifier');
  });

  it('maps nightlight color_light to turn_on with rgb', () => {
    const call = resolveBedroomDeviceServiceCall('nightlight', {
      kind: 'color_light',
      brightness: 40,
      colorPresetId: 'color-0',
      haColor: { rgb_color: [242, 145, 61] },
    });

    assert.equal(call.domain, 'light');
    assert.equal(call.service, 'turn_on');
    assert.equal(call.data.entity_id, 'light.bedroom_nightlight');
    assert.equal(call.data.brightness, 102);
    assert.deepEqual(call.data.rgb_color, [242, 145, 61]);
  });

  it('maps nightlight 0% to turn_off', () => {
    const call = resolveBedroomDeviceServiceCall('nightlight', {
      kind: 'color_light',
      brightness: 0,
      colorPresetId: 'color-0',
      haColor: { rgb_color: [242, 145, 61] },
    });

    assert.equal(call.domain, 'light');
    assert.equal(call.service, 'turn_off');
    assert.equal(call.data.entity_id, 'light.bedroom_nightlight');
  });

  it('throws for unknown device', () => {
    assert.throws(
      () => resolveBedroomDeviceServiceCall('unknown', { kind: 'toggle', isOn: true }),
      /Unknown bedroom device/,
    );
  });
});
