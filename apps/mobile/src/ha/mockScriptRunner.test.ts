import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';

import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import {
  getAllMockEntityStates,
  getMockEntitySnapshot,
  resetMockEntityStore,
  updateMockEntityState,
} from '@/ha/haMockStore';
import { mapPresence } from '@/ha/mappers/domainMapper';
import { mapScenarioHaState } from '@/ha/mappers/mapScenarioHaState';
import { runMockScript } from '@/ha/mockScriptRunner';

describe('runMockScript', () => {
  beforeEach(() => {
    resetMockEntityStore();
  });

  it('evening sets home_mode and dims light', () => {
    runMockScript(HA_ENTITIES.scripts.evening);

    const homeMode = getMockEntitySnapshot(HA_ENTITIES.system.homeMode);
    const light = getMockEntitySnapshot(HA_ENTITIES.devices.light);

    assert.equal(homeMode?.state, 'evening');
    assert.equal(light?.state, 'on');
    assert.equal(light?.attributes.brightness_pct, 15);
  });

  it('exit path via home_mode none after away then coming_home prepared flag', () => {
    runMockScript(HA_ENTITIES.scripts.away);

    assert.equal(getMockEntitySnapshot(HA_ENTITIES.system.homeMode)?.state, 'away');
    assert.equal(getMockEntitySnapshot('person.maria')?.state, 'not_home');

    runMockScript(HA_ENTITIES.scripts.comingHome);

    assert.equal(getMockEntitySnapshot(HA_ENTITIES.system.homeMode)?.state, 'none');
    assert.equal(getMockEntitySnapshot(HA_ENTITIES.system.homeReadyForArrival)?.state, 'on');
  });

  it('sleep turns light off and sets sleep mode', () => {
    runMockScript(HA_ENTITIES.scripts.sleep);

    assert.equal(getMockEntitySnapshot(HA_ENTITIES.system.homeMode)?.state, 'sleep');
    assert.equal(getMockEntitySnapshot(HA_ENTITIES.devices.light)?.state, 'off');
    assert.equal(getMockEntitySnapshot(HA_ENTITIES.devices.nightlight)?.state, 'on');
    assert.equal(getMockEntitySnapshot(HA_ENTITIES.devices.nightlight)?.attributes.brightness_pct, 8);
    assert.deepEqual(getMockEntitySnapshot(HA_ENTITIES.devices.nightlight)?.attributes.rgb_color, [
      242, 145, 61,
    ]);
  });

  it('sleep applies custom nightlight color from helper', () => {
    updateMockEntityState(
      HA_ENTITIES.scenarioParams.sleep.nightlightColor,
      '{"rgb_color":[134,168,249]}',
    );
    runMockScript(HA_ENTITIES.scripts.sleep);

    assert.deepEqual(getMockEntitySnapshot(HA_ENTITIES.devices.nightlight)?.attributes.rgb_color, [
      134, 168, 249,
    ]);
  });

  it('sleep turns nightlight off when the helper is disabled', () => {
    updateMockEntityState(HA_ENTITIES.scenarioParams.sleep.nightlight, 'off');
    runMockScript(HA_ENTITIES.scripts.sleep);

    assert.equal(getMockEntitySnapshot(HA_ENTITIES.devices.nightlight)?.state, 'off');
  });

  it('syncs activeScenarioId via mapScenarioHaState after evening', () => {
    runMockScript(HA_ENTITIES.scripts.evening);

    const states = getAllMockEntityStates();
    const presence = mapPresence(states);
    const { activeScenarioId } = mapScenarioHaState(states, presence);

    assert.equal(activeScenarioId, 'evening');
  });

  it('shows prepared only after away when nobody home', () => {
    runMockScript(HA_ENTITIES.scripts.away);
    runMockScript(HA_ENTITIES.scripts.comingHome);

    const states = getAllMockEntityStates();
    const presence = mapPresence(states);
    const { activeScenarioId, preparedScenarioId } = mapScenarioHaState(states, presence);

    assert.equal(activeScenarioId, null);
    assert.equal(preparedScenarioId, 'coming_home');
  });
});
