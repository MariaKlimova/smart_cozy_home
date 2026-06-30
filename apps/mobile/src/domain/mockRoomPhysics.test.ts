import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import { tickRoomPhysics } from '@/domain/mockRoomPhysics';

const AC = HA_ENTITIES.devices.airConditioner;

describe('tickRoomPhysics', () => {
  it('raises humidity when humidifier is on and window closed', () => {
    const result = tickRoomPhysics({
      humidifierOn: true,
      windowPosition: 0,
      occupancyOn: true,
      ventilationActive: false,
      climates: [{ entityId: AC, setpoint: 21, current: 20 }],
      humidityPct: 38,
      co2Ppm: 650,
      outdoorTemperatureC: 5,
      airConditionerEntityId: AC,
    });

    assert.ok(result.humidityPct > 38);
  });

  it('drops humidity when window open even with humidifier on', () => {
    const result = tickRoomPhysics({
      humidifierOn: true,
      windowPosition: 100,
      occupancyOn: false,
      ventilationActive: false,
      climates: [{ entityId: AC, setpoint: 21, current: 20 }],
      humidityPct: 38,
      co2Ppm: 650,
      outdoorTemperatureC: 5,
      airConditionerEntityId: AC,
    });

    assert.ok(result.humidityPct < 38);
    assert.equal(result.airConditionerOff, true);
  });

  it('raises co2 slowly when window closed without occupancy', () => {
    const result = tickRoomPhysics({
      humidifierOn: false,
      windowPosition: 0,
      occupancyOn: false,
      ventilationActive: false,
      climates: [{ entityId: AC, setpoint: 18, current: 20 }],
      humidityPct: 40,
      co2Ppm: 500,
      outdoorTemperatureC: 12,
      airConditionerEntityId: AC,
    });

    assert.ok(result.co2Ppm > 500);
  });

  it('moves climate current toward setpoint when window closed', () => {
    const result = tickRoomPhysics({
      humidifierOn: false,
      windowPosition: 0,
      occupancyOn: false,
      ventilationActive: false,
      climates: [{ entityId: AC, setpoint: 18, current: 20 }],
      humidityPct: 40,
      co2Ppm: 500,
      outdoorTemperatureC: 12,
      airConditionerEntityId: AC,
    });

    assert.ok(result.climates[0].current < 20);
    assert.equal(result.temperatureC, result.climates[0].current);
  });

  it('warms room toward outdoor temp when window open in summer', () => {
    const result = tickRoomPhysics({
      humidifierOn: false,
      windowPosition: 100,
      occupancyOn: false,
      ventilationActive: false,
      climates: [{ entityId: AC, setpoint: 17, current: 20 }],
      humidityPct: 40,
      co2Ppm: 800,
      outdoorTemperatureC: 28,
      airConditionerEntityId: AC,
    });

    assert.ok(result.climates[0].current > 20);
  });
});
