import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';

import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import {
  SLEEP_CO2_MAINTAIN_BELOW,
  SLEEP_CO2_VENTILATE_ABOVE,
} from '@/domain/sleepAirQuality.const';
import {
  getMockEntitySnapshot,
  resetMockEntityStore,
  updateMockEntityState,
} from '@/ha/haMockStore';
import {
  getSleepMaintainerPhase,
  resetSleepMaintainer,
  startSleepMaintainer,
  tickSleepMaintainer,
} from '@/ha/mockSleepMaintainer';

const { devices, system, scenarioParams } = HA_ENTITIES;

function enableSleepMaintainerContext(): void {
  updateMockEntityState(system.homeMode, 'sleep');
  updateMockEntityState(scenarioParams.sleep.window, 'on');
  updateMockEntityState('binary_sensor.bedroom_occupancy', 'on');
}

describe('mockSleepMaintainer', () => {
  beforeEach(() => {
    resetMockEntityStore();
    resetSleepMaintainer();
  });

  it('startSleepMaintainer opens window and turns humidifier off', () => {
    enableSleepMaintainerContext();
    startSleepMaintainer();

    assert.equal(getSleepMaintainerPhase(), 'ventilating');
    assert.equal(getMockEntitySnapshot(devices.window)?.attributes?.current_position, 100);
    assert.equal(getMockEntitySnapshot(devices.humidifier)?.state, 'off');
    assert.equal(getMockEntitySnapshot(devices.airConditioner)?.state, 'off');
  });

  it('transitions to maintaining when co2 drops below threshold', () => {
    enableSleepMaintainerContext();
    startSleepMaintainer();
    updateMockEntityState(devices.co2, String(SLEEP_CO2_MAINTAIN_BELOW - 1));

    tickSleepMaintainer();

    assert.equal(getSleepMaintainerPhase(), 'maintaining');
    assert.equal(getMockEntitySnapshot(devices.window)?.attributes?.current_position, 0);
    assert.equal(getMockEntitySnapshot(devices.humidifier)?.state, 'on');
  });

  it('transitions back to ventilating when co2 rises above threshold', () => {
    enableSleepMaintainerContext();
    startSleepMaintainer();
    updateMockEntityState(devices.co2, String(SLEEP_CO2_MAINTAIN_BELOW - 1));
    tickSleepMaintainer();
    updateMockEntityState(devices.co2, String(SLEEP_CO2_VENTILATE_ABOVE + 1));

    tickSleepMaintainer();

    assert.equal(getSleepMaintainerPhase(), 'ventilating');
    assert.equal(getMockEntitySnapshot(devices.window)?.attributes?.current_position, 100);
    assert.equal(getMockEntitySnapshot(devices.humidifier)?.state, 'off');
  });

  it('resets when home_mode leaves sleep', () => {
    enableSleepMaintainerContext();
    startSleepMaintainer();
    updateMockEntityState(system.homeMode, 'morning');

    tickSleepMaintainer();

    assert.equal(getSleepMaintainerPhase(), null);
  });
});
