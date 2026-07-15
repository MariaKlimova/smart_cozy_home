import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { IHaEntityState } from '@/ha/types';

import { collectBedroomDeviceEntityIds, mapBedroomDevices } from './mapBedroomDevices';

function haState(
  entityId: string,
  state: string,
  attributes: Record<string, unknown> = {},
): IHaEntityState {
  return { entityId, state, attributes };
}

describe('mapBedroomDevices', () => {
  it('maps light brightness to percent', () => {
    const states = [haState('light.bedroom', 'on', { brightness: 128 })];
    const devices = mapBedroomDevices(states);
    const light = devices.find((d) => d.id === 'light');

    assert.ok(light);
    assert.equal(light.isAvailable, true);
    assert.equal(light.control, 'slider');
    if (light.value && 'current' in light.value) {
      assert.equal(light.value.current, 50);
      assert.equal(light.value.unit, '%');
    } else {
      assert.fail('expected slider value');
    }
  });

  it('maps air conditioner setpoint temperature when available', () => {
    const states = [
      haState('climate.bedroom_ac', 'cool', { temperature: 22, current_temperature: 24 }),
    ];
    const devices = mapBedroomDevices(states);
    const ac = devices.find((d) => d.id === 'air_conditioner');

    assert.ok(ac);
    assert.equal(ac.isAvailable, true);
    if (ac.value && 'current' in ac.value) {
      assert.equal(ac.value.current, 22);
    } else {
      assert.fail('expected climate slider value');
    }
  });

  it('falls back to current_temperature without setpoint', () => {
    const states = [haState('climate.bedroom_radiator', 'heat', { current_temperature: 20 })];
    const devices = mapBedroomDevices(states);
    const radiator = devices.find((d) => d.id === 'radiator');

    assert.ok(radiator);
    assert.equal(radiator.isAvailable, true);
    if (radiator.value && 'current' in radiator.value) {
      assert.equal(radiator.value.current, 20);
    } else {
      assert.fail('expected climate slider value');
    }
  });

  it('maps climate temperature below slider min without clamping', () => {
    const states = [haState('climate.bedroom_ventilation', 'heat', { current_temperature: 14 })];
    const devices = mapBedroomDevices(states);
    const ventilation = devices.find((d) => d.id === 'ventilation');

    assert.ok(ventilation);
    if (ventilation.value && 'current' in ventilation.value) {
      assert.equal(ventilation.value.current, 14);
    } else {
      assert.fail('expected climate slider value');
    }
  });

  it('maps cover position to closest segment', () => {
    const states = [haState('cover.bedroom_curtains', 'open', { current_position: 48 })];
    const devices = mapBedroomDevices(states);
    const curtains = devices.find((d) => d.id === 'curtains');

    assert.ok(curtains);
    if (curtains.value && 'activeOptionId' in curtains.value) {
      assert.equal(curtains.value.activeOptionId, 'half');
    } else {
      assert.fail('expected segmented value');
    }
  });

  it('maps humidifier toggle off', () => {
    const states = [haState('humidifier.bedroom', 'off')];
    const devices = mapBedroomDevices(states);
    const humidifier = devices.find((d) => d.id === 'humidifier');

    assert.ok(humidifier);
    if (humidifier.value && 'isOn' in humidifier.value) {
      assert.equal(humidifier.value.isOn, false);
    } else {
      assert.fail('expected toggle value');
    }
  });

  it('maps switch humidifier as toggle', () => {
    const states = [haState('switch.bedroom_humidifier', 'on')];
    const devices = mapBedroomDevices(states, {
      entities: { humidifier: 'switch.bedroom_humidifier' },
      hiddenSlots: [],
    });
    const humidifier = devices.find((d) => d.id === 'humidifier');

    assert.ok(humidifier);
    if (humidifier.value && 'isOn' in humidifier.value) {
      assert.equal(humidifier.value.isOn, true);
    } else {
      assert.fail('expected toggle value');
    }
  });

  it('falls back to switch humidifier when smart humidifier unavailable', () => {
    const states = [
      haState('humidifier.bedroom', 'unavailable'),
      haState('switch.bedroom_humidifier', 'on'),
    ];
    const devices = mapBedroomDevices(states);
    const humidifier = devices.find((d) => d.id === 'humidifier');

    assert.ok(humidifier);
    assert.equal(humidifier.isAvailable, true);
    if (humidifier.value && 'isOn' in humidifier.value) {
      assert.equal(humidifier.value.isOn, true);
    } else {
      assert.fail('expected toggle value');
    }
  });

  it('marks unavailable entities', () => {
    const states = [haState('light.bedroom', 'unavailable')];
    const devices = mapBedroomDevices(states);
    const light = devices.find((d) => d.id === 'light');

    assert.ok(light);
    assert.equal(light.isAvailable, false);
    assert.equal(light.value, undefined);
  });

  it('returns all devices unavailable when states are empty', () => {
    const devices = mapBedroomDevices([]);
    assert.equal(devices.length, 7);
    assert.ok(devices.every((d) => d.isAvailable === false));
  });

  it('does not expose entity_id in output', () => {
    const states = [haState('light.bedroom', 'on', { brightness: 255 })];
    const devices = mapBedroomDevices(states);
    const serialized = JSON.stringify(devices);

    assert.equal(serialized.includes('light.bedroom'), false);
    assert.equal(serialized.includes('entity'), false);
  });
});

describe('collectBedroomDeviceEntityIds', () => {
  it('returns configured bedroom device entities including humidifier fallback', () => {
    const ids = collectBedroomDeviceEntityIds();
    assert.deepEqual(ids, [
      'light.bedroom',
      'climate.bedroom_ac',
      'climate.bedroom_ventilation',
      'climate.bedroom_radiator',
      'cover.bedroom_curtains',
      'humidifier.bedroom',
      'switch.bedroom_humidifier',
      'cover.bedroom_window',
    ]);
  });
});
