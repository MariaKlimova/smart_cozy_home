import { HA_ENTITIES } from '@/config/scenarioHaMapping';
import { MOCK_OUTDOOR_TEMPERATURE_FALLBACK } from '@/domain/mockRoomPhysics.const';
import {
  tickRoomPhysics,
  type IClimatePhysicsSnapshot,
  type IRoomPhysicsInput,
  type TClimatePhysicsRole,
} from '@/domain/mockRoomPhysics';
import {
  getMockEntitySnapshot,
  updateMockEntityState,
} from '@/ha/haMockStore';
import { tickSleepMaintainer } from '@/ha/mockSleepMaintainer';

const { devices } = HA_ENTITIES;

const CLIMATE_PHYSICS_ENTITIES: { role: TClimatePhysicsRole; entityId: string }[] = [
  { role: 'airConditioner', entityId: devices.airConditioner },
  { role: 'ventilation', entityId: devices.ventilation },
  { role: 'radiator', entityId: devices.radiator },
];

const CLIMATE_ENTITY_BY_ROLE = new Map<TClimatePhysicsRole, string>(
  CLIMATE_PHYSICS_ENTITIES.map((item) => [item.role, item.entityId]),
);

function parseNumericState(entityId: string, fallback: number): number {
  const snapshot = getMockEntitySnapshot(entityId);
  if (!snapshot) return fallback;
  const value = Number.parseFloat(snapshot.state);
  if (Number.isNaN(value)) return fallback;
  return value;
}

function readCoverPosition(entityId: string): number {
  const snapshot = getMockEntitySnapshot(entityId);
  if (!snapshot) return 0;
  const position = snapshot.attributes?.current_position;
  if (typeof position === 'number') return position;
  if (snapshot.state === 'open') return 100;
  if (snapshot.state === 'closed') return 0;
  return 0;
}

function readClimateSnapshot(
  role: TClimatePhysicsRole,
  entityId: string,
): IClimatePhysicsSnapshot {
  const snapshot = getMockEntitySnapshot(entityId);
  const setpoint =
    typeof snapshot?.attributes?.temperature === 'number'
      ? snapshot.attributes.temperature
      : 21;
  const current =
    typeof snapshot?.attributes?.current_temperature === 'number'
      ? snapshot.attributes.current_temperature
      : setpoint;
  return { role, setpoint, current };
}

function buildRoomPhysicsInput(): IRoomPhysicsInput {
  const ventilationSnapshot = getMockEntitySnapshot(devices.ventilation);
  const ventilationActive =
    ventilationSnapshot !== undefined &&
    ventilationSnapshot.state !== 'off' &&
    ventilationSnapshot.state !== 'unavailable';

  return {
    humidifierOn: getMockEntitySnapshot(devices.humidifier)?.state === 'on',
    windowPosition: readCoverPosition(devices.window),
    occupancyOn: getMockEntitySnapshot(devices.occupancy)?.state === 'on',
    ventilationActive,
    climates: CLIMATE_PHYSICS_ENTITIES.map(({ role, entityId }) =>
      readClimateSnapshot(role, entityId),
    ),
    humidityPct: parseNumericState(devices.humidity, 40),
    co2Ppm: parseNumericState(devices.co2, 650),
    outdoorTemperatureC: parseNumericState(
      devices.outdoorTemperature,
      MOCK_OUTDOOR_TEMPERATURE_FALLBACK,
    ),
  };
}

function applyRoomPhysicsOutput(output: ReturnType<typeof tickRoomPhysics>): void {
  for (const climate of output.climates) {
    const entityId = CLIMATE_ENTITY_BY_ROLE.get(climate.role);
    if (!entityId) continue;

    const snapshot = getMockEntitySnapshot(entityId);
    let state = snapshot?.state ?? 'heat';

    if (output.airConditionerOff && climate.role === 'airConditioner') {
      state = 'off';
    }

    updateMockEntityState(entityId, state, {
      ...(snapshot?.attributes ?? {}),
      temperature: climate.setpoint,
      current_temperature: climate.current,
      unit_of_measurement: '°C',
    });
  }

  updateMockEntityState(devices.humidity, output.humidityPct.toFixed(1), {
    unit_of_measurement: '%',
  });
  updateMockEntityState(devices.temperature, output.temperatureC.toFixed(1), {
    unit_of_measurement: '°C',
  });
  updateMockEntityState(devices.co2, Math.round(output.co2Ppm).toString(), {
    unit_of_measurement: 'ppm',
  });
}

/** Один шаг симуляции комнаты в mock-store */
export function tickMockRoom(): void {
  tickSleepMaintainer();
  const input = buildRoomPhysicsInput();
  const output = tickRoomPhysics(input);
  applyRoomPhysicsOutput(output);
}
